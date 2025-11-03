const { ipcMain } = require('electron');
const { getTagsFilePath } = require('../utils/paths');
const { saveFile, loadFile } = require('../utils/storage');

/**
 * 태그 관리 IPC 핸들러 등록
 */
function registerTagHandlers() {
  // 태그 저장
  ipcMain.handle('save-tags', async (event, tags) => {
    const filePath = getTagsFilePath();
    return saveFile(filePath, tags);
  });

  // 태그 로드
  ipcMain.handle('load-tags', async () => {
    const filePath = getTagsFilePath();
    return loadFile(filePath, []);
  });
}

module.exports = {
  registerTagHandlers
};

