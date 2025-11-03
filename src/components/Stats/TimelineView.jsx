import { Clock } from 'lucide-react';

/**
 * 타임라인 뷰 컴포넌트
 */
export const TimelineView = ({
  hourlyUsage,
  selectedTags,
  darkMode,
  setExpandedTimeSlot
}) => {
  const getProgressBarColor = (percentage) => {
    if (percentage === 0) return 'bg-gray-300';
    if (percentage <= 50) return 'bg-blue-400';
    if (percentage <= 80) return 'bg-green-400';
    if (percentage <= 100) return 'bg-orange-400';
    return 'bg-red-500';
  };
  
  const getTextColor = (percentage) => {
    if (percentage === 0) return darkMode ? 'text-gray-500' : 'text-gray-400';
    if (percentage <= 50) return 'text-blue-600';
    if (percentage <= 80) return 'text-green-600';
    if (percentage <= 100) return 'text-orange-600';
    return 'text-red-600';
  };

  if (hourlyUsage.length === 0 || hourlyUsage.every(h => h.isEmpty)) {
    return (
      <div className={`text-center py-12 ${
        darkMode ? 'text-gray-500' : 'text-gray-400'
      }`}>
        <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p>
          {selectedTags.length > 0
            ? '선택한 태그와 일치하는 작업 기록이 없습니다'
            : '아직 기록된 세션이 없습니다'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {hourlyUsage.map((hourData, index) => (
        <div
          key={index}
          onClick={() => !hourData.isEmpty && setExpandedTimeSlot({
            type: 'group',
            sessions: hourData.sessions,
            startTime: new Date(new Date().setHours(hourData.hour, 0, 0, 0)),
            endTime: new Date(new Date().setHours(hourData.hour + 1, 0, 0, 0)),
            duration: 60
          })}
          className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-200 ${
            hourData.isEmpty 
              ? 'opacity-50 cursor-default' 
              : 'cursor-pointer hover:bg-opacity-10 hover:bg-gray-500'
          } ${
            darkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}
        >
          {/* 시간 레이블 */}
          <div className="w-16 text-sm font-medium text-right">
            {hourData.hour.toString().padStart(2, '0')}:00
          </div>
          
          {/* 프로그레스 바 */}
          <div className="flex-1">
            <div className={`w-full h-6 rounded-full overflow-hidden ${
              darkMode ? 'bg-gray-600' : 'bg-gray-200'
            }`}>
              <div 
                className={`h-full transition-all duration-500 ${getProgressBarColor(hourData.percentage)}`}
                style={{ width: `${Math.min(hourData.percentage, 100)}%` }}
              />
            </div>
          </div>
          
          {/* 퍼센트 및 세션 개수 */}
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${getTextColor(hourData.percentage)}`}>
              {hourData.percentage}%
            </span>
            {!hourData.isEmpty && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                darkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700'
              }`}>
                {hourData.sessions.length}개
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

