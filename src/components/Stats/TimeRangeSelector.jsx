/**
 * 시간 범위 선택 컴포넌트
 */
export const TimeRangeSelector = ({ startHour, endHour, onStartChange, onEndChange, darkMode }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className={`flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
      <span className="text-sm font-medium">시간 범위:</span>
      <select
        value={startHour}
        onChange={(e) => {
          const newStart = parseInt(e.target.value, 10);
          if (newStart < endHour) {
            onStartChange(newStart);
          }
        }}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
          darkMode
            ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        } focus:outline-none focus:ring-2 focus:ring-purple-500`}
      >
        {hours.map((hour) => (
          <option key={hour} value={hour}>
            {hour.toString().padStart(2, '0')}시
          </option>
        ))}
      </select>
      <span className="text-sm">~</span>
      <select
        value={endHour}
        onChange={(e) => {
          const newEnd = parseInt(e.target.value, 10);
          if (newEnd > startHour) {
            onEndChange(newEnd);
          }
        }}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
          darkMode
            ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        } focus:outline-none focus:ring-2 focus:ring-purple-500`}
      >
        {hours.map((hour) => (
          <option key={hour} value={hour}>
            {hour.toString().padStart(2, '0')}시
          </option>
        ))}
      </select>
    </div>
  );
};

