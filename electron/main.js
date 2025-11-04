const { app, BrowserWindow } = require('electron');
const path = require('path');

// IPC 핸들러 모듈 import
const { registerSessionHandlers } = require('./handlers/sessions');
const { registerMemoHandlers } = require('./handlers/memos');
const { registerTagHandlers } = require('./handlers/tags');
const { registerSettingsHandlers } = require('./handlers/settings');
const { registerWindowHandlers } = require('./handlers/window');

// 마이그레이션 유틸리티 import
const { performAutoMigration } = require('./utils/migration');

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

  // IPC 핸들러 등록
  registerSessionHandlers();
  registerMemoHandlers();
  registerTagHandlers();
  registerSettingsHandlers();
  registerWindowHandlers(mainWindow);
}

// Electron 앱이 준비되면 설치/업데이트 시 마이그레이션 실행 후 윈도우 생성
app.whenReady().then(async () => {
  // 설치/업데이트 시점에만 자동 마이그레이션 수행
  try {
    const migrationResult = performAutoMigration();
    if (migrationResult.migrated) {
      console.log('[앱 시작] 설치 시 데이터 마이그레이션 완료:', migrationResult.path);
    }
  } catch (error) {
    console.error('[앱 시작] 마이그레이션 오류:', error);
  }
  
  // 윈도우 생성
  createWindow();
});

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
