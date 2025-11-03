const { ipcMain } = require('electron');
const { getDarkModeFilePath, getDontAskDeleteFilePath } = require('../utils/paths');
const { saveFile, loadFile } = require('../utils/storage');

/**
 * 설정 관리 IPC 핸들러 등록
 */
function registerSettingsHandlers() {
  // 다크 모드 저장
  ipcMain.handle('save-dark-mode', async (event, darkMode) => {
    const filePath = getDarkModeFilePath();
    return saveFile(filePath, { darkMode });
  });

  // 다크 모드 로드
  ipcMain.handle('load-dark-mode', async () => {
    const filePath = getDarkModeFilePath();
    const result = loadFile(filePath, { darkMode: false });
    if (result.success) {
      return { success: true, data: result.data.darkMode };
    }
    return { success: true, data: false }; // 기본값: 라이트 모드
  });

  // 삭제 확인 안 묻기 설정 저장
  ipcMain.handle('save-dont-ask-delete', async (event, dontAsk) => {
    const filePath = getDontAskDeleteFilePath();
    return saveFile(filePath, { dontAsk });
  });

  // 삭제 확인 안 묻기 설정 로드
  ipcMain.handle('load-dont-ask-delete', async () => {
    const filePath = getDontAskDeleteFilePath();
    const result = loadFile(filePath, { dontAsk: false });
    if (result.success) {
      return { success: true, data: result.data.dontAsk };
    }
    return { success: true, data: false }; // 기본값: 물어보기
  });
}

module.exports = {
  registerSettingsHandlers
};

