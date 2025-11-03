import { useState, useEffect, useRef } from 'react';

/**
 * 다크 모드를 관리하는 커스텀 훅
 */
export const useDarkMode = () => {
  const [darkMode, setDarkMode] = useState(false);
  const isInitialLoad = useRef(true);

  // 다크 모드 로드
  useEffect(() => {
    const loadDarkMode = async () => {
      try {
        if (typeof window !== 'undefined' && window.require) {
          const { ipcRenderer } = window.require('electron');
          const darkModeResult = await ipcRenderer.invoke('load-dark-mode');
          if (darkModeResult.success) {
            setDarkMode(darkModeResult.data);
          }
          isInitialLoad.current = false;
        }
      } catch (error) {
        console.error('다크 모드 로드 실패:', error);
      }
    };
    loadDarkMode();
  }, []);

  // 다크 모드 변경 시 자동 저장
  useEffect(() => {
    const saveDarkMode = async () => {
      try {
        if (!isInitialLoad.current && typeof window !== 'undefined' && window.require) {
          const { ipcRenderer } = window.require('electron');
          await ipcRenderer.invoke('save-dark-mode', darkMode);
        }
      } catch (error) {
        console.error('다크 모드 저장 실패:', error);
      }
    };
    saveDarkMode();
  }, [darkMode]);

  return {
    darkMode,
    setDarkMode
  };
};

