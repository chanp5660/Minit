const fs = require('fs');
const { ensureDataDirectory } = require('./paths');

/**
 * JSON 파일을 저장합니다.
 * @param {string} filePath - 저장할 파일 경로
 * @param {any} data - 저장할 데이터
 * @returns {{ success: boolean, path?: string, error?: string }}
 */
function saveFile(filePath, data) {
  try {
    ensureDataDirectory();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true, path: filePath };
  } catch (error) {
    console.error('파일 저장 실패:', error);
    return { success: false, error: error.message };
  }
}

/**
 * JSON 파일을 로드합니다.
 * @param {string} filePath - 로드할 파일 경로
 * @param {any} defaultValue - 파일이 없을 때 반환할 기본값
 * @returns {{ success: boolean, data?: any, error?: string }}
 */
function loadFile(filePath, defaultValue = null) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return { success: true, data: JSON.parse(data) };
    }
    return { success: true, data: defaultValue };
  } catch (error) {
    console.error('파일 로드 실패:', error);
    return { success: false, error: error.message, data: defaultValue };
  }
}

module.exports = {
  saveFile,
  loadFile
};

