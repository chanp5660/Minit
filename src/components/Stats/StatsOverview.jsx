/**
 * 통계 개요 컴포넌트
 */
export const StatsOverview = ({ stats, darkMode, dataPath }) => {
  return (
    <>
      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
          <div className="text-3xl font-bold">{stats.totalHours}h</div>
          <div className="text-purple-100">오늘 집중 시간</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <div className="text-3xl font-bold">{stats.sessionCount}</div>
          <div className="text-blue-100">오늘 세션</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
          <div className="text-3xl font-bold">{stats.completedCount}</div>
          <div className="text-green-100">완료</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-5 text-white">
          <div className="text-3xl font-bold">{stats.inProgressCount}</div>
          <div className="text-yellow-100">진행 중</div>
        </div>
      </div>

      {/* Data Location Info */}
      {dataPath && (
        <div className={`mb-6 p-4 rounded-lg border ${
          darkMode
            ? 'bg-gray-700 border-gray-600'
            : 'bg-gray-50 border-gray-200'
        }`}>
          <h3 className={`text-sm font-semibold mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>📁 데이터 저장 위치</h3>
          <p className={`text-xs font-mono break-all ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>{dataPath}\dotime-sessions.json</p>
          <p className={`text-xs mt-1 ${
            darkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>프로그램 종료 후에도 기록이 유지됩니다</p>
        </div>
      )}
    </>
  );
};

