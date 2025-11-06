/**
 * 데이터 마이그레이션 유틸리티
 */

const fs = require('fs');
const path = require('path');
const {
  getDataPath,
  getSessionsFilePath,
  getMemosFilePath,
  getTagsFilePath,
  getDarkModeFilePath,
  getDontAskDeleteFilePath,
  ensureDataDirectory
} = require('./paths');
const { saveFile, loadFile } = require('./storage');
const {
  migrateMemosArray,
  migrateSessionsArray,
  detectMemoSchemaVersion,
  detectSessionSchemaVersion,
  MEMO_SCHEMA_VERSION,
  SESSION_SCHEMA_VERSION
} = require('./schema');

/**
 * 앱 버전 정보 파일 경로
 */
function getAppVersionPath() {
  return path.join(getDataPath(), 'minit-app-version.json');
}

/**
 * 현재 앱 버전을 가져옵니다.
 * @returns {string} 앱 버전 (package.json에서 읽음)
 */
function getCurrentAppVersion() {
  try {
    const packageJsonPath = path.join(__dirname, '../../package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      return packageJson.version || '1.0.0';
    }
  } catch (error) {
    console.error('버전 읽기 실패:', error);
  }
  return '1.0.0'; // 기본값
}

/**
 * 저장된 앱 버전을 가져옵니다.
 * @returns {string|null} 저장된 버전 (없으면 null)
 */
function getStoredAppVersion() {
  const versionPath = getAppVersionPath();
  if (fs.existsSync(versionPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(versionPath, 'utf-8'));
      return data.version || null;
    } catch (error) {
      console.error('저장된 버전 읽기 실패:', error);
    }
  }
  return null;
}

/**
 * 앱 버전을 저장합니다.
 * @param {string} version - 저장할 버전
 */
function saveAppVersion(version) {
  const versionPath = getAppVersionPath();
  ensureDataDirectory();
  fs.writeFileSync(versionPath, JSON.stringify({
    version: version,
    timestamp: new Date().toISOString()
  }, null, 2), 'utf-8');
}

/**
 * 설치/업데이트 시점인지 확인합니다.
 * (저장된 버전이 없거나 현재 버전과 다를 때)
 * @returns {boolean} 마이그레이션이 필요한지 여부
 */
function shouldPerformMigration() {
  const currentVersion = getCurrentAppVersion();
  const storedVersion = getStoredAppVersion();
  
  // 저장된 버전이 없으면 새로 설치된 것
  if (!storedVersion) {
    return true;
  }
  
  // 버전이 다르면 업데이트된 것
  if (storedVersion !== currentVersion) {
    return true;
  }
  
  return false;
}

/**
 * 소스 경로에서 타겟 경로로 데이터를 마이그레이션합니다.
 * @param {string} sourceDataPath - 소스 데이터 폴더 경로
 * @param {string} targetDataPath - 타겟 데이터 폴더 경로
 * @returns {{success: boolean, migrated: {sessions: number, memos: number, tags: number, settings: number}, errors: string[]}}
 */
function migrateDataFromPath(sourceDataPath, targetDataPath) {
  const result = {
    success: true,
    migrated: {
      sessions: 0,
      memos: 0,
      tags: 0,
      settings: 0
    },
    errors: []
  };

  try {
    ensureDataDirectory();
    
    // 소스 경로 확인
    if (!fs.existsSync(sourceDataPath)) {
      result.errors.push(`소스 경로가 존재하지 않습니다: ${sourceDataPath}`);
      return result;
    }

    // 세션 마이그레이션
    try {
      const sourceSessionsPath = path.join(sourceDataPath, 'minit-sessions.json');
      const targetSessionsPath = getSessionsFilePath();
      
      if (fs.existsSync(sourceSessionsPath)) {
        const sourceResult = loadFile(sourceSessionsPath, []);
        if (sourceResult.success && Array.isArray(sourceResult.data)) {
          // 스키마 버전 확인: 첫 번째 세션의 스키마 버전을 확인 (또는 빈 배열이면 건너뛰기)
          let sourceSessions = sourceResult.data;
          
          if (sourceSessions.length > 0) {
            const firstSessionVersion = detectSessionSchemaVersion(sourceSessions[0]);
            if (firstSessionVersion !== SESSION_SCHEMA_VERSION) {
              // 스키마 버전이 다르면 마이그레이션 필요
              sourceSessions = migrateSessionsArray(sourceResult.data);
            }
            // 스키마 버전이 같으면 sourceSessions는 그대로 사용 (복사만)
          }
          
          // 타겟 파일이 있으면 병합 (ID 기준 중복 제거)
          let targetSessions = [];
          if (fs.existsSync(targetSessionsPath)) {
            const targetResult = loadFile(targetSessionsPath, []);
            if (targetResult.success && Array.isArray(targetResult.data)) {
              targetSessions = targetResult.data;
            }
          }
          
          // 중복 제거: 소스에 있는 세션 ID가 타겟에 없으면 추가
          const targetSessionIds = new Set(targetSessions.map(s => s.id));
          const newSessions = sourceSessions.filter(s => !targetSessionIds.has(s.id));
          
          // 타겟 파일이 없거나 새 세션이 있으면 저장
          if (!fs.existsSync(targetSessionsPath) || newSessions.length > 0) {
            const mergedSessions = targetSessions.length > 0 
              ? [...targetSessions, ...newSessions]
              : sourceSessions; // 타겟이 비어있으면 소스 데이터를 그대로 사용
            const saveResult = saveFile(targetSessionsPath, mergedSessions);
            if (saveResult.success) {
              result.migrated.sessions = newSessions.length > 0 ? newSessions.length : sourceSessions.length;
            } else {
              result.errors.push(`세션 저장 실패: ${saveResult.error}`);
            }
          }
        }
      }
    } catch (error) {
      result.errors.push(`세션 마이그레이션 실패: ${error.message}`);
      result.success = false;
    }

    // 메모 마이그레이션
    try {
      const sourceMemosPath = path.join(sourceDataPath, 'minit-memos.json');
      const targetMemosPath = getMemosFilePath();
      
      if (fs.existsSync(sourceMemosPath)) {
        const sourceResult = loadFile(sourceMemosPath, []);
        if (sourceResult.success && Array.isArray(sourceResult.data)) {
          // 스키마 버전 확인: 첫 번째 메모의 스키마 버전을 확인 (또는 빈 배열이면 건너뛰기)
          let sourceMemos = sourceResult.data;
          
          if (sourceMemos.length > 0) {
            const firstMemoVersion = detectMemoSchemaVersion(sourceMemos[0]);
            if (firstMemoVersion !== MEMO_SCHEMA_VERSION) {
              // 스키마 버전이 다르면 마이그레이션 필요
              sourceMemos = migrateMemosArray(sourceResult.data);
            }
            // 스키마 버전이 같으면 sourceMemos는 그대로 사용 (복사만)
          }
          
          // 타겟 파일이 있으면 병합 (ID 기준 중복 제거)
          let targetMemos = [];
          if (fs.existsSync(targetMemosPath)) {
            const targetResult = loadFile(targetMemosPath, []);
            if (targetResult.success && Array.isArray(targetResult.data)) {
              targetMemos = targetResult.data;
            }
          }
          
          // 중복 제거: 소스에 있는 메모 ID가 타겟에 없으면 추가
          const targetMemoIds = new Set(targetMemos.map(m => m.id));
          const newMemos = sourceMemos.filter(m => !targetMemoIds.has(m.id));
          
          // 타겟 파일이 없거나 새 메모가 있으면 저장
          if (!fs.existsSync(targetMemosPath) || newMemos.length > 0) {
            let mergedMemos;
            
            if (targetMemos.length > 0) {
              // order 재조정
              const maxOrder = Math.max(...targetMemos.map(m => m.order || 0));
              const adjustedMemos = newMemos.map((memo, index) => ({
                ...memo,
                order: maxOrder + 1 + index
              }));
              mergedMemos = [...targetMemos, ...adjustedMemos];
            } else {
              // 타겟이 비어있으면 소스 데이터를 그대로 사용 (order는 이미 적용됨)
              mergedMemos = sourceMemos;
            }
            
            const saveResult = saveFile(targetMemosPath, mergedMemos);
            if (saveResult.success) {
              result.migrated.memos = newMemos.length > 0 ? newMemos.length : sourceMemos.length;
            } else {
              result.errors.push(`메모 저장 실패: ${saveResult.error}`);
            }
          }
        }
      }
    } catch (error) {
      result.errors.push(`메모 마이그레이션 실패: ${error.message}`);
      result.success = false;
    }

    // 태그 마이그레이션
    try {
      const sourceTagsPath = path.join(sourceDataPath, 'minit-tags.json');
      const targetTagsPath = getTagsFilePath();
      
      if (fs.existsSync(sourceTagsPath)) {
        const sourceResult = loadFile(sourceTagsPath, []);
        if (sourceResult.success && Array.isArray(sourceResult.data)) {
          // 타겟 파일이 있으면 병합 (중복 제거)
          let targetTags = [];
          if (fs.existsSync(targetTagsPath)) {
            const targetResult = loadFile(targetTagsPath, []);
            if (targetResult.success && Array.isArray(targetResult.data)) {
              targetTags = targetResult.data;
            }
          }
          
          // 중복 제거 후 병합
          const targetTagSet = new Set(targetTags);
          const newTags = sourceResult.data.filter(tag => !targetTagSet.has(tag));
          
          // 타겟 파일이 없거나 새 태그가 있으면 저장
          if (!fs.existsSync(targetTagsPath) || newTags.length > 0) {
            const mergedTags = targetTags.length > 0
              ? [...targetTags, ...newTags]
              : sourceResult.data; // 타겟이 비어있으면 소스 데이터를 그대로 사용
            const saveResult = saveFile(targetTagsPath, mergedTags);
            if (saveResult.success) {
              result.migrated.tags = newTags.length > 0 ? newTags.length : sourceResult.data.length;
            } else {
              result.errors.push(`태그 저장 실패: ${saveResult.error}`);
            }
          }
        }
      }
    } catch (error) {
      result.errors.push(`태그 마이그레이션 실패: ${error.message}`);
      result.success = false;
    }

    // 설정 파일 마이그레이션 (다크 모드, 삭제 확인 설정)
    try {
      // 다크 모드 설정
      const sourceDarkModePath = path.join(sourceDataPath, 'minit-darkmode.json');
      const targetDarkModePath = getDarkModeFilePath();
      
      if (fs.existsSync(sourceDarkModePath) && !fs.existsSync(targetDarkModePath)) {
        const sourceResult = loadFile(sourceDarkModePath, { darkMode: false });
        if (sourceResult.success) {
          const saveResult = saveFile(targetDarkModePath, sourceResult.data);
          if (saveResult.success) {
            result.migrated.settings++;
          }
        }
      }
      
      // 삭제 확인 설정
      const sourceDontAskPath = path.join(sourceDataPath, 'minit-dont-ask-delete.json');
      const targetDontAskPath = getDontAskDeleteFilePath();
      
      if (fs.existsSync(sourceDontAskPath) && !fs.existsSync(targetDontAskPath)) {
        const sourceResult = loadFile(sourceDontAskPath, { dontAsk: false });
        if (sourceResult.success) {
          const saveResult = saveFile(targetDontAskPath, sourceResult.data);
          if (saveResult.success) {
            result.migrated.settings++;
          }
        }
      }
    } catch (error) {
      result.errors.push(`설정 마이그레이션 실패: ${error.message}`);
      result.success = false;
    }

  } catch (error) {
    result.errors.push(`마이그레이션 실패: ${error.message}`);
    result.success = false;
  }

  return result;
}

/**
 * 자동 마이그레이션을 수행합니다.
 * 설치/업데이트 시점에만 실행되며, 이전 설치 경로에서 데이터를 찾아 마이그레이션합니다.
 * @returns {{success: boolean, migrated: boolean, path?: string, details?: object, errors?: string[]}}
 */
function performAutoMigration() {
  // 설치/업데이트 시점이 아니면 스킵
  if (!shouldPerformMigration()) {
    console.log('[마이그레이션] 설치/업데이트 시점이 아니므로 마이그레이션을 건너뜁니다.');
    return { success: true, migrated: false };
  }

  const currentVersion = getCurrentAppVersion();
  console.log(`[마이그레이션] 설치/업데이트 감지 (버전: ${currentVersion})`);

  // 현재 데이터 경로 확인
  const currentDataPath = getDataPath();
  ensureDataDirectory();

  // 이전 설치 경로 검색
  const { findLegacyDataPaths } = require('./paths');
  const legacyPaths = findLegacyDataPaths();
  
  if (legacyPaths.length === 0) {
    console.log('[마이그레이션] 이전 설치 경로를 찾을 수 없습니다.');
    // 버전 저장 (다음 번에는 마이그레이션을 시도하지 않음)
    saveAppVersion(currentVersion);
    return { success: true, migrated: false };
  }

  console.log(`[마이그레이션] ${legacyPaths.length}개의 이전 데이터 경로를 발견했습니다.`);
  
  // 가장 최근 데이터가 있는 경로부터 마이그레이션 시도
  let lastError = null;
  for (const legacyPath of legacyPaths) {
    console.log(`[마이그레이션] 마이그레이션 시도: ${legacyPath.path}`);
    const result = migrateDataFromPath(legacyPath.path, currentDataPath);
    
    if (result.success && (result.migrated.sessions > 0 || result.migrated.memos > 0)) {
      console.log(`[마이그레이션] 마이그레이션 성공:`);
      console.log(`  - 세션: ${result.migrated.sessions}개`);
      console.log(`  - 메모: ${result.migrated.memos}개`);
      console.log(`  - 태그: ${result.migrated.tags}개`);
      console.log(`  - 설정: ${result.migrated.settings}개`);
      
      if (result.errors.length > 0) {
        console.warn(`[마이그레이션] 일부 오류 발생:`, result.errors);
      }
      
      // 앱 버전 저장 (마이그레이션 완료 표시)
      saveAppVersion(currentVersion);
      return {
        success: true,
        migrated: true,
        path: legacyPath.path,
        details: result.migrated,
        errors: result.errors.length > 0 ? result.errors : undefined
      };
    }
    
    if (result.errors.length > 0) {
      lastError = result.errors.join(', ');
    }
  }

  // 마이그레이션 실패 또는 데이터를 찾지 못함
  if (lastError) {
    console.warn(`[마이그레이션] 마이그레이션 실패: ${lastError}`);
  } else {
    console.log(`[마이그레이션] 이전 데이터를 찾을 수 없습니다.`);
  }
  
  // 버전 저장 (다음 번에는 마이그레이션을 시도하지 않음)
  saveAppVersion(currentVersion);
  return {
    success: !lastError,
    migrated: false,
    errors: lastError ? [lastError] : undefined
  };
}

module.exports = {
  migrateDataFromPath,
  performAutoMigration,
  shouldPerformMigration,
  getCurrentAppVersion,
  getStoredAppVersion,
  saveAppVersion
};

