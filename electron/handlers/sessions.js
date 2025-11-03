const { ipcMain } = require('electron');
const { getSessionsFilePath } = require('../utils/paths');
const { saveFile, loadFile } = require('../utils/storage');

/**
 * 세션 관리 IPC 핸들러 등록
 */
function registerSessionHandlers() {
  // 세션 저장
  ipcMain.handle('save-sessions', async (event, sessions) => {
    const filePath = getSessionsFilePath();
    return saveFile(filePath, sessions);
  });

  // 세션 로드
  ipcMain.handle('load-sessions', async () => {
    const filePath = getSessionsFilePath();
    return loadFile(filePath, []);
  });
}

module.exports = {
  registerSessionHandlers
};

