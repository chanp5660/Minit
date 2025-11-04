/**
 * 시간 설정 컴포넌트
 */
export const DurationSelector = ({
  selectedDuration,
  customMinutes,
  setCustomMinutes,
  setDuration,
  isRunning,
  timerType,
  darkMode,
  focusMode,
  handleCustomDuration
}) => {
  if (focusMode) return null;

  return (
    <>
      <div className="mb-6">
        <label className={`block text-sm font-medium mb-3 ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          시간 설정
        </label>
        <div className="flex gap-3 flex-wrap items-center">
          {/* Duration Presets */}
          <div className="flex gap-3 flex-wrap">
            {[5, 10, 15, 25, 30].map(mins => (
              <button
                key={mins}
                onClick={() => setDuration(mins)}
                disabled={isRunning}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  selectedDuration === mins
                    ? `${timerType === 'work' ? 'bg-purple-500' : 'bg-blue-500'} text-white shadow-md`
                    : darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {mins}분
              </button>
            ))}
          </div>

          {/* Custom Duration */}
          <div className="flex gap-2 ml-auto">
            <input
              type="number"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              placeholder="사용자 정의 (분)"
              className={`w-32 px-4 py-2 border-2 rounded-lg focus:outline-none ${
                timerType === 'work' ? 'focus:border-purple-500' : 'focus:border-blue-500'
              } ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                  : 'bg-white border-gray-200 text-gray-800'
              }`}
              disabled={isRunning}
              min="1"
              max="180"
            />
            <button
              onClick={handleCustomDuration}
              disabled={isRunning || !customMinutes}
              className={`px-6 py-2 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                timerType === 'work'
                  ? 'bg-purple-500 hover:bg-purple-600'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              설정
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

