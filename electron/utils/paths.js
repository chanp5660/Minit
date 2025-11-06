const { app } = require('electron');
const path = require('path');
const fs = require('fs');

// 데이터 저장 경로 함수
function getDataPath() {
  // 사용자 데이터 디렉토리의 data 폴더
  // Windows: C:\Users\user\AppData\Roaming\even5minutes\data
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'data');
}

function getSessionsFilePath() {
  return path.join(getDataPath(), 'even5minutes-sessions.json');
}

function getMemosFilePath() {
  return path.join(getDataPath(), 'even5minutes-memos.json');
}

function getTagsFilePath() {
  return path.join(getDataPath(), 'even5minutes-tags.json');
}

function getDarkModeFilePath() {
  return path.join(getDataPath(), 'even5minutes-darkmode.json');
}

function getDontAskDeleteFilePath() {
  return path.join(getDataPath(), 'even5minutes-dont-ask-delete.json');
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
  getTagsFilePath,
  getDarkModeFilePath,
  getDontAskDeleteFilePath,
  ensureDataDirectory
};

