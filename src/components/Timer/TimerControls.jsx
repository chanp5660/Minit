import { Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';

/**
 * 타이머 컨트롤 버튼 컴포넌트
 */
export const TimerControls = ({
  isRunning,
  focusMode,
  timerType,
  timeLeft,
  selectedDuration,
  getActiveMemoContent,
  startTimer,
  pauseTimer,
  resetTimer,
  saveCurrentSession,
  darkMode
}) => {
  const activeMemoContent = getActiveMemoContent ? getActiveMemoContent() : '';
  const showWorkContent = !focusMode && timerType === 'work' && activeMemoContent.trim();

  return (
    <div>
      <div className={`flex justify-center ${focusMode ? 'gap-2 mb-4' : 'gap-4 mb-4'}`}>
        {!isRunning ? (
          <button
            onClick={startTimer}
            className={`bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold shadow-lg transition-all flex items-center gap-2 ${
              focusMode ? 'px-4 py-2 text-sm' : 'px-8 py-4 text-lg'
            }`}
          >
            <Play className={focusMode ? 'w-4 h-4' : 'w-6 h-6'} />
            시작
          </button>
        ) : (
          <button
            onClick={pauseTimer}
            className={`bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-semibold shadow-lg transition-all flex items-center gap-2 ${
              focusMode ? 'px-4 py-2 text-sm' : 'px-8 py-4 text-lg'
            }`}
          >
            <Pause className={focusMode ? 'w-4 h-4' : 'w-6 h-6'} />
            일시정지
          </button>
        )}
        <button
          onClick={resetTimer}
          className={`bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold shadow-lg transition-all flex items-center gap-2 ${
            focusMode ? 'px-4 py-2 text-sm' : 'px-8 py-4 text-lg'
          }`}
        >
          <RotateCcw className={focusMode ? 'w-4 h-4' : 'w-6 h-6'} />
          리셋
        </button>
        {!focusMode && timerType === 'work' && (
          <button
            onClick={saveCurrentSession}
            disabled={!getActiveMemoContent().trim() || timeLeft === selectedDuration * 60}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-6 h-6" />
            저장
          </button>
        )}
      </div>
      
      {/* 현재 작업 표시 영역 (버튼 아래) */}
      {showWorkContent && (
        <div className="flex justify-center mb-8">
          <div className={`text-base font-medium line-clamp-1 overflow-hidden max-w-2xl px-4 ${
            darkMode ? 'text-gray-200' : 'text-gray-700'
          }`}>
            {activeMemoContent}
          </div>
        </div>
      )}
    </div>
  );
};

