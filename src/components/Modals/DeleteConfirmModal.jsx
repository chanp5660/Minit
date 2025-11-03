/**
 * 삭제 확인 모달
 */
export const DeleteConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  type, 
  darkMode, 
  dontAskDelete, 
  onDontAskChange 
}) => {
  if (!isOpen) return null;

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
        }`}>삭제 확인</h3>
        <p className={`mb-6 ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {type === 'memo' 
            ? '이 메모를 삭제하시겠습니까?'
            : '이 작업 기록을 삭제하시겠습니까?'}
        </p>
        <div className="mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={dontAskDelete}
              onChange={(e) => onDontAskChange(e.target.checked)}
              className={`w-4 h-4 rounded ${
                darkMode ? 'accent-purple-500' : 'accent-purple-600'
              }`}
            />
            <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
              다음부터 묻지 않기
            </span>
          </label>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition-all"
          >
            삭제
          </button>
          <button
            onClick={onClose}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
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

