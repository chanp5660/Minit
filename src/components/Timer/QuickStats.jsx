/**
 * 오늘의 요약 통계 컴포넌트
 */
export const QuickStats = ({ stats, timerType, darkMode }) => {
  return (
    <div className={`mt-8 pt-6 border-t-2 ${
      darkMode ? 'border-gray-700' : 'border-gray-100'
    }`}>
      <h3 className={`text-lg font-semibold mb-3 ${
        darkMode ? 'text-gray-200' : 'text-gray-700'
      }`}>오늘의 요약</h3>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className={`rounded-lg p-4 text-center ${
          timerType === 'work'
            ? darkMode ? 'bg-purple-900' : 'bg-purple-50'
            : darkMode ? 'bg-blue-900' : 'bg-blue-50'
        }`}>
          <div className={`text-2xl font-bold ${
            timerType === 'work'
              ? darkMode ? 'text-purple-400' : 'text-purple-600'
              : darkMode ? 'text-blue-400' : 'text-blue-600'
          }`}>{stats.totalHours}h</div>
          <div className={`text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>집중 시간</div>
        </div>
        <div className={`rounded-lg p-4 text-center ${
          timerType === 'work'
            ? darkMode ? 'bg-blue-900' : 'bg-blue-50'
            : darkMode ? 'bg-green-900' : 'bg-green-50'
        }`}>
          <div className={`text-2xl font-bold ${
            timerType === 'work'
              ? darkMode ? 'text-blue-400' : 'text-blue-600'
              : darkMode ? 'text-green-400' : 'text-green-600'
          }`}>{stats.sessionCount}</div>
          <div className={`text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>총 세션</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className={`rounded-lg p-3 text-center ${
          darkMode ? 'bg-green-900' : 'bg-green-50'
        }`}>
          <div className={`text-xl font-bold ${
            darkMode ? 'text-green-400' : 'text-green-600'
          }`}>{stats.completedCount}</div>
          <div className={`text-xs ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>완료</div>
        </div>
        <div className={`rounded-lg p-3 text-center ${
          darkMode ? 'bg-yellow-900' : 'bg-yellow-50'
        }`}>
          <div className={`text-xl font-bold ${
            darkMode ? 'text-yellow-400' : 'text-yellow-600'
          }`}>{stats.inProgressCount}</div>
          <div className={`text-xs ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>진행 중</div>
        </div>
      </div>
    </div>
  );
};

