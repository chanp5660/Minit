# 🍅 뽀모도로 타이머

Windows 독립 실행 프로그램으로 만든 집중력 향상 타이머 앱

## 설치 방법

### 1. 패키지 설치
```bash
npm install
```

### 2. 개발 모드 실행
```bash
npm run electron:dev
```

### 3. Windows 실행 파일 빌드
```bash
npm run electron:build
```

빌드가 완료되면 `dist-electron` 폴더에 다음 파일이 생성됩니다:
- `뽀모도로 타이머 Setup 1.0.0.exe` - 설치 프로그램
- `뽀모도로 타이머 1.0.0.exe` - 휴대용 실행 파일

## 기능

- ⏱️ 사용자 정의 타이머 설정 (15/25/30/45/60분 또는 직접 입력)
- 📊 작업 통계 및 완료율 추적
- 🎯 작업별 시간 기록
- 🔔 타이머 완료 알림
- 💾 부분 완료 저장 기능

## 기술 스택

- **Frontend**: React 18
- **Build Tool**: Vite 5
- **Desktop Framework**: Electron 28
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
