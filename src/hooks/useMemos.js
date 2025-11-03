import { useState, useEffect, useRef } from 'react';
import { extractTags } from '../utils/tagUtils';

/**
 * 메모 관리를 위한 커스텀 훅
 */
export const useMemos = (extractTagsFn) => {
  const [memos, setMemos] = useState([]);
  const [activeMemoId, setActiveMemoId] = useState(null);
  const [draggedMemo, setDraggedMemo] = useState(null);
  const isInitialLoad = useRef(true);

  // 메모 로드
  useEffect(() => {
    const loadMemos = async () => {
      try {
        if (typeof window !== 'undefined' && window.require) {
          const { ipcRenderer } = window.require('electron');
          const memosResult = await ipcRenderer.invoke('load-memos');
          if (memosResult.success && memosResult.data) {
            // 메모 내용에서 태그 자동 추출 (마이그레이션)
            const migratedMemos = memosResult.data.map(memo => ({
              ...memo,
              tags: extractTagsFn(memo.content || '')
            }));
            setMemos(migratedMemos);
            // 첫 번째 메모를 기본으로 체크
            if (migratedMemos.length > 0 && !activeMemoId) {
              setActiveMemoId(migratedMemos[0].id);
            }
          }
          isInitialLoad.current = false;
        }
      } catch (error) {
        console.error('메모 로드 실패:', error);
      }
    };
    loadMemos();
  }, [extractTagsFn]);

  // 메모가 추가되거나 변경될 때 첫 번째 메모 자동 체크
  useEffect(() => {
    if (memos.length > 0 && !activeMemoId) {
      setActiveMemoId(memos[0].id);
    }
  }, [memos, activeMemoId]);

  // 메모 변경 시 자동 저장
  useEffect(() => {
    const saveMemos = async () => {
      try {
        if (!isInitialLoad.current && typeof window !== 'undefined' && window.require) {
          const { ipcRenderer } = window.require('electron');
          await ipcRenderer.invoke('save-memos', memos);
        }
      } catch (error) {
        console.error('메모 저장 실패:', error);
      }
    };
    saveMemos();
  }, [memos]);

  const getActiveMemoContent = () => {
    if (!activeMemoId) return '';
    const activeMemo = memos.find(m => m.id === activeMemoId);
    return activeMemo ? activeMemo.content : '';
  };

  const addMemo = () => {
    const newMemo = {
      id: Date.now(),
      content: '',
      order: memos.length,
      tags: []
    };
    setMemos(prev => [...prev, newMemo]);
  };

  const deleteMemo = (id) => {
    const updatedMemos = memos
      .filter(m => m.id !== id)
      .map((m, index) => ({ ...m, order: index }));
    setMemos(updatedMemos);
    // 삭제된 메모가 작업중이었다면 첫 번째 메모로 변경
    if (activeMemoId === id && updatedMemos.length > 0) {
      setActiveMemoId(updatedMemos[0].id);
    } else if (activeMemoId === id) {
      setActiveMemoId(null);
    }
  };

  const updateMemo = (id, content) => {
    const updatedMemos = memos.map(m => {
      if (m.id === id) {
        // 메모 내용에서 태그 자동 추출
        const extractedTags = extractTagsFn(content);
        return { ...m, content, tags: extractedTags };
      }
      return m;
    });
    setMemos(updatedMemos);
  };

  const moveMemoToTop = (id) => {
    const index = memos.findIndex(m => m.id === id);
    if (index <= 0) return;

    const updatedMemos = [...memos];
    const [memo] = updatedMemos.splice(index, 1);
    updatedMemos.unshift(memo);

    const reorderedMemos = updatedMemos.map((m, i) => ({ ...m, order: i }));
    setMemos(reorderedMemos);
  };

  const moveMemoToBottom = (id) => {
    const index = memos.findIndex(m => m.id === id);
    if (index < 0 || index >= memos.length - 1) return;

    const updatedMemos = [...memos];
    const [memo] = updatedMemos.splice(index, 1);
    updatedMemos.push(memo);

    const reorderedMemos = updatedMemos.map((m, i) => ({ ...m, order: i }));
    setMemos(reorderedMemos);
  };

  const calculateTextareaRows = (content) => {
    if (!content) return 1;
    const lines = content.split('\n').length;
    return Math.min(Math.max(lines, 1), 5);
  };

  const handleDragStart = (e, memo) => {
    setDraggedMemo(memo);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetMemo) => {
    e.preventDefault();
    if (!draggedMemo || draggedMemo.id === targetMemo.id) return;

    const draggedIndex = memos.findIndex(m => m.id === draggedMemo.id);
    const targetIndex = memos.findIndex(m => m.id === targetMemo.id);

    const updatedMemos = [...memos];
    const [removed] = updatedMemos.splice(draggedIndex, 1);
    updatedMemos.splice(targetIndex, 0, removed);

    const reorderedMemos = updatedMemos.map((m, i) => ({ ...m, order: i }));
    setMemos(reorderedMemos);
    setDraggedMemo(null);
  };

  const handleDragEnd = () => {
    setDraggedMemo(null);
  };

  return {
    memos,
    activeMemoId,
    draggedMemo,
    setMemos,
    setActiveMemoId,
    getActiveMemoContent,
    addMemo,
    deleteMemo,
    updateMemo,
    moveMemoToTop,
    moveMemoToBottom,
    calculateTextareaRows,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd
  };
};

