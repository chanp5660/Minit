import { Clock, BarChart3 } from 'lucide-react';

/**
 * 탭 네비게이션 컴포넌트
 */
export const TabNavigation = ({ activeTab, setActiveTab, timerType, darkMode }) => {
  return (
    <div className={`flex gap-2 mb-6 rounded-lg p-1 shadow-sm ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      <button
        onClick={() => setActiveTab('timer')}
        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
          activeTab === 'timer'
            ? `${timerType === 'work' ? 'bg-purple-500' : 'bg-blue-500'} text-white shadow-md`
            : darkMode
              ? 'text-gray-300 hover:bg-gray-700'
              : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <Clock className="inline-block w-5 h-5 mr-2" />
        타이머
      </button>
      <button
        onClick={() => setActiveTab('stats')}
        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
          activeTab === 'stats'
            ? `${timerType === 'work' ? 'bg-purple-500' : 'bg-blue-500'} text-white shadow-md`
            : darkMode
              ? 'text-gray-300 hover:bg-gray-700'
              : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <BarChart3 className="inline-block w-5 h-5 mr-2" />
        통계
      </button>
    </div>
  );
};

