import { Plus, HelpCircle } from 'lucide-react';
import { MemoTagFilter } from './MemoTagFilter';
import { MemoItem } from './MemoItem';
import { extractTags } from '../../utils/tagUtils';

/**
 * 메모 리스트 컴포넌트
 */
export const MemoList = ({
  memos,
  filteredMemos,
  getAllMemoTags,
  selectedMemoTags,
  toggleMemoTagFilter,
  setSelectedMemoTags,
  activeMemoId,
  draggedMemo,
  darkMode,
  addMemo,
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
  return (
    <div className={`mt-6 pt-6 border-t-2 ${
      darkMode ? 'border-gray-700' : 'border-gray-100'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className={`text-lg font-semibold ${
            darkMode ? 'text-gray-200' : 'text-gray-700'
          }`}>📝 메모</h3>
          <div className="relative group">
            <HelpCircle className={`w-4 h-4 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            } cursor-help`} />
            <div className={`absolute left-0 top-6 w-64 p-2 rounded-lg text-xs shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all ${
              darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-800 text-gray-100'
            }`}>
              메모에 #태그 형식으로 작성하면 자동으로 태그가 추가됩니다.
            </div>
          </div>
        </div>
        <button
          onClick={addMemo}
          className="flex items-center gap-1 px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          새 메모
        </button>
      </div>

      {/* 태그 필터 */}
      <MemoTagFilter
        allTags={getAllMemoTags()}
        selectedTags={selectedMemoTags}
        toggleTagFilter={toggleMemoTagFilter}
        clearFilter={() => setSelectedMemoTags([])}
        darkMode={darkMode}
      />

      {filteredMemos.length === 0 ? (
        <div className={`text-center py-8 border-2 border-dashed rounded-lg ${
          darkMode
            ? 'text-gray-500 border-gray-700'
            : 'text-gray-400 border-gray-200'
        }`}>
          <p>{selectedMemoTags.length > 0 ? '선택한 태그와 일치하는 메모가 없습니다' : '메모를 추가해보세요'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMemos.map((memo) => {
            const originalIndex = memos.findIndex(m => m.id === memo.id);
            return (
              <MemoItem
                key={memo.id}
                memo={memo}
                originalIndex={originalIndex}
                totalMemos={memos.length}
                activeMemoId={activeMemoId}
                draggedMemo={draggedMemo}
                darkMode={darkMode}
                updateMemo={updateMemo}
                calculateTextareaRows={calculateTextareaRows}
                handleMemoRadioChange={handleMemoRadioChange}
                moveMemoToTop={moveMemoToTop}
                moveMemoToBottom={moveMemoToBottom}
                confirmDeleteMemo={confirmDeleteMemo}
                handleDragStart={handleDragStart}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
                handleDragEnd={handleDragEnd}
              />
            );
          })}
          
          {/* 하단 새 메모 버튼 */}
          <div className="flex justify-center pt-2">
            <button
              onClick={addMemo}
              className="flex items-center gap-1 px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-all"
            >
              <Plus className="w-4 h-4" />
              새 메모
            </button>
          </div>
        </div>
      )}
      <p className={`text-xs mt-2 ${
        darkMode ? 'text-gray-500' : 'text-gray-500'
      }`}>💾 자동으로 저장됩니다</p>
    </div>
  );
};

