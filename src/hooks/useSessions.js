import { useState, useEffect, useRef } from 'react';

/**
 * 세션 관리를 위한 커스텀 훅
 */
export const useSessions = () => {
  const [sessions, setSessions] = useState([]);
  const isInitialLoad = useRef(true);

  // 세션 로드
  useEffect(() => {
    const loadSessions = async () => {
      try {
        if (typeof window !== 'undefined' && window.require) {
          const { ipcRenderer } = window.require('electron');
          const result = await ipcRenderer.invoke('load-sessions');
          if (result.success && result.data) {
            setSessions(result.data);
          }
          isInitialLoad.current = false;
        }
      } catch (error) {
        console.error('세션 로드 실패:', error);
      }
    };
    loadSessions();
  }, []);

  // 세션 변경 시 자동 저장
  useEffect(() => {
    const saveSessions = async () => {
      try {
        if (typeof window !== 'undefined' && window.require && sessions.length >= 0) {
          const { ipcRenderer } = window.require('electron');
          await ipcRenderer.invoke('save-sessions', sessions);
        }
      } catch (error) {
        console.error('데이터 저장 실패:', error);
      }
    };
    saveSessions();
  }, [sessions]);

  const addSession = (session) => {
    setSessions(prev => [session, ...prev]);
  };

  const deleteSession = (sessionId) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const updateSession = (sessionId, updates) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return { ...s, ...updates };
      }
      return s;
    }));
  };

  return {
    sessions,
    setSessions,
    addSession,
    deleteSession,
    updateSession
  };
};

