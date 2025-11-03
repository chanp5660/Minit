/**
 * 태그 필터 컴포넌트 (통계 탭용)
 */
export const TagFilter = ({ tags, selectedTags, toggleTagFilter, setSelectedTags, darkMode }) => {
  if (tags.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className={`text-xl font-semibold mb-4 ${
        darkMode ? 'text-gray-100' : 'text-gray-800'
      }`}>
        📌 태그
        {selectedTags.length > 0 && (
          <span className={`ml-2 text-sm font-normal ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            ({selectedTags.length}개 선택됨)
          </span>
        )}
      </h3>
      <div className="flex gap-2 flex-wrap">
        {tags.map((tag, index) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={index}
              onClick={() => toggleTagFilter(tag)}
              className={`px-4 py-2 rounded-full text-sm font-medium shadow-sm transition-all hover:shadow-md ${
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
          onClick={() => setSelectedTags([])}
          className={`mt-3 text-sm underline ${
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

