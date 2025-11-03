/**
 * 시간 관련 유틸리티 함수
 */

/**
 * 초를 MM:SS 형식으로 변환합니다.
 * @param {number} seconds - 변환할 초
 * @returns {string} MM:SS 형식의 문자열
 */
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * 분을 시간과 분으로 변환합니다.
 * @param {number} minutes - 변환할 분
 * @returns {object} { hours, minutes } 객체
 */
export const minutesToHoursAndMinutes = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return { hours, minutes: remainingMinutes };
};

/**
 * 시간 차이를 분 단위로 계산합니다.
 * @param {Date} startTime - 시작 시간
 * @param {Date} endTime - 종료 시간
 * @returns {number} 분 단위 차이
 */
export const getDurationInMinutes = (startTime, endTime) => {
  const diffMs = endTime.getTime() - startTime.getTime();
  return Math.ceil(diffMs / (1000 * 60));
};

/**
 * 오늘 날짜인지 확인합니다.
 * @param {Date} date - 확인할 날짜
 * @returns {boolean} 오늘 날짜인지 여부
 */
export const isToday = (date) => {
  const today = new Date().toDateString();
  return new Date(date).toDateString() === today;
};

