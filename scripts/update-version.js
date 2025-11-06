const fs = require('fs');
const path = require('path');

// package.json에서 버전 읽기
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const version = packageJson.version;

// README.md 업데이트
const readmePath = 'README.md';
let readme = fs.readFileSync(readmePath, 'utf-8');
readme = readme.replace(/version-\d+\.\d+\.\d+/g, `version-${version}`);
fs.writeFileSync(readmePath, readme);

// CHANGELOG.md에 새 섹션 추가 (예시)
const changelogPath = 'CHANGELOG.md';
let changelog = fs.readFileSync(changelogPath, 'utf-8');
const today = new Date().toISOString().split('T')[0];
const newEntry = `## [${version}] - ${today}\n\n### Changed\n- 버전 업데이트\n\n`;

// 기존 버전 섹션 앞에 추가
changelog = changelog.replace(/(## \[.*?\])/, `${newEntry}$1`);
fs.writeFileSync(changelogPath, changelog);

console.log(`✅ 버전이 ${version}로 업데이트되었습니다.`);
