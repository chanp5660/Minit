# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-XX

### Added
- **타이머 기능**
  - 작업/휴식 모드 전환
  - 사용자 정의 시간 설정 (1-180분)
  - 프리셋 시간 옵션 (5/10/15/25/30/45/60분)
  - 부분 완료 저장 기능
  - 시스템 알림 및 오디오 알림

- **작업 관리**
  - 실시간 통계 (총 집중 시간, 세션 수, 완료율)
  - 태그 시스템 (`#태그` 문법)
  - 태그 필터링 (다중 선택 지원)
  - 작업 재시작 기능

- **시각화**
  - 목록 뷰 (시간순 작업 리스트)
  - 타임라인 뷰 (24시간 작업 패턴)
  - 겹치는 작업 표시
  - 색상 구분 (완료/미완료)

- **메모 기능**
  - 다중 메모창 관리
  - 메모 순서 조정
  - 자동 저장

- **UI/UX**
  - 다크 모드 지원
  - Always on Top 기능
  - Focus Mode (미니멀 모드)
  - 반응형 디자인

- **데이터 관리**
  - 자동 저장 (작업, 메모, 태그, 설정)
  - 영구 보관
  - 데이터 위치 표시

### Technical Details
- **Frontend**: React 18
- **Build Tool**: Vite 5
- **Desktop Framework**: Electron 28
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

### Build Output
- Windows 설치 프로그램: `Minit Setup 1.0.0.exe`
- Windows 휴대용 실행 파일: `Minit 1.0.0.exe`
