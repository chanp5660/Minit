const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// 데이터 저장 경로 함수
function getDataPath() {
  // 실행 파일이 있는 폴더의 data 디렉토리
  const exePath = app.getPath('exe');
  const exeDir = path.dirname(exePath);
  return path.join(exeDir, 'data');
}

function getSessionsFilePath() {
  return path.join(getDataPath(), 'minit-sessions.json');
}

function getMemosFilePath() {
  return path.join(getDataPath(), 'minit-memos.json');
}

// 기존 메모 파일 경로 (마이그레이션용)
function getLegacyMemoFilePath() {
  return path.join(getDataPath(), 'minit-memo.json');
}

function getTagsFilePath() {
  return path.join(getDataPath(), 'minit-tags.json');
}

function getDarkModeFilePath() {
  return path.join(getDataPath(), 'minit-darkmode.json');
}

function getDontAskDeleteFilePath() {
  return path.join(getDataPath(), 'minit-dont-ask-delete.json');
}

// data 폴더 생성 (없으면)
function ensureDataDirectory() {
  const dataPath = getDataPath();
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true });
  }
}

/**
 * 이전 설치 경로에서 데이터 폴더를 검색합니다.
 * @returns {Array<{path: string, mtime: Date}>} 발견된 데이터 경로 배열 (최신 수정 시간 순 정렬)
 */
function findLegacyDataPaths() {
  const foundPaths = [];
  const currentDataPath = getDataPath();
  
  // 현재 위치는 제외
  const checkPath = (dataPath) => {
    if (dataPath === currentDataPath) return false;
    if (!fs.existsSync(dataPath)) return false;
    
    // data 폴더에 minit-*.json 파일이 하나라도 있는지 확인
    const files = fs.readdirSync(dataPath);
    const hasMinitFiles = files.some(file => 
      file.startsWith('minit-') && file.endsWith('.json')
    );
    
    if (hasMinitFiles) {
      // 가장 최근 수정된 파일의 시간을 기준으로 정렬
      let latestMtime = 0;
      files.forEach(file => {
        if (file.startsWith('minit-') && file.endsWith('.json')) {
          const filePath = path.join(dataPath, file);
          try {
            const stats = fs.statSync(filePath);
            if (stats.mtime.getTime() > latestMtime) {
              latestMtime = stats.mtime.getTime();
            }
          } catch (e) {
            // 파일 읽기 실패 시 무시
          }
        }
      });
      
      return { path: dataPath, mtime: new Date(latestMtime) };
    }
    return false;
  };
  
  // 1. 현재 실행 파일 위치의 부모 디렉토리들 검색
  try {
    const exePath = app.getPath('exe');
    const exeDir = path.dirname(exePath);
    let currentDir = exeDir;
    
    // 최대 3단계 상위 디렉토리까지 검색
    for (let i = 0; i < 3; i++) {
      const parentDataPath = path.join(currentDir, 'data');
      const result = checkPath(parentDataPath);
      if (result) {
        foundPaths.push(result);
      }
      
      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) break; // 루트에 도달
      currentDir = parentDir;
    }
  } catch (e) {
    console.error('부모 디렉토리 검색 실패:', e);
  }
  
  // 2. Windows 일반 설치 경로 검색
  if (process.platform === 'win32') {
    const userProfile = os.homedir();
    const programFiles = process.env['ProgramFiles'] || 'C:\\Program Files';
    const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
    const localAppData = process.env['LOCALAPPDATA'] || path.join(userProfile, 'AppData', 'Local');
    
    const searchPaths = [
      path.join(programFiles, 'Minit', 'data'),
      path.join(programFilesX86, 'Minit', 'data'),
      path.join(localAppData, 'Programs', 'Minit', 'data'),
      path.join(userProfile, 'Desktop', 'Minit', 'data'),
      path.join(userProfile, 'Documents', 'Minit', 'data')
    ];
    
    searchPaths.forEach(searchPath => {
      try {
        const result = checkPath(searchPath);
        if (result) {
          foundPaths.push(result);
        }
      } catch (e) {
        // 경로 접근 실패 시 무시
      }
    });
  }
  
  // 3. 중복 제거 및 최신 수정 시간 순 정렬
  const uniquePaths = [];
  const seenPaths = new Set();
  
  foundPaths.forEach(item => {
    if (!seenPaths.has(item.path)) {
      seenPaths.add(item.path);
      uniquePaths.push(item);
    }
  });
  
  // 최신 수정 시간 순으로 정렬 (내림차순)
  uniquePaths.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
  
  return uniquePaths;
}

module.exports = {
  getDataPath,
  getSessionsFilePath,
  getMemosFilePath,
  getLegacyMemoFilePath,
  getTagsFilePath,
  getDarkModeFilePath,
  getDontAskDeleteFilePath,
  ensureDataDirectory,
  findLegacyDataPaths
};

