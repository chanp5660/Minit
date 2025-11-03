/**
 * 타이머 타입 토글 (작업/휴식)
 */
export const TimerTypeToggle = ({ timerType, toggleTimerType, isRunning, darkMode }) => {
  return (
    <div className="flex justify-center mb-6">
      <div className={`inline-flex rounded-lg p-1 ${
        timerType === 'work'
          ? darkMode ? 'bg-purple-900' : 'bg-purple-100'
          : darkMode ? 'bg-blue-900' : 'bg-blue-100'
      }`}>
        <button
          onClick={() => timerType === 'break' && toggleTimerType()}
          disabled={isRunning}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            timerType === 'work'
              ? 'bg-purple-500 text-white shadow-md'
              : darkMode
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-600 hover:bg-gray-50'
          } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          💼 작업
        </button>
        <button
          onClick={() => timerType === 'work' && toggleTimerType()}
          disabled={isRunning}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            timerType === 'break'
              ? 'bg-blue-500 text-white shadow-md'
              : darkMode
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-600 hover:bg-gray-50'
          } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          ☕ 휴식
        </button>
      </div>
    </div>
  );
};

