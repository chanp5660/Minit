const { ipcMain } = require('electron');
const { getDataPath } = require('../utils/paths');

/**
 * 윈도우 관리 IPC 핸들러 등록
 * @param {BrowserWindow} mainWindow - 메인 윈도우 인스턴스
 */
function registerWindowHandlers(mainWindow) {
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
}

module.exports = {
  registerWindowHandlers
};

