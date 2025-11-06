import { Github } from 'lucide-react';

/**
 * 헤더 컴포넌트
 */
export const Header = ({
  focusMode,
  darkMode,
  getActiveMemoContent,
  alwaysOnTop,
  toggleAlwaysOnTop,
  toggleFocusMode,
  openGithub,
  setDarkMode
}) => {
  return (
    <div className={`text-center relative ${focusMode ? 'mb-4 pt-4' : 'mb-8 pt-8'}`}>
      <h1 className={`font-bold ${
        darkMode ? 'text-gray-100' : 'text-gray-800'
      } ${focusMode ? 'text-xl mb-1' : 'text-4xl mb-2'}`}>
        {focusMode ? (getActiveMemoContent().trim() || '작업 제목 없음') : '⏰ Even5Minutes'}
      </h1>
      {!focusMode && <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>작업 실행 시간을 기록하고 추적하세요</p>}
      {/* Always on Top Button */}
      <button
        onClick={toggleAlwaysOnTop}
        className={`absolute top-0 right-0 rounded-lg transition-all shadow-md ${
          focusMode ? 'p-2 text-sm' : 'p-3'
        } ${
          alwaysOnTop
            ? 'bg-purple-500 text-white hover:bg-purple-600'
            : darkMode
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-white text-gray-600 hover:bg-gray-100'
        }`}
        title={alwaysOnTop ? '최상단 고정 해제' : '최상단 고정'}
      >
        📌
      </button>
      {/* Focus Mode Button */}
      <button
        onClick={toggleFocusMode}
        className={`absolute top-0 rounded-lg transition-all shadow-md ${
          focusMode ? 'right-12 p-2 text-sm' : 'right-16 p-3'
        } ${
          focusMode
            ? 'bg-orange-500 text-white hover:bg-orange-600'
            : darkMode
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-white text-gray-600 hover:bg-gray-100'
        }`}
        title={focusMode ? '일반 모드로 전환' : '집중 모드로 전환'}
      >
        🎯
      </button>
      {/* GitHub Link Button */}
      <button
        onClick={openGithub}
        className={`absolute top-0 rounded-lg transition-all shadow-md ${
          focusMode ? 'right-36 p-2 text-sm' : 'right-48 p-3'
        } ${
          darkMode
            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            : 'bg-white text-gray-600 hover:bg-gray-100'
        }`}
        title="GitHub 저장소"
      >
        <Github className={focusMode ? 'w-4 h-4' : 'w-5 h-5'} />
      </button>
      {/* Dark Mode Toggle Button */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`absolute top-0 rounded-lg transition-all shadow-md ${
          focusMode ? 'right-24 p-2 text-sm' : 'right-32 p-3'
        } ${
          darkMode
            ? 'bg-yellow-500 text-white hover:bg-yellow-600'
            : 'bg-gray-700 text-white hover:bg-gray-800'
        }`}
        title={darkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
    </div>
  );
};

