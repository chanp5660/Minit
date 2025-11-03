/**
 * 뷰 모드 토글 컴포넌트
 */
export const ViewModeToggle = ({ viewMode, setViewMode, darkMode }) => {
  return (
    <div className={`flex gap-2 rounded-lg p-1 ${
      darkMode ? 'bg-gray-700' : 'bg-gray-100'
    }`}>
      <button
        onClick={() => setViewMode('list')}
        className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
          viewMode === 'list'
            ? 'bg-purple-500 text-white shadow-md'
            : darkMode
              ? 'text-gray-300 hover:bg-gray-600'
              : 'text-gray-600 hover:bg-gray-200'
        }`}
      >
        📋 목록
      </button>
      <button
        onClick={() => setViewMode('timeline')}
        className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
          viewMode === 'timeline'
            ? 'bg-purple-500 text-white shadow-md'
            : darkMode
              ? 'text-gray-300 hover:bg-gray-600'
              : 'text-gray-600 hover:bg-gray-200'
        }`}
      >
        📊 시간 현황
      </button>
    </div>
  );
};

