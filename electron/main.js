const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true
    },
    icon: path.join(__dirname, '../build/icon.png'),
    title: '⏰ Minit'
  });

  // 개발 모드와 프로덕션 모드 구분
  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Electron 앱이 준비되면 윈도우 생성
app.whenReady().then(createWindow);

// 모든 윈도우가 닫히면 앱 종료 (macOS 제외)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// macOS에서 dock 아이콘 클릭 시 윈도우 재생성
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 데이터 저장 경로 함수
function getDataPath() {
  // 실행 파일이 있는 폴더의 data 디렉토리
  const exePath = app.getPath('exe');
  const exeDir = path.dirname(exePath);
  return path.join(exeDir, 'data');
}

function getSessionsFilePath() {
  return path.join(getDataPath(), 'minit-sessions.json');
}

function getMemosFilePath() {
  return path.join(getDataPath(), 'minit-memos.json');
}

// 기존 메모 파일 경로 (마이그레이션용)
function getLegacyMemoFilePath() {
  return path.join(getDataPath(), 'minit-memo.json');
}

function getTagsFilePath() {
  return path.join(getDataPath(), 'minit-tags.json');
}

function getDarkModeFilePath() {
  return path.join(getDataPath(), 'minit-darkmode.json');
}

function getDontAskDeleteFilePath() {
  return path.join(getDataPath(), 'minit-dont-ask-delete.json');
}

// data 폴더 생성 (없으면)
function ensureDataDirectory() {
  const dataPath = getDataPath();
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true });
  }
}

// 세션 저장
ipcMain.handle('save-sessions', async (event, sessions) => {
  try {
    ensureDataDirectory();
    const filePath = getSessionsFilePath();
    fs.writeFileSync(filePath, JSON.stringify(sessions, null, 2), 'utf-8');
    return { success: true, path: filePath };
  } catch (error) {
    console.error('세션 저장 실패:', error);
    return { success: false, error: error.message };
  }
});

// 세션 로드
ipcMain.handle('load-sessions', async () => {
  try {
    const filePath = getSessionsFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return { success: true, data: JSON.parse(data) };
    }
    return { success: true, data: [] }; // 파일 없으면 빈 배열
  } catch (error) {
    console.error('세션 로드 실패:', error);
    return { success: false, error: error.message, data: [] };
  }
});

// 데이터 경로 가져오기
ipcMain.handle('get-data-path', async () => {
  return getDataPath();
});

// Always on Top 토글
ipcMain.handle('toggle-always-on-top', async () => {
  if (mainWindow) {
    const currentState = mainWindow.isAlwaysOnTop();
    mainWindow.setAlwaysOnTop(!currentState);
    return !currentState;
  }
  return false;
});

// Always on Top 상태 조회
ipcMain.handle('get-always-on-top', async () => {
  if (mainWindow) {
    return mainWindow.isAlwaysOnTop();
  }
  return false;
});

// 윈도우 크기 설정
ipcMain.handle('set-window-size', async (event, width, height, minWidth, minHeight) => {
  if (mainWindow) {
    // 최소 크기 설정 (전달된 경우)
    if (minWidth && minHeight) {
      mainWindow.setMinimumSize(minWidth, minHeight);
    }
    mainWindow.setSize(width, height);
    mainWindow.center(); // 화면 중앙으로 이동
    return { success: true };
  }
  return { success: false };
});

// 메모 저장 (배열)
ipcMain.handle('save-memos', async (event, memos) => {
  try {
    ensureDataDirectory();
    const filePath = getMemosFilePath();
    fs.writeFileSync(filePath, JSON.stringify(memos, null, 2), 'utf-8');
    return { success: true, path: filePath };
  } catch (error) {
    console.error('메모 저장 실패:', error);
    return { success: false, error: error.message };
  }
});

// 메모 로드 (배열, 마이그레이션 지원)
ipcMain.handle('load-memos', async () => {
  try {
    const filePath = getMemosFilePath();
    const legacyFilePath = getLegacyMemoFilePath();

    // 새 형식 파일이 있으면 그대로 로드
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return { success: true, data: JSON.parse(data) };
    }

    // 기존 단일 메모 파일이 있으면 마이그레이션
    if (fs.existsSync(legacyFilePath)) {
      const data = fs.readFileSync(legacyFilePath, 'utf-8');
      const parsed = JSON.parse(data);
      const text = parsed.text || '';

      // 빈 메모는 빈 배열로, 내용이 있으면 첫 번째 메모로 변환
      const memos = text.trim() ? [{
        id: Date.now(),
        content: text,
        order: 0
      }] : [];

      // 새 형식으로 저장
      fs.writeFileSync(filePath, JSON.stringify(memos, null, 2), 'utf-8');
      return { success: true, data: memos };
    }

    return { success: true, data: [] }; // 파일 없으면 빈 배열
  } catch (error) {
    console.error('메모 로드 실패:', error);
    return { success: false, error: error.message, data: [] };
  }
});

// 태그 저장
ipcMain.handle('save-tags', async (event, tags) => {
  try {
    ensureDataDirectory();
    const filePath = getTagsFilePath();
    fs.writeFileSync(filePath, JSON.stringify(tags, null, 2), 'utf-8');
    return { success: true, path: filePath };
  } catch (error) {
    console.error('태그 저장 실패:', error);
    return { success: false, error: error.message };
  }
});

// 태그 로드
ipcMain.handle('load-tags', async () => {
  try {
    const filePath = getTagsFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return { success: true, data: JSON.parse(data) };
    }
    return { success: true, data: [] }; // 파일 없으면 빈 배열
  } catch (error) {
    console.error('태그 로드 실패:', error);
    return { success: false, error: error.message, data: [] };
  }
});

// 다크 모드 저장
ipcMain.handle('save-dark-mode', async (event, darkMode) => {
  try {
    ensureDataDirectory();
    const filePath = getDarkModeFilePath();
    fs.writeFileSync(filePath, JSON.stringify({ darkMode }, null, 2), 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('다크 모드 저장 실패:', error);
    return { success: false, error: error.message };
  }
});

// 다크 모드 로드
ipcMain.handle('load-dark-mode', async () => {
  try {
    const filePath = getDarkModeFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return { success: true, data: JSON.parse(data).darkMode };
    }
    return { success: true, data: false }; // 기본값: 라이트 모드
  } catch (error) {
    console.error('다크 모드 로드 실패:', error);
    return { success: false, error: error.message, data: false };
  }
});

// 삭제 확인 안 묻기 설정 저장
ipcMain.handle('save-dont-ask-delete', async (event, dontAsk) => {
  try {
    ensureDataDirectory();
    const filePath = getDontAskDeleteFilePath();
    fs.writeFileSync(filePath, JSON.stringify({ dontAsk }, null, 2), 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('삭제 확인 설정 저장 실패:', error);
    return { success: false, error: error.message };
  }
});

// 삭제 확인 안 묻기 설정 로드
ipcMain.handle('load-dont-ask-delete', async () => {
  try {
    const filePath = getDontAskDeleteFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return { success: true, data: JSON.parse(data).dontAsk };
    }
    return { success: true, data: false }; // 기본값: 물어보기
  } catch (error) {
    console.error('삭제 확인 설정 로드 실패:', error);
    return { success: false, error: error.message, data: false };
  }
});
