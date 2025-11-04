/**
 * 스키마 버전 관리 및 마이그레이션 유틸리티
 */

// 현재 스키마 버전
const MEMO_SCHEMA_VERSION = 1;
const SESSION_SCHEMA_VERSION = 1;

/**
 * 텍스트에서 #태그 형식의 태그를 추출합니다.
 * @param {string} text - 태그를 추출할 텍스트
 * @returns {string[]} 추출된 태그 배열
 */
function extractTags(text) {
  if (!text) return [];
  const regex = /#([^\s#]+)/g;
  const matches = text.match(regex);
  return matches ? matches.map(tag => tag.substring(1)) : [];
}

/**
 * 메모 스키마 버전을 감지합니다.
 * @param {any} memo - 메모 객체
 * @returns {number} 스키마 버전 (0, 1, ...)
 */
function detectMemoSchemaVersion(memo) {
  if (!memo || typeof memo !== 'object') return 0;
  
  // v1: tags 필드가 있음
  if (Array.isArray(memo.tags)) {
    return 1;
  }
  
  // v0: tags 필드가 없음 (id, content, order만 있거나 일부만 있음)
  return 0;
}

/**
 * 세션 스키마 버전을 감지합니다.
 * @param {any} session - 세션 객체
 * @returns {number} 스키마 버전 (0, 1, ...)
 */
function detectSessionSchemaVersion(session) {
  if (!session || typeof session !== 'object') return 0;
  
  // v1: 기본 필드들이 모두 있음
  if (session.id && session.title && session.timestamp) {
    return 1;
  }
  
  // v0: 기본 필드가 누락됨
  return 0;
}

/**
 * 메모 v0 → v1 마이그레이션
 * @param {any} memo - v0 메모 객체
 * @returns {any} v1 메모 객체
 */
function memo_v0_to_v1(memo) {
  return {
    id: memo.id || Date.now(),
    content: memo.content || '',
    order: memo.order !== undefined ? memo.order : 0,
    tags: extractTags(memo.content || '')
  };
}

/**
 * 세션 v0 → v1 마이그레이션
 * @param {any} session - v0 세션 객체
 * @returns {any} v1 세션 객체
 */
function session_v0_to_v1(session) {
  return {
    id: session.id || Date.now(),
    title: session.title || '',
    duration: session.duration !== undefined ? session.duration : 0,
    completed: session.completed !== undefined ? session.completed : false,
    inProgress: session.inProgress !== undefined ? session.inProgress : false,
    timestamp: session.timestamp || new Date(),
    endTime: session.endTime || new Date(),
    partial: session.partial !== undefined ? session.partial : false
  };
}

/**
 * 메모 스키마를 현재 버전으로 마이그레이션합니다.
 * @param {any} memo - 메모 객체
 * @param {number} fromVersion - 현재 버전 (없으면 자동 감지)
 * @returns {any} 마이그레이션된 메모 객체
 */
function migrateMemoSchema(memo, fromVersion = null) {
  if (!memo) return null;
  
  // 버전 감지
  if (fromVersion === null) {
    fromVersion = detectMemoSchemaVersion(memo);
  }
  
  let currentMemo = { ...memo };
  let currentVersion = fromVersion;
  
  // 단계별 마이그레이션 (v0 → v1 → v2 ...)
  while (currentVersion < MEMO_SCHEMA_VERSION) {
    if (currentVersion === 0 && MEMO_SCHEMA_VERSION >= 1) {
      currentMemo = memo_v0_to_v1(currentMemo);
      currentVersion = 1;
    }
    // 추후 v1 → v2, v2 → v3 등 추가 가능
    else {
      break; // 알 수 없는 버전이거나 마이그레이션 경로가 없음
    }
  }
  
  // 최종 검증: 필수 필드 확인 및 기본값 채우기
  return {
    id: currentMemo.id || Date.now(),
    content: currentMemo.content || '',
    order: currentMemo.order !== undefined ? currentMemo.order : 0,
    tags: Array.isArray(currentMemo.tags) ? currentMemo.tags : []
  };
}

/**
 * 세션 스키마를 현재 버전으로 마이그레이션합니다.
 * @param {any} session - 세션 객체
 * @param {number} fromVersion - 현재 버전 (없으면 자동 감지)
 * @returns {any} 마이그레이션된 세션 객체
 */
function migrateSessionSchema(session, fromVersion = null) {
  if (!session) return null;
  
  // 버전 감지
  if (fromVersion === null) {
    fromVersion = detectSessionSchemaVersion(session);
  }
  
  let currentSession = { ...session };
  let currentVersion = fromVersion;
  
  // 단계별 마이그레이션 (v0 → v1 → v2 ...)
  while (currentVersion < SESSION_SCHEMA_VERSION) {
    if (currentVersion === 0 && SESSION_SCHEMA_VERSION >= 1) {
      currentSession = session_v0_to_v1(currentSession);
      currentVersion = 1;
    }
    // 추후 v1 → v2, v2 → v3 등 추가 가능
    else {
      break; // 알 수 없는 버전이거나 마이그레이션 경로가 없음
    }
  }
  
  // 최종 검증: 필수 필드 확인 및 기본값 채우기
  return {
    id: currentSession.id || Date.now(),
    title: currentSession.title || '',
    duration: currentSession.duration !== undefined ? currentSession.duration : 0,
    completed: currentSession.completed !== undefined ? currentSession.completed : false,
    inProgress: currentSession.inProgress !== undefined ? currentSession.inProgress : false,
    timestamp: currentSession.timestamp ? new Date(currentSession.timestamp) : new Date(),
    endTime: currentSession.endTime ? new Date(currentSession.endTime) : new Date(),
    partial: currentSession.partial !== undefined ? currentSession.partial : false
  };
}

/**
 * 메모 배열을 현재 스키마 버전으로 마이그레이션합니다.
 * @param {any[]} memos - 메모 배열
 * @returns {any[]} 마이그레이션된 메모 배열
 */
function migrateMemosArray(memos) {
  if (!Array.isArray(memos)) return [];
  
  return memos
    .map(memo => migrateMemoSchema(memo))
    .filter(memo => memo !== null);
}

/**
 * 세션 배열을 현재 스키마 버전으로 마이그레이션합니다.
 * @param {any[]} sessions - 세션 배열
 * @returns {any[]} 마이그레이션된 세션 배열
 */
function migrateSessionsArray(sessions) {
  if (!Array.isArray(sessions)) return [];
  
  return sessions
    .map(session => migrateSessionSchema(session))
    .filter(session => session !== null);
}

module.exports = {
  MEMO_SCHEMA_VERSION,
  SESSION_SCHEMA_VERSION,
  detectMemoSchemaVersion,
  detectSessionSchemaVersion,
  migrateMemoSchema,
  migrateSessionSchema,
  migrateMemosArray,
  migrateSessionsArray
};

