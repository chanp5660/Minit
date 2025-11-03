/**
 * 메모 태그 필터 컴포넌트
 */
export const MemoTagFilter = ({
  allTags,
  selectedTags,
  toggleTagFilter,
  clearFilter,
  darkMode
}) => {
  if (allTags.length === 0) return null;

  return (
    <div className="mb-4">
      <label className={`block text-xs font-medium mb-2 ${
        darkMode ? 'text-gray-400' : 'text-gray-500'
      }`}>
        태그 필터
        {selectedTags.length > 0 && (
          <span className={`ml-2 ${
            darkMode ? 'text-purple-400' : 'text-purple-600'
          }`}>
            ({selectedTags.length}개 선택됨)
          </span>
        )}
      </label>
      <div className="flex gap-2 flex-wrap">
        {allTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => toggleTagFilter(tag)}
              className={`px-3 py-1 rounded-full text-sm font-medium shadow-sm transition-all hover:shadow-md ${
                isSelected
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-105'
                  : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 hover:from-purple-200 hover:to-pink-200'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
      {selectedTags.length > 0 && (
        <button
          onClick={clearFilter}
          className={`mt-2 text-xs underline ${
            darkMode
              ? 'text-gray-400 hover:text-gray-300'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          필터 초기화
        </button>
      )}
    </div>
  );
};

