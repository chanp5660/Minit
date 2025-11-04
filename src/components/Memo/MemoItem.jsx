import { useState, useEffect, useRef } from 'react';
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
  handleMemoRadioChange,
  moveMemoToTop,
  moveMemoToBottom,
  confirmDeleteMemo,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleDragEnd
}) => {
  const textareaRef = useRef(null);
  const [textareaHeight, setTextareaHeight] = useState('auto');
  const [shouldScroll, setShouldScroll] = useState(false);
  const isFocused = useRef(false); // 포커스 상태 추적

  // 5줄 높이 계산: line-height 1.5 * 16px * 5 = 120px + padding 16px = 136px
  const MAX_HEIGHT = 136; // 5줄 높이
  const MIN_HEIGHT = 40; // 약 1줄 (padding 포함)

  // 내용에 따라 textarea 높이 자동 조정 (포커스가 없을 때만 호출됨)
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      
      // 높이를 초기화하여 정확한 scrollHeight 측정
      textarea.style.height = 'auto';
      
      // 항상 textarea.value를 사용 (입력 중에는 항상 최신 값)
      const currentValue = textarea.value || memo.content || '';
      const hasContent = currentValue.trim().length > 0;
      
      if (!hasContent) {
        // 빈 상태: padding + 1줄 높이
        setTextareaHeight(`${MIN_HEIGHT}px`);
        setShouldScroll(false);
      } else {
        // DOM이 완전히 업데이트되도록 여러 프레임 대기
        // requestAnimationFrame을 여러 번 사용하여 확실한 레이아웃 재계산 보장
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (textareaRef.current) {
                const textareaEl = textareaRef.current;
                
                // height를 다시 auto로 설정하여 정확한 scrollHeight 측정
                textareaEl.style.height = 'auto';
                
                // 강제로 레이아웃 재계산 (scrollHeight 측정 전)
                // getBoundingClientRect()와 여러 속성을 읽어서 브라우저가 레이아웃을 재계산하도록 유도
                void textareaEl.getBoundingClientRect();
                void textareaEl.offsetHeight;
                void textareaEl.clientHeight;
                void textareaEl.scrollTop;
                
                // 이제 정확한 scrollHeight를 측정할 수 있습니다
                const scrollHeight = textareaEl.scrollHeight;
                
                // 포커스가 없을 때: 실제 내용에 맞춰 높이 조절
                if (scrollHeight > MAX_HEIGHT) {
                  // 5줄을 초과하면 높이 고정 (5줄 크기 유지) 및 스크롤 활성화
                  setTextareaHeight(`${MAX_HEIGHT}px`);
                  setShouldScroll(true);
                  textareaEl.style.height = `${MAX_HEIGHT}px`;
                } else {
                  // 5줄 이하이면 실제 내용에 맞춰 높이 설정
                  const newHeight = Math.max(scrollHeight, MIN_HEIGHT);
                  setTextareaHeight(`${newHeight}px`);
                  setShouldScroll(false);
                }
              }
            });
          });
        });
      }
    }
  };

  // 초기 마운트 플래그
  const isInitialMount = useRef(true);
  
  // 초기 마운트 및 외부에서 메모가 변경된 경우에만 높이 조정
  useEffect(() => {
    // 초기 마운트 시에만 실행 (handleChange에서 처리하지 못한 경우)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // 초기 마운트 시에는 약간의 지연을 주어 DOM이 완전히 렌더링된 후 계산
      const timeoutId = setTimeout(() => {
        adjustTextareaHeight();
      }, 0);
      return () => clearTimeout(timeoutId);
    }
    // 이후 변경은 handleChange에서 처리하므로 여기서는 처리하지 않음
    // 단, 외부에서 메모가 변경된 경우를 대비하여 fallback으로 처리
    // (예: 다른 컴포넌트에서 메모를 직접 수정한 경우)
  }, [memo.content]);

  // onChange 핸들러
  const handleChange = (e) => {
    const newValue = e.target.value;
    updateMemo(memo.id, newValue);
    
    // 포커스가 있을 때는 높이를 5줄로 고정
    if (isFocused.current) {
      setTextareaHeight(`${MAX_HEIGHT}px`);
      if (textareaRef.current) {
        textareaRef.current.style.height = `${MAX_HEIGHT}px`;
        // 스크롤 필요 여부 확인
        const scrollHeight = textareaRef.current.scrollHeight;
        setShouldScroll(scrollHeight > MAX_HEIGHT);
      }
    }
    // 포커스가 없을 때는 실제로 입력이 발생하지 않으므로 처리하지 않음
  };

  // onFocus 핸들러: 포커스 시 항상 5줄로 고정
  const handleFocus = () => {
    isFocused.current = true;
    if (textareaRef.current) {
      setTextareaHeight(`${MAX_HEIGHT}px`);
      textareaRef.current.style.height = `${MAX_HEIGHT}px`;
      // 스크롤 필요 여부 확인
      const scrollHeight = textareaRef.current.scrollHeight;
      setShouldScroll(scrollHeight > MAX_HEIGHT);
    }
  };

  // onBlur 핸들러: 포커스 해제 시 실제 내용에 맞춰 높이 조절
  const handleBlur = () => {
    isFocused.current = false;
    // 실제 내용에 맞춰 높이 재조정
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        adjustTextareaHeight();
      });
    });
  };

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
        ref={textareaRef}
        value={memo.content}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="메모 내용을 입력하세요..."
        className={`w-full px-3 py-2 border rounded-lg focus:border-purple-500 focus:outline-none resize-none leading-normal ${
          darkMode
            ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
            : 'bg-white border-gray-200 text-gray-700'
        }`}
        style={{ 
          lineHeight: '1.5',
          height: textareaHeight,
          minHeight: shouldScroll ? `${MAX_HEIGHT}px` : undefined,
          maxHeight: `${MAX_HEIGHT}px`,
          overflowY: shouldScroll ? 'auto' : 'hidden',
          boxSizing: 'border-box'
        }}
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

