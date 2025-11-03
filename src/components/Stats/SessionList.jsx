import { Clock } from 'lucide-react';
import { SessionListItem } from './SessionListItem';

/**
 * 세션 목록 컴포넌트
 */
export const SessionList = ({
  sessions,
  selectedTags,
  darkMode,
  onEdit,
  onDelete
}) => {
  if (sessions.length === 0) {
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
    <div className="space-y-3">
      {sessions.map(session => (
        <SessionListItem
          key={session.id}
          session={session}
          darkMode={darkMode}
          onEdit={() => onEdit(session)}
          onDelete={() => onDelete(session.id)}
        />
      ))}
    </div>
  );
};

