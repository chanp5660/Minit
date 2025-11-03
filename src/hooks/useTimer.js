import { useState, useEffect, useRef } from 'react';
import { formatTime } from '../utils/timeUtils';

/**
 * 타이머를 관리하는 커스텀 훅
 */
export const useTimer = (
  timerType,
  selectedDuration,
  getActiveMemoContent,
  focusMode,
  sendNotification,
  onTimerComplete
) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSessionStart, setCurrentSessionStart] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    setTimeLeft(selectedDuration * 60);
  }, [selectedDuration]);

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);

      // 오디오 재생
      if (audioRef.current) {
        audioRef.current.play();
      }

      // 시스템 알림 발송
      if (timerType === 'work') {
        const activeContent = getActiveMemoContent();
        sendNotification('🍅 타이머 완료!', `"${activeContent}" 작업 시간이 끝났습니다.`);
        if (onTimerComplete) {
          onTimerComplete();
        }
      } else {
        sendNotification('🍅 휴식 완료!', '휴식 시간이 끝났습니다. 다시 집중해볼까요?');
        // 휴식 타이머는 확인 모달 없이 자동으로 리셋
        setTimeLeft(selectedDuration * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, timerType, selectedDuration, getActiveMemoContent, sendNotification, onTimerComplete]);

  const startTimer = () => {
    if (!focusMode && timerType === 'work') {
      const activeContent = getActiveMemoContent();
      if (!activeContent.trim()) {
        alert('작업중인 메모를 선택해주세요!');
        return;
      }
    }
    if (!isRunning) {
      setCurrentSessionStart(new Date());
    }
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(selectedDuration * 60);
  };

  const setDuration = (minutes) => {
    setTimeLeft(minutes * 60);
    setIsRunning(false);
  };

  const getTimerColors = () => {
    if (timerType === 'work') {
      return {
        primary: 'purple-500',
        secondary: 'purple-600',
        light: 'purple-50',
        gradient: {
          from: '#a855f7', // purple-500
          to: '#ec4899'    // pink-500
        },
        text: 'purple-600'
      };
    } else {
      return {
        primary: 'blue-500',
        secondary: 'blue-600',
        light: 'blue-50',
        gradient: {
          from: '#3b82f6', // blue-500
          to: '#10b981'    // green-500
        },
        text: 'blue-600'
      };
    }
  };

  return {
    timeLeft,
    isRunning,
    currentSessionStart,
    audioRef,
    setTimeLeft,
    setIsRunning,
    setCurrentSessionStart,
    startTimer,
    pauseTimer,
    resetTimer,
    setDuration,
    formatTime,
    getTimerColors
  };
};

