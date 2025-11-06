import { formatTime } from '../../utils/timeUtils';

/**
 * 타이머 디스플레이 컴포넌트 (원형 프로그레스)
 */
export const TimerDisplay = ({ 
  timeLeft, 
  selectedDuration, 
  timerType, 
  focusMode, 
  darkMode,
  colors
}) => {
  const radius = focusMode ? 98 : 140;
  const center = focusMode ? 112 : 160;
  const strokeWidth = focusMode ? 10 : 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - timeLeft / (selectedDuration * 60));

  return (
    <div className={`text-center relative ${focusMode ? 'mb-4' : 'mb-8'}`}>
      <div className="relative inline-block">
        <svg className={`transform -rotate-90 ${focusMode ? 'w-56 h-56' : 'w-80 h-80'}`}>
            {/* Background circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#e5e7eb"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="url(#gradient)"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colors.gradient.from} />
                <stop offset="100%" stopColor={colors.gradient.to} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`font-bold ${timerType === 'work' ? 'text-purple-600' : 'text-blue-600'} ${focusMode ? 'text-4xl mb-1' : 'text-6xl mb-2'}`}>
              {formatTime(timeLeft)}
            </div>
            <div className={`${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            } ${focusMode ? 'text-sm' : 'text-lg'}`}>
              {selectedDuration}분 세션
            </div>
          </div>
      </div>
    </div>
  );
};

