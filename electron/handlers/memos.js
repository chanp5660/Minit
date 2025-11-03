const { ipcMain } = require('electron');
const fs = require('fs');
const { getMemosFilePath, getLegacyMemoFilePath } = require('../utils/paths');
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

  // 메모 로드 (배열, 마이그레이션 지원)
  ipcMain.handle('load-memos', async () => {
    const filePath = getMemosFilePath();
    const legacyFilePath = getLegacyMemoFilePath();

    // 새 형식 파일이 있으면 그대로 로드
    if (fs.existsSync(filePath)) {
      return loadFile(filePath, []);
    }

    // 기존 단일 메모 파일이 있으면 마이그레이션
    if (fs.existsSync(legacyFilePath)) {
      try {
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
        saveFile(filePath, memos);
        return { success: true, data: memos };
      } catch (error) {
        console.error('메모 마이그레이션 실패:', error);
        return { success: false, error: error.message, data: [] };
      }
    }

    return { success: true, data: [] }; // 파일 없으면 빈 배열
  });
}

module.exports = {
  registerMemoHandlers
};

