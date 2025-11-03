import { useState, useEffect } from 'react';

/**
 * 윈도우 설정을 관리하는 커스텀 훅 (Always on Top, Focus Mode)
 */
export const useWindowSettings = () => {
  const [alwaysOnTop, setAlwaysOnTop] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [dataPath, setDataPath] = useState('');

  // 초기 상태 로드
  useEffect(() => {
    const loadWindowSettings = async () => {
      try {
        if (typeof window !== 'undefined' && window.require) {
          const { ipcRenderer } = window.require('electron');
          // 데이터 경로 가져오기
          const path = await ipcRenderer.invoke('get-data-path');
          setDataPath(path);
          // Always on Top 상태 가져오기
          const isAlwaysOnTop = await ipcRenderer.invoke('get-always-on-top');
          setAlwaysOnTop(isAlwaysOnTop);
        }
      } catch (error) {
        console.error('윈도우 설정 로드 실패:', error);
      }
    };
    loadWindowSettings();
  }, []);

  const toggleAlwaysOnTop = async () => {
    try {
      if (typeof window !== 'undefined' && window.require) {
        const { ipcRenderer } = window.require('electron');
        const newState = await ipcRenderer.invoke('toggle-always-on-top');
        setAlwaysOnTop(newState);
      }
    } catch (error) {
      console.error('Always on Top 토글 실패:', error);
    }
  };

  const toggleFocusMode = async () => {
    try {
      if (typeof window !== 'undefined' && window.require) {
        const { ipcRenderer } = window.require('electron');
        const newFocusMode = !focusMode;

        // 윈도우 크기 조절
        if (newFocusMode) {
          // 집중 모드: 작은 크기, 최소 크기도 작게 설정
          await ipcRenderer.invoke('set-window-size', 300, 500, 250, 400);
        } else {
          // 일반 모드: 기본 크기, 최소 크기 복원
          await ipcRenderer.invoke('set-window-size', 1200, 900, 800, 600);
        }

        setFocusMode(newFocusMode);
      }
    } catch (error) {
      console.error('집중 모드 토글 실패:', error);
    }
  };

  const openGithub = async () => {
    try {
      if (typeof window !== 'undefined' && window.require) {
        const { shell } = window.require('electron');
        await shell.openExternal('https://github.com/chanp5660/Minit');
      }
    } catch (error) {
      console.error('GitHub 링크 열기 실패:', error);
    }
  };

  return {
    alwaysOnTop,
    focusMode,
    dataPath,
    toggleAlwaysOnTop,
    toggleFocusMode,
    openGithub
  };
};

