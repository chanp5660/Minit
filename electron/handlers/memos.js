const { ipcMain } = require('electron');
const { getMemosFilePath } = require('../utils/paths');
const { saveFile, loadFile } = require('../utils/storage');

/**
 * 메모 관리 IPC 핸들러 등록
 */
function registerMemoHandlers() {
  // 메모 저장 (배열)
  ipcMain.handle('save-memos', async (event, memos) => {
    const filePath = getMemosFilePath();
    return saveFile(filePath, memos);
  });

  // 메모 로드 (배열)
  ipcMain.handle('load-memos', async () => {
    const filePath = getMemosFilePath();
    return loadFile(filePath, []);
  });
}

module.exports = {
  registerMemoHandlers
};

