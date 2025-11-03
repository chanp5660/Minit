import { useState, useEffect, useRef } from 'react';
import { extractTags, addTag, toggleTagFilter as toggleTagFilterUtil } from '../utils/tagUtils';

/**
 * 태그 관리를 위한 커스텀 훅
 */
export const useTags = () => {
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedMemoTags, setSelectedMemoTags] = useState([]);
  const isInitialLoad = useRef(true);

  // 태그 로드
  useEffect(() => {
    const loadTags = async () => {
      try {
        if (typeof window !== 'undefined' && window.require) {
          const { ipcRenderer } = window.require('electron');
          const tagsResult = await ipcRenderer.invoke('load-tags');
          if (tagsResult.success && tagsResult.data) {
            setTags(tagsResult.data);
          }
          isInitialLoad.current = false;
        }
      } catch (error) {
        console.error('태그 로드 실패:', error);
      }
    };
    loadTags();
  }, []);

  // 태그 변경 시 자동 저장
  useEffect(() => {
    const saveTags = async () => {
      try {
        if (!isInitialLoad.current && typeof window !== 'undefined' && window.require && tags.length > 0) {
          const { ipcRenderer } = window.require('electron');
          await ipcRenderer.invoke('save-tags', tags);
        }
      } catch (error) {
        console.error('태그 저장 실패:', error);
      }
    };
    saveTags();
  }, [tags]);

  const saveTag = (tag) => {
    if (!tags.includes(tag)) {
      setTags(prevTags => addTag(prevTags, tag));
    }
  };

  const toggleTagFilter = (tag) => {
    setSelectedTags(prev => toggleTagFilterUtil(prev, tag));
  };

  const toggleMemoTagFilter = (tag) => {
    setSelectedMemoTags(prev => toggleTagFilterUtil(prev, tag));
  };

  return {
    tags,
    selectedTags,
    selectedMemoTags,
    setTags,
    setSelectedTags,
    setSelectedMemoTags,
    saveTag,
    toggleTagFilter,
    toggleMemoTagFilter,
    extractTags
  };
};

