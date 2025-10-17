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
    title: '🍅 뽀모도로 타이머'
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
  return path.join(getDataPath(), 'pomodoro-sessions.json');
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
