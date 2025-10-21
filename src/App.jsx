import React, { useState, useEffect, useRef } from 'react';
import { Clock, Play, Pause, RotateCcw, BarChart3, CheckCircle, XCircle, Trash2 } from 'lucide-react';

export default function PomodoroTimer() {
  const [activeTab, setActiveTab] = useState('timer');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [customMinutes, setCustomMinutes] = useState('');
  const [sessions, setSessions] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentSessionStart, setCurrentSessionStart] = useState(null);
  const [dataPath, setDataPath] = useState('');
  const [alwaysOnTop, setAlwaysOnTop] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [memo, setMemo] = useState('');
  const [timerType, setTimerType] = useState('work'); // 'work' | 'break'
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const audioRef = useRef(null);
  const isInitialLoad = useRef(true);
  const taskTitleInputRef = useRef(null);

  // 알림 권한 요청
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
      });
    } else if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // 시스템 알림 발송 함수
  const sendNotification = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: body,
        icon: '🍅',
        badge: '🍅',
        tag: 'dotime-timer'
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  };

  // 태그 추출 함수
  const extractTags = (text) => {
    const regex = /#([^\s#]+)/g;
    const matches = text.match(regex);
    return matches ? matches.map(tag => tag.substring(1)) : [];
  };

  // 태그 버튼 클릭 시 커서 위치에 삽입
  const addTagToTitle = (tag) => {
    if (!taskTitleInputRef.current) return;

    const input = taskTitleInputRef.current;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const currentValue = taskTitle;
    const tagText = `#${tag}`;

    // 커서 위치에 태그 삽입
    const newValue = currentValue.substring(0, start) + tagText + ' ' + currentValue.substring(end);
    setTaskTitle(newValue);

    // 커서 위치를 태그 뒤로 이동
    setTimeout(() => {
      const newCursorPos = start + tagText.length + 1;
      input.setSelectionRange(newCursorPos, newCursorPos);
      input.focus();
    }, 0);
  };

  // 태그 저장 함수 (중복 제거)
  const saveTag = (tag) => {
    if (!tags.includes(tag)) {
      const newTags = [...tags, tag];
      setTags(newTags);
    }
  };

  // 태그 필터 토글 (선택/해제)
  const toggleTagFilter = (tag) => {
    if (selectedTags.includes(tag)) {
      // 이미 선택된 태그면 제거
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      // 선택되지 않은 태그면 추가
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    const loadSessions = async () => {
      try {
        if (typeof window !== 'undefined' && window.require) {
          const { ipcRenderer } = window.require('electron');
          const result = await ipcRenderer.invoke('load-sessions');
          if (result.success && result.data) {
            setSessions(result.data);
          }
          // 메모 로드
          const memoResult = await ipcRenderer.invoke('load-memo');
          if (memoResult.success) {
            setMemo(memoResult.text);
          }
          // 태그 로드
          const tagsResult = await ipcRenderer.invoke('load-tags');
          if (tagsResult.success && tagsResult.data) {
            setTags(tagsResult.data);
          }
          // 데이터 경로 가져오기
          const path = await ipcRenderer.invoke('get-data-path');
          setDataPath(path);
          // Always on Top 상태 가져오기
          const isAlwaysOnTop = await ipcRenderer.invoke('get-always-on-top');
          setAlwaysOnTop(isAlwaysOnTop);

          // 초기 로드 완료
          isInitialLoad.current = false;
        }
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      }
    };
    loadSessions();
  }, []);

  // 세션 변경 시 자동 저장
  useEffect(() => {
    const saveSessions = async () => {
      try {
        if (typeof window !== 'undefined' && window.require && sessions.length > 0) {
          const { ipcRenderer } = window.require('electron');
          await ipcRenderer.invoke('save-sessions', sessions);
        }
      } catch (error) {
        console.error('데이터 저장 실패:', error);
      }
    };
    saveSessions();
  }, [sessions]);

  // 메모 변경 시 자동 저장
  useEffect(() => {
    const saveMemo = async () => {
      try {
        // 초기 로드가 완료된 후에만 저장
        if (!isInitialLoad.current && typeof window !== 'undefined' && window.require) {
          const { ipcRenderer } = window.require('electron');
          await ipcRenderer.invoke('save-memo', memo);
        }
      } catch (error) {
        console.error('메모 저장 실패:', error);
      }
    };
    saveMemo();
  }, [memo]);

  // 태그 변경 시 자동 저장
  useEffect(() => {
    const saveTags = async () => {
      try {
        // 초기 로드가 완료된 후에만 저장
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

  // 색상 테마 헬퍼 함수
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

  const colors = getTimerColors();

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
        sendNotification('🍅 타이머 완료!', `"${taskTitle}" 작업 시간이 끝났습니다.`);
        setShowConfirmation(true);
      } else {
        sendNotification('🍅 휴식 완료!', '휴식 시간이 끝났습니다. 다시 집중해볼까요?');
        // 휴식 타이머는 확인 모달 없이 자동으로 리셋
        setTimeLeft(selectedDuration * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, timerType, taskTitle, selectedDuration, sendNotification]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimerType = () => {
    if (isRunning) {
      return; // 타이머 실행 중에는 전환 불가
    }
    const newType = timerType === 'work' ? 'break' : 'work';
    setTimerType(newType);
    setTimeLeft(selectedDuration * 60);
  };

  const startTimer = () => {
    if (!focusMode && timerType === 'work' && !taskTitle.trim()) {
      alert('작업 제목을 입력해주세요!');
      return;
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
    setSelectedDuration(minutes);
    setTimeLeft(minutes * 60);
    setIsRunning(false);
  };

  const handleCustomDuration = () => {
    const mins = parseInt(customMinutes);
    if (mins > 0 && mins <= 180) {
      setDuration(mins);
      setCustomMinutes('');
    }
  };

  const handleTaskCompletion = (completed) => {
    // 제목에서 태그 추출 및 저장
    const extractedTags = extractTags(taskTitle);
    extractedTags.forEach(tag => saveTag(tag));

    const newSession = {
      id: Date.now(),
      title: taskTitle,
      duration: selectedDuration,
      completed: completed,
      timestamp: currentSessionStart || new Date(),
      endTime: new Date(),
      partial: false
    };
    setSessions([newSession, ...sessions]);
    setShowConfirmation(false);
    setTaskTitle('');
    setTimeLeft(selectedDuration * 60);
    setCurrentSessionStart(null);
  };

  const saveCurrentSession = () => {
    if (!taskTitle.trim()) {
      alert('작업 제목을 입력해주세요!');
      return;
    }

    const elapsedMinutes = Math.ceil((selectedDuration * 60 - timeLeft) / 60);

    if (elapsedMinutes === 0) {
      alert('아직 시작하지 않았습니다!');
      return;
    }

    // 제목에서 태그 추출 및 저장
    const extractedTags = extractTags(taskTitle);
    extractedTags.forEach(tag => saveTag(tag));

    const newSession = {
      id: Date.now(),
      title: taskTitle,
      duration: elapsedMinutes,
      completed: true,
      timestamp: currentSessionStart || new Date(),
      endTime: new Date(),
      partial: true
    };

    setSessions([newSession, ...sessions]);
    setTaskTitle('');
    setTimeLeft(selectedDuration * 60);
    setIsRunning(false);
    setCurrentSessionStart(null);
    alert(`${elapsedMinutes}분이 기록되었습니다!`);
  };

  const deleteSession = (sessionId) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
  };

  const restartSession = (session) => {
    // 세션의 제목과 시간으로 타이머 설정
    setTaskTitle(session.title);
    setSelectedDuration(session.duration);
    setTimeLeft(session.duration * 60);
    setTimerType('work');
    setIsRunning(false);
    // 타이머 탭으로 전환
    setActiveTab('timer');
  };

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
          await ipcRenderer.invoke('set-window-size', 450, 600, 300, 400);
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

  const getTodaySessions = () => {
    const today = new Date().toDateString();
    let todaySessions = sessions.filter(s => new Date(s.timestamp).toDateString() === today);

    // 선택된 태그가 있으면 필터링 (교집합: 선택된 모든 태그를 포함하는 세션만)
    if (selectedTags.length > 0) {
      todaySessions = todaySessions.filter(session => {
        const sessionTags = extractTags(session.title);
        // 선택된 모든 태그가 세션에 포함되어 있는지 확인
        return selectedTags.every(selectedTag => sessionTags.includes(selectedTag));
      });
    }

    return todaySessions;
  };

  const getTodayStats = () => {
    const todaySessions = getTodaySessions();
    const totalMinutes = todaySessions.reduce((acc, s) => acc + s.duration, 0);
    const completedCount = todaySessions.filter(s => s.completed).length;
    return {
      totalMinutes,
      totalHours: (totalMinutes / 60).toFixed(1),
      sessionCount: todaySessions.length,
      completedCount
    };
  };

  const stats = getTodayStats();

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 ${focusMode ? 'p-2' : 'p-4'}`}>
      <div className={`mx-auto ${focusMode ? 'max-w-md' : 'max-w-4xl'}`}>
        {/* Header */}
        <div className={`text-center relative ${focusMode ? 'mb-4 pt-4' : 'mb-8 pt-8'}`}>
          <h1 className={`font-bold text-gray-800 ${focusMode ? 'text-xl mb-1' : 'text-4xl mb-2'}`}>
            ⏰ DoTime
          </h1>
          {!focusMode && <p className="text-gray-600">작업 실행 시간을 기록하고 추적하세요</p>}
          {/* Always on Top Button */}
          <button
            onClick={toggleAlwaysOnTop}
            className={`absolute top-0 right-0 rounded-lg transition-all shadow-md ${
              focusMode ? 'p-2 text-sm' : 'p-3'
            } ${
              alwaysOnTop
                ? 'bg-purple-500 text-white hover:bg-purple-600'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
            title={alwaysOnTop ? '최상단 고정 해제' : '최상단 고정'}
          >
            📌
          </button>
          {/* Focus Mode Button */}
          <button
            onClick={toggleFocusMode}
            className={`absolute top-0 rounded-lg transition-all shadow-md ${
              focusMode ? 'right-12 p-2 text-sm' : 'right-16 p-3'
            } ${
              focusMode
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
            title={focusMode ? '일반 모드로 전환' : '집중 모드로 전환'}
          >
            🎯
          </button>
        </div>

        {/* Tab Navigation */}
        {!focusMode && (
          <div className="flex gap-2 mb-6 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('timer')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === 'timer'
                  ? `${timerType === 'work' ? 'bg-purple-500' : 'bg-blue-500'} text-white shadow-md`
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Clock className="inline-block w-5 h-5 mr-2" />
              타이머
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === 'stats'
                  ? `${timerType === 'work' ? 'bg-purple-500' : 'bg-blue-500'} text-white shadow-md`
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="inline-block w-5 h-5 mr-2" />
              통계
            </button>
          </div>
        )}

        {/* Timer Tab */}
        {(activeTab === 'timer' || focusMode) && (
          <div className={`bg-white rounded-2xl shadow-xl ${focusMode ? 'p-4' : 'p-8'}`}>
            {/* Timer Type Toggle */}
            {!focusMode && (
              <div className="flex justify-center mb-6">
                <div className={`inline-flex rounded-lg p-1 ${timerType === 'work' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                  <button
                    onClick={() => timerType === 'break' && toggleTimerType()}
                    disabled={isRunning}
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${
                      timerType === 'work'
                        ? 'bg-purple-500 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-50'
                    } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    💼 작업
                  </button>
                  <button
                    onClick={() => timerType === 'work' && toggleTimerType()}
                    disabled={isRunning}
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${
                      timerType === 'break'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-50'
                    } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    ☕ 휴식
                  </button>
                </div>
              </div>
            )}

            {/* Task Input */}
            {!focusMode && (
              timerType === 'work' ? (
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    작업 제목
                  </label>
                  <input
                    ref={taskTitleInputRef}
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="예: #cpue baseline 코드 작성"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-lg"
                    disabled={isRunning}
                  />
                  {/* 태그 버튼 섹션 */}
                  {tags.length > 0 && (
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-500 mb-2">
                        📌 빠른 태그
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {tags.map((tag, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => addTagToTitle(tag)}
                            disabled={isRunning}
                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mb-8">
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-blue-700 font-medium text-lg">☕ 휴식 중입니다</p>
                    <p className="text-blue-600 text-sm mt-1">잠시 쉬면서 재충전하세요!</p>
                  </div>
                </div>
              )
            )}

            {/* Timer Display with Circle Progress */}
            <div className={`text-center relative ${focusMode ? 'mb-4' : 'mb-8'}`}>
              <div className="relative inline-block">
                <svg className={`transform -rotate-90 ${focusMode ? 'w-56 h-56' : 'w-80 h-80'}`}>
                  {/* Background circle */}
                  <circle
                    cx={focusMode ? "112" : "160"}
                    cy={focusMode ? "112" : "160"}
                    r={focusMode ? "98" : "140"}
                    stroke="#e5e7eb"
                    strokeWidth={focusMode ? "10" : "12"}
                    fill="none"
                  />
                  {/* Progress circle */}
                  <circle
                    cx={focusMode ? "112" : "160"}
                    cy={focusMode ? "112" : "160"}
                    r={focusMode ? "98" : "140"}
                    stroke="url(#gradient)"
                    strokeWidth={focusMode ? "10" : "12"}
                    fill="none"
                    strokeDasharray={focusMode ? 2 * Math.PI * 98 : 2 * Math.PI * 140}
                    strokeDashoffset={(focusMode ? 2 * Math.PI * 98 : 2 * Math.PI * 140) * (1 - timeLeft / (selectedDuration * 60))}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={colors.gradient.from} />
                      <stop offset="100%" stopColor={colors.gradient.to} />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className={`font-bold ${timerType === 'work' ? 'text-purple-600' : 'text-blue-600'} ${focusMode ? 'text-4xl mb-1' : 'text-6xl mb-2'}`}>
                    {formatTime(timeLeft)}
                  </div>
                  <div className={`text-gray-500 ${focusMode ? 'text-sm' : 'text-lg'}`}>
                    {selectedDuration}분 세션
                  </div>
                </div>
              </div>
            </div>

            {/* Timer Controls */}
            <div className={`flex justify-center ${focusMode ? 'gap-2 mb-4' : 'gap-4 mb-8'}`}>
              {!isRunning ? (
                <button
                  onClick={startTimer}
                  className={`bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold shadow-lg transition-all flex items-center gap-2 ${
                    focusMode ? 'px-4 py-2 text-sm' : 'px-8 py-4 text-lg'
                  }`}
                >
                  <Play className={focusMode ? 'w-4 h-4' : 'w-6 h-6'} />
                  시작
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className={`bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-semibold shadow-lg transition-all flex items-center gap-2 ${
                    focusMode ? 'px-4 py-2 text-sm' : 'px-8 py-4 text-lg'
                  }`}
                >
                  <Pause className={focusMode ? 'w-4 h-4' : 'w-6 h-6'} />
                  일시정지
                </button>
              )}
              <button
                onClick={resetTimer}
                className={`bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold shadow-lg transition-all flex items-center gap-2 ${
                  focusMode ? 'px-4 py-2 text-sm' : 'px-8 py-4 text-lg'
                }`}
              >
                <RotateCcw className={focusMode ? 'w-4 h-4' : 'w-6 h-6'} />
                리셋
              </button>
              {!focusMode && timerType === 'work' && (
                <button
                  onClick={saveCurrentSession}
                  disabled={!taskTitle.trim() || timeLeft === selectedDuration * 60}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-6 h-6" />
                  저장
                </button>
              )}
            </div>

            {/* Duration Presets */}
            {!focusMode && (
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-3 ${timerType === 'work' ? 'text-gray-700' : 'text-gray-700'}`}>
                  시간 설정
                </label>
                <div className="flex gap-3 flex-wrap">
                  {[5, 10, 15, 25, 30, 45, 60].map(mins => (
                    <button
                      key={mins}
                      onClick={() => setDuration(mins)}
                      disabled={isRunning}
                      className={`px-6 py-2 rounded-lg font-medium transition-all ${
                        selectedDuration === mins
                          ? `${timerType === 'work' ? 'bg-purple-500' : 'bg-blue-500'} text-white shadow-md`
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {mins}분
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Duration */}
            {!focusMode && (
              <div className="flex gap-2">
                <input
                  type="number"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  placeholder="사용자 정의 (분)"
                  className={`flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none ${
                    timerType === 'work' ? 'focus:border-purple-500' : 'focus:border-blue-500'
                  }`}
                  disabled={isRunning}
                  min="1"
                  max="180"
                />
                <button
                  onClick={handleCustomDuration}
                  disabled={isRunning || !customMinutes}
                  className={`px-6 py-2 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    timerType === 'work'
                      ? 'bg-purple-500 hover:bg-purple-600'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  설정
                </button>
              </div>
            )}

            {/* Today's Quick Stats */}
            {!focusMode && (
              <div className="mt-8 pt-6 border-t-2 border-gray-100">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">오늘의 요약</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className={`rounded-lg p-4 text-center ${
                    timerType === 'work' ? 'bg-purple-50' : 'bg-blue-50'
                  }`}>
                    <div className={`text-2xl font-bold ${
                      timerType === 'work' ? 'text-purple-600' : 'text-blue-600'
                    }`}>{stats.totalHours}h</div>
                    <div className="text-sm text-gray-600">집중 시간</div>
                  </div>
                  <div className={`rounded-lg p-4 text-center ${
                    timerType === 'work' ? 'bg-blue-50' : 'bg-green-50'
                  }`}>
                    <div className={`text-2xl font-bold ${
                      timerType === 'work' ? 'text-blue-600' : 'text-green-600'
                    }`}>{stats.sessionCount}</div>
                    <div className="text-sm text-gray-600">총 세션</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.completedCount}</div>
                    <div className="text-sm text-gray-600">완료</div>
                  </div>
                </div>
              </div>
            )}

            {/* Memo Section */}
            {!focusMode && (
              <div className="mt-6 pt-6 border-t-2 border-gray-100">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">📝 메모</h3>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="오늘의 계획이나 메모를 자유롭게 작성하세요..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none text-gray-700"
                  rows="6"
                />
                <p className="text-xs text-gray-500 mt-2">💾 자동으로 저장됩니다</p>
              </div>
            )}
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">작업 통계</h2>
            
            {/* Overall Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
                <div className="text-3xl font-bold">{stats.totalHours}h</div>
                <div className="text-purple-100">오늘 집중 시간</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
                <div className="text-3xl font-bold">{stats.sessionCount}</div>
                <div className="text-blue-100">오늘 세션</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
                <div className="text-3xl font-bold">{stats.completedCount}</div>
                <div className="text-green-100">완료한 작업</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white">
                <div className="text-3xl font-bold">
                  {stats.sessionCount > 0 ? Math.round((stats.completedCount / stats.sessionCount) * 100) : 0}%
                </div>
                <div className="text-orange-100">완료율</div>
              </div>
            </div>

            {/* Data Location Info */}
            {dataPath && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">📁 데이터 저장 위치</h3>
                <p className="text-xs text-gray-600 font-mono break-all">{dataPath}\dotime-sessions.json</p>
                <p className="text-xs text-gray-500 mt-1">프로그램 종료 후에도 기록이 유지됩니다</p>
              </div>
            )}

            {/* Tags Section */}
            {tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  📌 태그
                  {selectedTags.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({selectedTags.length}개 선택됨)
                    </span>
                  )}
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {tags.map((tag, index) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={index}
                        onClick={() => toggleTagFilter(tag)}
                        className={`px-4 py-2 rounded-full text-sm font-medium shadow-sm transition-all hover:shadow-md ${
                          isSelected
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-105'
                            : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 hover:from-purple-200 hover:to-pink-200'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
                {selectedTags.length > 0 && (
                  <button
                    onClick={() => setSelectedTags([])}
                    className="mt-3 text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    필터 초기화
                  </button>
                )}
              </div>
            )}

            {/* Session History */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                오늘의 작업 기록
                {selectedTags.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-purple-600">
                    (필터링됨: {selectedTags.map(t => `#${t}`).join(', ')})
                  </span>
                )}
              </h3>
              {getTodaySessions().length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>
                    {selectedTags.length > 0
                      ? '선택한 태그와 일치하는 작업 기록이 없습니다'
                      : '아직 기록된 세션이 없습니다'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getTodaySessions().map(session => (
                    <div
                      key={session.id}
                      className="border-2 border-gray-100 rounded-lg p-4 hover:border-purple-200 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {session.completed ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                            <h4 className="font-semibold text-gray-800">{session.title}</h4>
                          </div>
                          <div className="text-sm text-gray-500 ml-7">
                            {new Date(session.timestamp).toLocaleTimeString('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })} - {session.duration}분 {session.partial ? '(부분 완료)' : '세션'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            session.completed
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {session.completed ? '완료' : '미완료'}
                          </div>
                          <button
                            onClick={() => restartSession(session)}
                            className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-all"
                            title="같은 작업 다시 시작"
                          >
                            <RotateCcw className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => deleteSession(session.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all text-xl"
                            title="삭제"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">세션 완료!</h3>
              <p className="text-gray-600 mb-6">
                <span className="font-semibold">"{taskTitle}"</span> 작업을 완료하셨나요?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleTaskCompletion(true)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  완료했어요
                </button>
                <button
                  onClick={() => handleTaskCompletion(false)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  못했어요
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Audio element for notification */}
        <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUKnk77RgGwU7k9n0yH0pBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBQ==" />
      </div>
    </div>
  );
}