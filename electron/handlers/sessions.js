const { ipcMain } = require('electron');
const { getSessionsFilePath } = require('../utils/paths');
const { saveFile, loadFile } = require('../utils/storage');
const { migrateSessionsArray } = require('../utils/schema');

/**
 * 세션 관리 IPC 핸들러 등록
 */
function registerSessionHandlers() {
  // 세션 저장
  ipcMain.handle('save-sessions', async (event, sessions) => {
    const filePath = getSessionsFilePath();
    return saveFile(filePath, sessions);
  });

  // 세션 로드 (스키마 마이그레이션 지원)
  ipcMain.handle('load-sessions', async () => {
    const filePath = getSessionsFilePath();
    const loadResult = loadFile(filePath, []);
    
    if (loadResult.success && Array.isArray(loadResult.data)) {
      // 스키마 마이그레이션 적용
      const migratedSessions = migrateSessionsArray(loadResult.data);
      
      // 마이그레이션된 데이터가 원본과 다르면 저장
      if (JSON.stringify(migratedSessions) !== JSON.stringify(loadResult.data)) {
        const saveResult = saveFile(filePath, migratedSessions);
        if (saveResult.success) {
          console.log('[세션] 스키마 마이그레이션 완료');
        }
      }
      
      return { success: true, data: migratedSessions };
    }
    
    return loadResult;
  });
}

module.exports = {
  registerSessionHandlers
};

