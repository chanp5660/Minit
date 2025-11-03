const { app } = require('electron');
const path = require('path');
const fs = require('fs');

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

module.exports = {
  getDataPath,
  getSessionsFilePath,
  getMemosFilePath,
  getLegacyMemoFilePath,
  getTagsFilePath,
  getDarkModeFilePath,
  getDontAskDeleteFilePath,
  ensureDataDirectory
};

