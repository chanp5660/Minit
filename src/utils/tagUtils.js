/**
 * 태그 관련 유틸리티 함수
 */

/**
 * 텍스트에서 #태그 형식의 태그를 추출합니다.
 * @param {string} text - 태그를 추출할 텍스트
 * @returns {string[]} 추출된 태그 배열
 */
export const extractTags = (text) => {
  if (!text) return [];
  const regex = /#([^\s#]+)/g;
  const matches = text.match(regex);
  return matches ? matches.map(tag => tag.substring(1)) : [];
};

/**
 * 태그 배열에 새로운 태그를 추가합니다 (중복 제거).
 * @param {string[]} tags - 기존 태그 배열
 * @param {string} tag - 추가할 태그
 * @returns {string[]} 업데이트된 태그 배열
 */
export const addTag = (tags, tag) => {
  if (!tags.includes(tag)) {
    return [...tags, tag];
  }
  return tags;
};

/**
 * 태그 배열에서 태그를 제거합니다.
 * @param {string[]} tags - 기존 태그 배열
 * @param {string} tag - 제거할 태그
 * @returns {string[]} 업데이트된 태그 배열
 */
export const removeTag = (tags, tag) => {
  return tags.filter(t => t !== tag);
};

/**
 * 태그 필터를 토글합니다 (선택/해제).
 * @param {string[]} selectedTags - 현재 선택된 태그 배열
 * @param {string} tag - 토글할 태그
 * @returns {string[]} 업데이트된 선택된 태그 배열
 */
export const toggleTagFilter = (selectedTags, tag) => {
  if (selectedTags.includes(tag)) {
    return selectedTags.filter(t => t !== tag);
  } else {
    return [...selectedTags, tag];
  }
};

