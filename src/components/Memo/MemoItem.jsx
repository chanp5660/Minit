import { Trash2, ArrowUpToLine, ArrowDownToLine, Copy } from 'lucide-react';
import { extractTags } from '../../utils/tagUtils';

/**
 * 개별 메모 아이템 컴포넌트
 */
export const MemoItem = ({
  memo,
  originalIndex,
  totalMemos,
  activeMemoId,
  draggedMemo,
  darkMode,
  updateMemo,
  calculateTextareaRows,
  handleMemoRadioChange,
  moveMemoToTop,
  moveMemoToBottom,
  confirmDeleteMemo,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleDragEnd
}) => {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(memo.content || '');
      // 복사 성공 시 간단한 피드백 (선택사항)
      // alert('복사되었습니다!');
    } catch (err) {
      console.error('복사 실패:', err);
      // 클립보드 API가 지원되지 않는 경우 대체 방법
      const textArea = document.createElement('textarea');
      textArea.value = memo.content || '';
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (fallbackErr) {
        console.error('대체 복사 방법도 실패:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div
      key={memo.id}
      draggable="true"
      onDragStart={(e) => handleDragStart(e, memo)}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, memo)}
      onDragEnd={handleDragEnd}
      className={`flex flex-col gap-2 border-2 rounded-lg p-4 transition-all cursor-move ${
        draggedMemo?.id === memo.id ? 'opacity-50' : ''
      } ${
        activeMemoId === memo.id
          ? darkMode
            ? 'bg-purple-900/30 border-purple-500 hover:border-purple-400'
            : 'bg-purple-50 border-purple-400 hover:border-purple-500'
          : darkMode
            ? 'border-gray-700 hover:border-purple-600'
            : 'border-gray-200 hover:border-purple-300'
      }`}
    >
      {/* 메모 작성 영역 */}
      <textarea
        value={memo.content}
        onChange={(e) => updateMemo(memo.id, e.target.value)}
        placeholder="메모 내용을 입력하세요..."
        className={`w-full px-3 py-2 border rounded-lg focus:border-purple-500 focus:outline-none resize-none ${
          darkMode
            ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
            : 'bg-white border-gray-200 text-gray-700'
        }`}
        rows={calculateTextareaRows(memo.content)}
      />
      
      {/* 태그와 버튼들이 같은 행 */}
      <div className="flex items-center justify-between gap-2">
        {/* 태그 표시 (메모 내용에서 자동 추출) */}
        {extractTags(memo.content || '').length > 0 ? (
          <div className="flex gap-1 flex-wrap flex-1">
            {extractTags(memo.content || '').map((tag, tagIndex) => (
              <span
                key={tagIndex}
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  darkMode
                    ? 'bg-purple-900 text-purple-300'
                    : 'bg-purple-100 text-purple-700'
                }`}
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : (
          <div className="flex-1"></div>
        )}
        
        {/* 버튼들 */}
        <div className="flex items-center gap-2">
          <input
            type="radio"
            name="activeMemo"
            checked={activeMemoId === memo.id}
            onChange={() => handleMemoRadioChange(memo.id)}
            className={`w-4 h-4 cursor-pointer ${
              darkMode ? 'accent-purple-500' : 'accent-purple-600'
            }`}
            title="작업중"
          />
          <button
            onClick={copyToClipboard}
            className={`p-1.5 rounded-lg transition-all ${
              darkMode
                ? 'text-gray-500 hover:text-purple-400 hover:bg-gray-600'
                : 'text-gray-400 hover:text-purple-500 hover:bg-purple-50'
            }`}
            title="복사"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => moveMemoToTop(memo.id)}
            disabled={originalIndex === 0}
            className={`p-1.5 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
              darkMode
                ? 'text-gray-500 hover:text-purple-400 hover:bg-gray-600'
                : 'text-gray-400 hover:text-purple-500 hover:bg-purple-50'
            }`}
            title="맨 위로"
          >
            <ArrowUpToLine className="w-4 h-4" />
          </button>
          <button
            onClick={() => moveMemoToBottom(memo.id)}
            disabled={originalIndex === totalMemos - 1}
            className={`p-1.5 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
              darkMode
                ? 'text-gray-500 hover:text-purple-400 hover:bg-gray-600'
                : 'text-gray-400 hover:text-purple-500 hover:bg-purple-50'
            }`}
            title="맨 아래로"
          >
            <ArrowDownToLine className="w-4 h-4" />
          </button>
          <button
            onClick={() => confirmDeleteMemo(memo.id)}
            className={`p-1.5 rounded-lg transition-all ${
              darkMode
                ? 'text-gray-500 hover:text-red-400 hover:bg-gray-600'
                : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
            }`}
            title="삭제"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

