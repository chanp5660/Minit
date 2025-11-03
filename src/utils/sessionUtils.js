/**
 * 세션 관련 유틸리티 함수
 */

/**
 * 오늘의 세션 목록을 반환합니다.
 * @param {Array} sessions - 전체 세션 배열
 * @param {Array} selectedTags - 선택된 태그 배열
 * @param {Function} extractTags - 태그 추출 함수
 * @returns {Array} 오늘의 세션 배열
 */
export const getTodaySessions = (sessions, selectedTags = [], extractTags) => {
  const today = new Date().toDateString();
  let todaySessions = sessions.filter(s => new Date(s.timestamp).toDateString() === today);

  // 선택된 태그가 있으면 필터링 (교집합: 선택된 모든 태그를 포함하는 세션만)
  if (selectedTags.length > 0) {
    todaySessions = todaySessions.filter(session => {
      const sessionTags = extractTags(session.title);
      // 선택된 모든 태그가 세션에 포함되어 있는지 확인
      return selectedTags.every(selectedTag => sessionTags.includes(selectedTag));
    });
  }

  return todaySessions;
};

/**
 * 오늘의 통계를 계산합니다.
 * @param {Array} sessions - 세션 배열
 * @param {Array} selectedTags - 선택된 태그 배열
 * @param {Function} extractTags - 태그 추출 함수
 * @returns {object} 통계 객체
 */
export const getTodayStats = (sessions, selectedTags = [], extractTags) => {
  const todaySessions = getTodaySessions(sessions, selectedTags, extractTags);
  const totalMinutes = todaySessions.reduce((acc, s) => acc + s.duration, 0);
  const completedCount = todaySessions.filter(s => s.completed).length;
  const inProgressCount = todaySessions.filter(s => s.inProgress && !s.completed).length;
  
  return {
    totalMinutes,
    totalHours: (totalMinutes / 60).toFixed(1),
    sessionCount: todaySessions.length,
    completedCount,
    inProgressCount
  };
};

/**
 * 시간대별 사용량을 계산합니다.
 * @param {Array} sessions - 세션 배열
 * @param {number} startHour - 시작 시간 (0-23, 기본값: 0)
 * @param {number} endHour - 종료 시간 (0-23, 기본값: 23)
 * @returns {Array} 시간대별 데이터 배열
 */
export const getHourlyUsage = (sessions, startHour = 0, endHour = 23) => {
  const hourlyData = [];
  
  // 지정된 시간 범위 내의 시간만 순회
  for (let hour = startHour; hour <= endHour; hour++) {
    const hourStart = new Date();
    hourStart.setHours(hour, 0, 0, 0);
    const hourEnd = new Date();
    hourEnd.setHours(hour + 1, 0, 0, 0);
    
    // 해당 시간대에 포함되는 세션들 찾기
    const hourSessions = sessions.filter(session => {
      const sessionStart = new Date(session.timestamp);
      const sessionEnd = session.endTime 
        ? new Date(session.endTime) 
        : new Date(sessionStart.getTime() + session.duration * 60000);
      
      // 세션이 해당 시간대와 겹치는지 확인
      return sessionStart < hourEnd && sessionEnd > hourStart;
    });
    
    // 해당 시간대에서 실제 사용된 시간 계산
    let usedMinutes = 0;
    hourSessions.forEach(session => {
      const sessionStart = new Date(session.timestamp);
      const sessionEnd = session.endTime 
        ? new Date(session.endTime) 
        : new Date(sessionStart.getTime() + session.duration * 60000);
      
      // 시간대와 세션의 교집합 계산
      const overlapStart = new Date(Math.max(sessionStart.getTime(), hourStart.getTime()));
      const overlapEnd = new Date(Math.min(sessionEnd.getTime(), hourEnd.getTime()));
      
      if (overlapStart < overlapEnd) {
        usedMinutes += (overlapEnd.getTime() - overlapStart.getTime()) / 60000;
      }
    });
    
    const percentage = Math.min(usedMinutes / 60 * 100, 200); // 최대 200%까지 표시
    
    hourlyData.push({
      hour,
      usedMinutes: Math.round(usedMinutes),
      percentage: Math.round(percentage),
      sessions: hourSessions,
      isEmpty: hourSessions.length === 0
    });
  }
  
  return hourlyData;
};

/**
 * 겹치는 세션들을 그룹으로 묶습니다.
 * @param {Array} sessions - 세션 배열
 * @returns {Array} 그룹화된 세션 배열
 */
export const groupOverlappingSessions = (sessions) => {
  if (sessions.length === 0) return [];

  // 세션을 시작 시간순으로 정렬
  const sortedSessions = [...sessions].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const groups = [];
  const processed = new Set();

  sortedSessions.forEach(session => {
    if (processed.has(session.id)) return;

    const sessionStart = new Date(session.timestamp);
    const sessionEnd = session.endTime 
      ? new Date(session.endTime) 
      : new Date(sessionStart.getTime() + session.duration * 60000);
    
    // 이 세션과 겹치는 모든 세션 찾기
    const overlappingSessions = sortedSessions.filter(otherSession => {
      if (otherSession.id === session.id || processed.has(otherSession.id)) return false;
      
      const otherStart = new Date(otherSession.timestamp);
      const otherEnd = otherSession.endTime 
        ? new Date(otherSession.endTime) 
        : new Date(otherStart.getTime() + otherSession.duration * 60000);
      
      return sessionStart < otherEnd && sessionEnd > otherStart;
    });

    if (overlappingSessions.length > 0) {
      // 그룹 생성
      const groupSessions = [session, ...overlappingSessions];
      const groupStart = Math.min(...groupSessions.map(s => new Date(s.timestamp).getTime()));
      const groupEnd = Math.max(...groupSessions.map(s => {
        const start = new Date(s.timestamp);
        return s.endTime ? new Date(s.endTime).getTime() : start.getTime() + s.duration * 60000;
      }));

      groups.push({
        type: 'group',
        sessions: groupSessions,
        startTime: new Date(groupStart),
        endTime: new Date(groupEnd),
        duration: Math.ceil((groupEnd - groupStart) / 60000)
      });

      // 처리된 세션들 마킹
      groupSessions.forEach(s => processed.add(s.id));
    } else {
      // 단일 세션
      groups.push({
        type: 'single',
        session: session
      });
      processed.add(session.id);
    }
  });

  return groups;
};

