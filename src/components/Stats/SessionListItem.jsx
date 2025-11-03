import { CheckCircle, XCircle } from 'lucide-react';

/**
 * 세션 목록 아이템 컴포넌트
 */
export const SessionListItem = ({
  session,
  darkMode,
  onEdit,
  onDelete
}) => {
  return (
    <div
      className={`border-2 rounded-lg p-4 transition-all ${
        darkMode
          ? 'bg-gray-700 border-gray-600 hover:border-purple-500'
          : 'bg-white border-gray-100 hover:border-purple-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {session.completed ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <h4 className={`font-semibold ${
              darkMode ? 'text-gray-100' : 'text-gray-800'
            }`}>{session.title}</h4>
          </div>
          <div className={`text-sm ml-7 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {new Date(session.timestamp).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit'
            })} - {session.duration}분 {session.partial ? '(부분 완료)' : '세션'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            session.completed
              ? darkMode
                ? 'bg-green-900 text-green-300'
                : 'bg-green-100 text-green-700'
              : session.inProgress
                ? darkMode
                  ? 'bg-yellow-900 text-yellow-300'
                  : 'bg-yellow-100 text-yellow-700'
                : darkMode
                  ? 'bg-red-900 text-red-300'
                  : 'bg-red-100 text-red-700'
          }`}>
            {session.completed ? '완료' : session.inProgress ? '진행 중' : '미완료'}
          </div>
          <button
            onClick={onEdit}
            className={`p-2 rounded-lg transition-all ${
              darkMode
                ? 'text-gray-500 hover:text-blue-400 hover:bg-gray-600'
                : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'
            }`}
            title="수정"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className={`p-2 rounded-lg transition-all text-xl ${
              darkMode
                ? 'text-gray-500 hover:text-red-400 hover:bg-gray-600'
                : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
            }`}
            title="삭제"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

