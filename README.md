# ⏰ Minit

![Version](https://img.shields.io/badge/version-1.0.3-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows-lightgrey.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

집중력이 떨어질 때도 꾸준히 성장할 수 있도록 도와주는 스마트 타이머 앱

## 이런 분들에게 추천합니다

- **집중력이 떨어질 때**: "5분만이라도 집중하자"에서 시작해서 점점 시간을 늘려 25분까지 집중할 수 있도록 도와줍니다
- **작업 시간을 추적하고 싶을 때**: 하루 동안 얼마나 집중했는지 시각적으로 확인하고 보람을 느낄 수 있습니다
- **포모도로 기법을 활용하고 싶을 때**: 25분 집중 + 5분 휴식의 리듬으로 생산성을 높이고 싶은 분
- **멀티태스킹으로 정신없을 때**: 태그 시스템으로 작업을 분류하고 우선순위를 정리할 수 있습니다
- **작업 패턴을 분석하고 싶을 때**: 타임라인 뷰로 언제 가장 집중했는지 파악할 수 있습니다

## 주요 기능

### ⏱️ 타이머
- **작업/휴식 모드**: 집중 작업과 휴식 시간을 분리하여 관리
- **사용자 정의 시간 설정**: 5/10/15/25/30/45/60분 프리셋 또는 직접 입력 (1-180분)
- **시스템 알림**: 타이머 완료 시 시스템 알림 및 오디오 알림
- **부분 완료 저장**: 타이머 진행 중에도 현재까지의 시간 저장 가능
- **오디오 알림**: 타이머 완료 시 사운드 효과 재생

### 📊 작업 관리
- **실시간 통계**: 오늘의 총 집중 시간, 세션 수, 완료율 추적
- **태그 시스템**: `#태그` 문법으로 작업 분류 및 카테고리화
- **태그 필터링**: 태그 클릭으로 원하는 작업만 필터링 (다중 선택 지원)
- **세션 수정**: 세션의 제목, 시작 시간, 종료 시간 수정 가능
- **세션 삭제**: 세션 삭제 시 확인 모달 (다시 묻지 않음 옵션 제공)
- **작업 재시작**: 이전에 수행한 작업을 원클릭으로 다시 시작

### 📈 시각화
- **목록 뷰**: 작업을 시간순 리스트로 확인
- **타임라인 뷰**: 24시간 타임라인으로 하루의 작업 패턴을 시각적으로 파악
- **시간 범위 선택**: 타임라인 뷰에서 표시할 시간 범위를 사용자가 직접 설정 가능
- **겹치는 작업 표시**: 동시간대 작업 감지 및 투명도로 표현
- **색상 구분**: 완료(녹색) / 진행 중(노랑) / 미완료(빨강) 작업 시각적 구분

### 📝 메모
- **다중 메모창**: 여러 개의 메모를 동시에 관리
- **메모 선택**: 라디오 버튼으로 작업할 메모 선택
- **메모 순서 조정**: 위/아래 버튼 또는 드래그 앤 드롭으로 메모 순서 변경
- **자동 저장**: 메모 내용 실시간 자동 저장
- **메모 복사**: 클립보드로 메모 내용 복사 기능
- **메모 태그 필터링**: 태그로 메모 필터링하여 필요한 메모만 표시
- **태그 자동 적용**: 태그 필터 선택 후 새 메모 추가 시 선택된 태그가 자동으로 적용됨

### 🎨 UI/UX
- **다크 모드**: 눈의 피로를 줄이는 다크 그레이 테마 (🌙/☀️ 토글)
- **Always on Top**: 창을 항상 최상단에 고정 (📌 버튼)
- **Focus Mode**: 타이머만 표시하는 미니멀 모드 (🎯 버튼)
- **반응형 디자인**: 창 크기에 따라 자동 조정

### 💾 데이터 관리
- **자동 저장**: 모든 작업, 메모, 태그, 설정 자동 저장
- **영구 보관**: 앱 종료 후에도 데이터 유지
- **데이터 위치 표시**: 통계 탭에서 데이터 저장 경로 확인 가능
- **삭제 확인 설정**: 세션/메모 삭제 시 확인 여부를 사용자가 설정 가능
- **자동 마이그레이션**: 앱 업데이트 시 이전 버전 데이터 자동 마이그레이션

## 스크린샷

> **참고**: 스크린샷은 개발 중이며, 실제 앱의 모습과 다를 수 있습니다.

- 타이머 화면
![다크모드-타이머1](https://i.imgur.com/RWQsEH8.png)
![다크모드-타이머2](https://i.imgur.com/di17ODr.png)

- 통계화면
![라이트모드-통계1](https://i.imgur.com/FQfD4m1.png)
![라이트모드-통계2](https://i.imgur.com/Mpr3zY7.png)

- 시간현황
![라이트모드-시간현황](https://i.imgur.com/RpgCkfV.png)

- Focus Mode
![다크모드-Focus Mode](https://i.imgur.com/GHJNYO5.png)

## 다운로드 및 실행

빌드가 완료되면 `dist-electron` 폴더에 다음 파일이 생성됩니다:
- `Minit Setup 1.0.2.exe` - 설치 프로그램
- `Minit 1.0.2.exe` - 휴대용 실행 파일


## 사용 방법

### 기본 작업 흐름
1. **메모 작성**: 메모 영역에 작업 내용 입력 (예: `#프로젝트 API 개발`)
2. **메모 선택**: 시작할 메모의 라디오 버튼 선택
3. **시간 설정**: 25분 권장 (포모도로 기법) 또는 원하는 시간 선택
4. **타이머 시작**: ▶️ 버튼 클릭
5. **타이머 완료**: 완료/미완료/진행 중 선택
6. **부분 저장**: 타이머 진행 중에도 ⏸️ 버튼 옆의 부분 저장 버튼으로 현재까지의 시간 저장 가능
7. **휴식 모드**: 작업 완료 후 휴식 타이머로 전환 가능

### 메모 관리
- **다중 메모**: 여러 작업을 동시에 관리하려면 + 버튼으로 새 메모 추가
- **메모 순서 조정**: 위/아래 버튼 또는 드래그 앤 드롭으로 순서 변경
- **메모 복사**: 각 메모의 복사 버튼으로 메모 내용을 클립보드에 복사
- **메모 태그 필터링**: 메모 영역의 태그 버튼으로 특정 태그가 포함된 메모만 필터링
- **태그 자동 적용**: 태그 필터를 선택한 상태에서 새 메모를 추가하면 선택된 태그가 자동으로 메모 내용에 추가됨
- **자동 저장**: 메모 내용은 실시간으로 자동 저장됩니다

### 태그 활용 팁
- 메모 내용에 `#태그` 형식으로 태그 추가 (예: `#회의 #기획`)
- 통계 탭에서 태그 클릭으로 해당 태그 작업만 필터링
- 여러 태그 동시 선택 가능 (AND 조건으로 필터링)
- 태그는 자동으로 저장되어 빠른 입력 가능

### 집중 모드 활용
- 🎯 버튼으로 Focus Mode 전환
- 작은 화면으로 타이머만 표시
- 방해 요소 최소화로 집중력 향상
- Focus Mode에서는 선택된 메모 내용이 타이머에 표시됩니다

### 휴식 모드 활용
- 작업 타이머와 휴식 타이머를 전환하여 사용
- 휴식 시간에는 메모 선택 불필요
- 휴식 완료 시 자동으로 리셋되어 다음 작업 준비

### 통계 및 세션 관리
- **목록 뷰**: 작업을 시간순 리스트로 확인
- **타임라인 뷰**: 📊 타임라인 버튼으로 하루 작업 패턴 확인
- **시간 범위 선택**: 타임라인 뷰에서 표시할 시간 범위 조정 가능 (기본: 9시~21시)
- **세션 상세 보기**: 타임라인 또는 목록에서 세션 클릭 시 상세 정보 확인
- **세션 수정**: 세션 상세 모달에서 제목, 시작 시간, 종료 시간 수정 가능
- **세션 재시작**: 이전 세션을 원클릭으로 다시 시작
- **세션 삭제**: 세션 삭제 시 확인 모달 표시 (다시 묻지 않음 옵션 제공)

## 데이터 저장

모든 데이터는 실행 파일과 같은 폴더의 `data` 디렉토리에 JSON 형식으로 저장됩니다:

```
{실행파일 폴더}/data/
├── minit-sessions.json          # 작업 세션 기록
├── minit-memos.json             # 메모 내용 (다중 메모 배열)
├── minit-tags.json              # 태그 목록
├── minit-darkmode.json          # 다크 모드 설정
├── minit-dont-ask-delete.json  # 삭제 확인 설정 (다시 묻지 않음 옵션)
└── minit-app-version.json       # 앱 버전 정보 (마이그레이션용)
```

통계 탭에서 정확한 데이터 저장 위치를 확인할 수 있습니다.


## 기술 스택

- **Frontend**: React 18
- **Build Tool**: Vite 5
- **Desktop Framework**: Electron 28
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## 프로젝트 구조

```
minit/
├── src/
│   ├── App.jsx                    # 메인 React 컴포넌트
│   ├── main.jsx                   # React 진입점
│   ├── components/                # React 컴포넌트
│   │   ├── Header.jsx            # 헤더 (다크모드, Always on Top 등)
│   │   ├── TabNavigation.jsx     # 탭 네비게이션
│   │   ├── Timer/                # 타이머 관련 컴포넌트
│   │   │   ├── TimerDisplay.jsx
│   │   │   ├── TimerControls.jsx
│   │   │   ├── TimerTypeToggle.jsx
│   │   │   └── DurationSelector.jsx
│   │   ├── Memo/                 # 메모 관련 컴포넌트
│   │   │   ├── MemoList.jsx
│   │   │   ├── MemoItem.jsx
│   │   │   └── MemoTagFilter.jsx
│   │   ├── Stats/                # 통계 관련 컴포넌트
│   │   │   ├── StatsOverview.jsx
│   │   │   ├── SessionList.jsx
│   │   │   ├── SessionListItem.jsx
│   │   │   ├── TimelineView.jsx
│   │   │   ├── TagFilter.jsx
│   │   │   ├── ViewModeToggle.jsx
│   │   │   └── TimeRangeSelector.jsx
│   │   └── Modals/               # 모달 컴포넌트
│   │       ├── ConfirmationModal.jsx
│   │       ├── PartialSaveModal.jsx
│   │       └── DeleteConfirmModal.jsx
│   ├── hooks/                    # 커스텀 React 훅
│   │   ├── useTimer.js
│   │   ├── useMemos.js
│   │   ├── useSessions.js
│   │   ├── useTags.js
│   │   ├── useStatistics.js
│   │   ├── useDarkMode.js
│   │   ├── useNotifications.js
│   │   └── useWindowSettings.js
│   └── utils/                    # 유틸리티 함수
│       ├── timeUtils.js
│       ├── tagUtils.js
│       └── sessionUtils.js
├── electron/
│   ├── main.js                   # Electron 메인 프로세스 진입점
│   ├── handlers/                 # IPC 핸들러 모듈
│   │   ├── sessions.js          # 세션 관리 핸들러
│   │   ├── memos.js             # 메모 관리 핸들러
│   │   ├── tags.js              # 태그 관리 핸들러
│   │   ├── settings.js          # 설정 관리 핸들러
│   │   └── window.js            # 윈도우 관리 핸들러
│   └── utils/                    # Electron 유틸리티
│       ├── paths.js             # 데이터 경로 관리
│       ├── storage.js            # 파일 저장/로드
│       └── schema.js             # 스키마 버전 관리
├── dist/                         # Vite 빌드 결과
├── dist-electron/                # Electron 빌드 결과
└── data/                         # 사용자 데이터 저장 (런타임 생성)
```

## 개발 배경

이 프로그램은 집중력이 낮을 때 사용하는 도구입니다. 굳이 집중이 잘 될 때 사용할 필요는 없고, 집중이 안 되는 경우에 "5분만이라도 집중하자"에서 점점 시간을 늘려 "25분 정도까지는 집중"할 수 있도록 하려는 것이 프로그램을 만든 주된 동기입니다.

통계 기능을 넣은 것은 집중이 안 될 때는 얼마나 했는지도 가늠이 안되는데, 집중이 안되는데도 이만큼 했구나 하고 보람을 느낄 수 있도록 하기 위함입니다. 그래서 당일에 대한 통계 기록만 있고 일주일, 한달에 대한 통계 내용은 없는 것입니다. 매일 집중이 안 될 리는 없다고 생각됩니다.

## 최근 업데이트

- **v1.0.2** (현재 버전): 버전 업데이트 및 안정성 개선
  - 데이터 마이그레이션 기능 개선
  - 버그 수정 및 성능 최적화

- **v1.0.0**: 초기 릴리스
  - 작업/휴식 타이머 기능
  - 태그 시스템 및 필터링
  - 다중 메모 관리
  - 타임라인 시각화
  - 다크 모드 지원
  - Focus Mode 및 Always on Top
  - 오디오 알림 기능
  - 통계 및 데이터 관리

## 개발자 가이드

### 설치 및 실행
```bash
# 패키지 설치
npm install

# 개발 모드 실행
npm run electron:dev

# Windows 실행 파일 빌드
npm run electron:build
```

**⚠️ 주의사항**: `npm run electron:build` 명령어에서 오류가 발생하면 cmd를 관리자 권한으로 실행하여 명령어를 실행해야 합니다.

### 버전 업데이트

```bash
npm run version:patch   # 패치 버전 업데이트 (1.0.2 → 1.0.3)
npm run version:minor   # 마이너 버전 업데이트 (1.0.2 → 1.1.0)
npm run version:major   # 메이저 버전 업데이트 (1.0.2 → 2.0.0)
```

이 명령어는 자동으로:
- `package.json`의 버전을 업데이트합니다
- `README.md`의 버전 배지를 업데이트합니다
- `CHANGELOG.md`에 새 버전 항목을 추가합니다
- Git 커밋과 태그를 생성합니다

### 빌드 스크립트
- `npm run dev` - Vite 개발 서버만 실행
- `npm run build` - Vite 프로덕션 빌드
- `npm run electron:dev` - Electron 개발 모드 (추천)
- `npm run electron:build` - Windows 실행 파일 빌드

### IPC 핸들러
Electron handlers 모듈에 구현된 IPC 핸들러:

**세션 관리** (`handlers/sessions.js`)
- `save-sessions` / `load-sessions` - 작업 세션 저장/로드 (스키마 마이그레이션 지원)

**메모 관리** (`handlers/memos.js`)
- `save-memos` / `load-memos` - 메모 저장/로드 (다중 메모 배열, 스키마 마이그레이션 지원)

**태그 관리** (`handlers/tags.js`)
- `save-tags` / `load-tags` - 태그 저장/로드

**설정 관리** (`handlers/settings.js`)
- `save-dark-mode` / `load-dark-mode` - 다크 모드 설정 저장/로드
- `save-dont-ask-delete` / `load-dont-ask-delete` - 삭제 확인 설정 저장/로드

**윈도우 관리** (`handlers/window.js`)
- `get-data-path` - 데이터 저장 경로 조회
- `toggle-always-on-top` - Always on Top 토글
- `get-always-on-top` - Always on Top 상태 조회
- `set-window-size` - 창 크기 조절

## 라이선스

MIT License
