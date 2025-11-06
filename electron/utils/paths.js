const { app } = require('electron');
const path = require('path');
const fs = require('fs');

// 데이터 저장 경로 함수
function getDataPath() {
  // 사용자 데이터 디렉토리의 data 폴더
  // Windows: C:\Users\user\AppData\Roaming\minit\data
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'data');
}

function getSessionsFilePath() {
  return path.join(getDataPath(), 'minit-sessions.json');
}

function getMemosFilePath() {
  return path.join(getDataPath(), 'minit-memos.json');
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
  getTagsFilePath,
  getDarkModeFilePath,
  getDontAskDeleteFilePath,
  ensureDataDirectory
};

