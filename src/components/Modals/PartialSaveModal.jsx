import { CheckCircle, Clock } from 'lucide-react';

/**
 * 부분 저장 모달
 */
export const PartialSaveModal = ({ 
  isOpen, 
  onClose, 
  sessionData, 
  onComplete, 
  onInProgress, 
  darkMode 
}) => {
  if (!isOpen || !sessionData) return null;

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className={`rounded-2xl p-8 max-w-md w-full shadow-2xl ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}
        onClick={handleModalClick}
      >
        <h3 className={`text-2xl font-bold mb-4 ${
          darkMode ? 'text-gray-100' : 'text-gray-800'
        }`}>작업 저장</h3>
        <p className={`mb-2 ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          <span className="font-semibold">"{sessionData.title}"</span>
        </p>
        <p className={`mb-6 text-sm ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {sessionData.duration}분이 기록됩니다. 작업 상태를 선택해주세요.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onComplete}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            완료했어요
          </button>
          <button
            onClick={onInProgress}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            <Clock className="w-5 h-5" />
            진행 중이에요
          </button>
          <button
            onClick={onClose}
            className={`w-full py-3 rounded-xl font-semibold transition-all ${
              darkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

