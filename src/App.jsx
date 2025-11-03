import React, { useState, useEffect, useRef } from 'react';
import { Clock, Play, Pause, RotateCcw, BarChart3, CheckCircle, XCircle, Trash2, ChevronUp, ChevronDown, Plus, ArrowRight, Github, ArrowUpToLine, ArrowDownToLine, HelpCircle } from 'lucide-react';

// 유틸리티 함수들
import { extractTags } from './utils/tagUtils';
import { formatTime } from './utils/timeUtils';
import { getTodaySessions, getTodayStats, getHourlyUsage } from './utils/sessionUtils';

// 커스텀 훅들
import { useNotifications } from './hooks/useNotifications';
import { useTags } from './hooks/useTags';
import { useDarkMode } from './hooks/useDarkMode';
import { useWindowSettings } from './hooks/useWindowSettings';
import { useMemos } from './hooks/useMemos';
import { useSessions } from './hooks/useSessions';
import { useStatistics } from './hooks/useStatistics';

// 모달 컴포넌트들
import { ConfirmationModal } from './components/Modals/ConfirmationModal';
import { DeleteConfirmModal } from './components/Modals/DeleteConfirmModal';
import { PartialSaveModal } from './components/Modals/PartialSaveModal';

// UI 컴포넌트들
import { Header } from './components/Header';
import { TabNavigation } from './components/TabNavigation';
import { TimerDisplay } from './components/Timer/TimerDisplay';
import { TimerControls } from './components/Timer/TimerControls';
import { TimerTypeToggle } from './components/Timer/TimerTypeToggle';
import { DurationSelector } from './components/Timer/DurationSelector';
import { QuickStats } from './components/Timer/QuickStats';
import { MemoList } from './components/Memo/MemoList';
import { StatsOverview } from './components/Stats/StatsOverview';
import { TagFilter } from './components/Stats/TagFilter';
import { SessionList } from './components/Stats/SessionList';
import { TimelineView } from './components/Stats/TimelineView';
import { ViewModeToggle } from './components/Stats/ViewModeToggle';
import { TimeRangeSelector } from './components/Stats/TimeRangeSelector';

export default function PomodoroTimer() {
  const [activeTab, setActiveTab] = useState('timer');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [customMinutes, setCustomMinutes] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [timerType, setTimerType] = useState('work'); // 'work' | 'break'
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'timeline'
  const [timeRangeStart, setTimeRangeStart] = useState(9); // 시간 현황 시작 시간 (기본값: 9시)
  const [timeRangeEnd, setTimeRangeEnd] = useState(21); // 시간 현황 종료 시간 (기본값: 21시)
  const [selectedSession, setSelectedSession] = useState(null); // 타임라인에서 선택된 세션
  const [expandedTimeSlot, setExpandedTimeSlot] = useState(null); // 확장된 시간대 그룹
  const [showPartialSaveModal, setShowPartialSaveModal] = useState(false); // 부분 저장 모달
  const [partialSessionData, setPartialSessionData] = useState(null); // 부분 저장 데이터
  const [showEditModal, setShowEditModal] = useState(false); // 수정 모달
  const [editingSession, setEditingSession] = useState(null); // 수정 중인 세션
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // 삭제 확인 모달
  const [deleteConfirmData, setDeleteConfirmData] = useState(null); // 삭제 확인 데이터 {type: 'memo' | 'session', id: number, callback: function}
  const [dontAskDelete, setDontAskDelete] = useState(false); // 다시 묻지 않음
  const [currentSessionStart, setCurrentSessionStart] = useState(null);
  const taskTitleInputRef = useRef(null);
  const audioRef = useRef(null);

  // 커스텀 훅들 사용
  const { sendNotification } = useNotifications();
  const { 
    tags, 
    selectedTags, 
    selectedMemoTags, 
    setSelectedTags, 
    setSelectedMemoTags,
    saveTag, 
    toggleTagFilter,
    toggleMemoTagFilter,
    extractTags: extractTagsFromHook
  } = useTags();
  const { darkMode, setDarkMode } = useDarkMode();
  const { alwaysOnTop, focusMode, dataPath, toggleAlwaysOnTop, toggleFocusMode, openGithub } = useWindowSettings();
  const { sessions, addSession, deleteSession, updateSession } = useSessions();
  
  const {
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
  } = useMemos(extractTags);

  // 통계 계산
  const { todaySessions, stats, hourlyUsage } = useStatistics(sessions, selectedTags, extractTags, timeRangeStart, timeRangeEnd);

  // 태그 추출 함수는 유틸리티에서 import하여 사용

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

  // 삭제 확인 설정 로드 및 저장
  useEffect(() => {
    const loadDontAskDelete = async () => {
      try {
        if (typeof window !== 'undefined' && window.require) {
          const { ipcRenderer } = window.require('electron');
          const dontAskResult = await ipcRenderer.invoke('load-dont-ask-delete');
          if (dontAskResult.success) {
            setDontAskDelete(dontAskResult.data || false);
          }
        }
      } catch (error) {
        console.error('삭제 확인 설정 로드 실패:', error);
      }
    };
    loadDontAskDelete();
  }, []);

  useEffect(() => {
    const saveDontAskDelete = async () => {
      try {
        if (typeof window !== 'undefined' && window.require) {
          const { ipcRenderer } = window.require('electron');
          await ipcRenderer.invoke('save-dont-ask-delete', dontAskDelete);
        }
      } catch (error) {
        console.error('삭제 확인 설정 저장 실패:', error);
      }
    };
    if (dontAskDelete !== false) {
      saveDontAskDelete();
    }
  }, [dontAskDelete]);

  // 시간 범위 설정 로드
  useEffect(() => {
    try {
      const savedStart = localStorage.getItem('timeRangeStart');
      const savedEnd = localStorage.getItem('timeRangeEnd');
      if (savedStart !== null) {
        const start = parseInt(savedStart, 10);
        if (start >= 0 && start <= 23) {
          setTimeRangeStart(start);
        }
      }
      if (savedEnd !== null) {
        const end = parseInt(savedEnd, 10);
        if (end >= 0 && end <= 23) {
          setTimeRangeEnd(end);
        }
      }
    } catch (error) {
      console.error('시간 범위 설정 로드 실패:', error);
    }
  }, []);

  // 시간 범위 설정 저장
  useEffect(() => {
    try {
      localStorage.setItem('timeRangeStart', timeRangeStart.toString());
      localStorage.setItem('timeRangeEnd', timeRangeEnd.toString());
    } catch (error) {
      console.error('시간 범위 설정 저장 실패:', error);
    }
  }, [timeRangeStart, timeRangeEnd]);

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
        const activeContent = getActiveMemoContent();
        sendNotification('🍅 타이머 완료!', `"${activeContent}" 작업 시간이 끝났습니다.`);
        setShowConfirmation(true);
      } else {
        sendNotification('🍅 휴식 완료!', '휴식 시간이 끝났습니다. 다시 집중해볼까요?');
        // 휴식 타이머는 확인 모달 없이 자동으로 리셋
        setTimeLeft(selectedDuration * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, timerType, selectedDuration, sendNotification, activeMemoId, memos]);

  // formatTime은 유틸리티에서 import하여 사용

  const toggleTimerType = () => {
    if (isRunning) {
      return; // 타이머 실행 중에는 전환 불가
    }
    const newType = timerType === 'work' ? 'break' : 'work';
    setTimerType(newType);
    setTimeLeft(selectedDuration * 60);
  };

  // getActiveMemoContent는 useMemos 훅에서 가져옴

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

  const handleTaskCompletion = (completed, inProgress = false) => {
    // 체크된 메모의 내용을 작업 제목으로 사용
    const activeContent = getActiveMemoContent();
    if (!activeContent.trim()) {
      alert('작업중인 메모를 선택해주세요!');
      return;
    }

    // 제목에서 태그 추출 및 저장
    const extractedTags = extractTags(activeContent);
    extractedTags.forEach(tag => saveTag(tag));

    const newSession = {
      id: Date.now(),
      title: activeContent,
      duration: selectedDuration,
      completed: completed,
      inProgress: inProgress,
      timestamp: currentSessionStart || new Date(),
      endTime: new Date(),
      partial: false
    };
    addSession(newSession);
    setShowConfirmation(false);
    setTimeLeft(selectedDuration * 60);
    setCurrentSessionStart(null);
  };

  const saveCurrentSession = () => {
    // 체크된 메모의 내용을 작업 제목으로 사용
    const activeContent = getActiveMemoContent();
    if (!activeContent.trim()) {
      alert('작업중인 메모를 선택해주세요!');
      return;
    }

    const elapsedMinutes = Math.ceil((selectedDuration * 60 - timeLeft) / 60);

    if (elapsedMinutes === 0) {
      alert('아직 시작하지 않았습니다!');
      return;
    }

    // 제목에서 태그 추출 및 저장
    const extractedTags = extractTags(activeContent);
    extractedTags.forEach(tag => saveTag(tag));

    // 부분 저장 데이터 준비
    const sessionData = {
      title: activeContent,
      duration: elapsedMinutes,
      timestamp: currentSessionStart || new Date(),
      endTime: new Date()
    };

    setPartialSessionData(sessionData);
    setShowPartialSaveModal(true);
  };

  const handlePartialSaveCompletion = (completed, inProgress = false) => {
    if (!partialSessionData) return;

    const newSession = {
      id: Date.now(),
      title: partialSessionData.title,
      duration: partialSessionData.duration,
      completed: completed,
      inProgress: inProgress,
      timestamp: partialSessionData.timestamp,
      endTime: partialSessionData.endTime,
      partial: true
    };

    addSession(newSession);
    setShowPartialSaveModal(false);
    setPartialSessionData(null);
    setTimeLeft(selectedDuration * 60);
    setIsRunning(false);
    setCurrentSessionStart(null);
  };

  // 세션 삭제 확인
  const confirmDeleteSession = (sessionId) => {
    if (dontAskDelete) {
      deleteSession(sessionId);
      return;
    }
    setDeleteConfirmData({
      type: 'session',
      id: sessionId,
      callback: () => deleteSession(sessionId)
    });
    setShowDeleteConfirm(true);
  };

  // deleteSession은 useSessions 훅에서 가져옴

  // 라디오 버튼 클릭 핸들러
  const handleMemoRadioChange = (memoId) => {
    setActiveMemoId(memoId === activeMemoId ? null : memoId);
  };

  // 세션 수정 함수
  const handleUpdateSession = (sessionId, newTitle, newStartTime, newEndTime) => {
    const updates = { title: newTitle };
    if (newStartTime) {
      updates.timestamp = newStartTime;
    }
    if (newEndTime) {
      updates.endTime = newEndTime;
    }
    // 시작 시간과 종료 시간으로부터 duration 자동 계산
    if (newStartTime && newEndTime) {
      const durationMs = newEndTime.getTime() - newStartTime.getTime();
      updates.duration = Math.ceil(durationMs / (1000 * 60)); // 분 단위로 변환
    }
    updateSession(sessionId, updates);
    setShowEditModal(false);
    setEditingSession(null);
  };

  // 메모 관련 함수들은 useMemos 훅에서 가져옴
  
  // 메모 삭제 확인
  const confirmDeleteMemo = (id) => {
    if (dontAskDelete) {
      deleteMemo(id);
      return;
    }
    setDeleteConfirmData({
      type: 'memo',
      id: id,
      callback: () => deleteMemo(id)
    });
    setShowDeleteConfirm(true);
  };

  // 필터링된 메모 목록 반환 (메모 내용에서 태그 추출)
  const getFilteredMemos = () => {
    if (selectedMemoTags.length === 0) {
      return memos;
    }
    return memos.filter(memo => {
      const extractedTags = extractTags(memo.content || '');
      // 선택된 태그 중 하나라도 포함되면 표시 (OR 조건)
      return selectedMemoTags.some(tag => extractedTags.includes(tag));
    });
  };

  // 모든 메모 태그 수집 (필터링용) - 메모 내용에서 직접 추출
  const getAllMemoTags = () => {
    const allTags = new Set();
    memos.forEach(memo => {
      const extractedTags = extractTags(memo.content || '');
      extractedTags.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  };

  // toggleAlwaysOnTop, toggleFocusMode, openGithub은 useWindowSettings 훅에서 가져옴
  // 통계 관련 함수들은 useStatistics 훅에서 가져옴

  return (
    <div className={`min-h-screen ${
      darkMode
        ? 'bg-gray-900'
        : 'bg-gradient-to-br from-purple-50 to-blue-50'
    } ${focusMode ? 'p-2' : 'p-4'}`}>
      <div className={`mx-auto ${focusMode ? 'max-w-md' : 'max-w-4xl'}`}>
        {/* Header */}
        <Header
          focusMode={focusMode}
          darkMode={darkMode}
          getActiveMemoContent={getActiveMemoContent}
          alwaysOnTop={alwaysOnTop}
          toggleAlwaysOnTop={toggleAlwaysOnTop}
          toggleFocusMode={toggleFocusMode}
          openGithub={openGithub}
          setDarkMode={setDarkMode}
        />

        {/* Tab Navigation */}
        {!focusMode && (
          <TabNavigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            timerType={timerType}
            darkMode={darkMode}
          />
        )}

        {/* Timer Tab */}
        {(activeTab === 'timer' || focusMode) && (
          <div className={`rounded-2xl shadow-xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } ${focusMode ? 'p-4' : 'p-8'}`}>
            {/* Timer Type Toggle */}
            {!focusMode && (
              <TimerTypeToggle
                timerType={timerType}
                toggleTimerType={toggleTimerType}
                isRunning={isRunning}
                darkMode={darkMode}
              />
            )}

            {/* Task Input */}
            {!focusMode && timerType === 'break' && (
              <div className="mb-8">
                <div className={`border-2 rounded-lg p-4 text-center ${
                  darkMode
                    ? 'bg-blue-900 border-blue-700'
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <p className={`font-medium text-lg ${
                    darkMode ? 'text-blue-300' : 'text-blue-700'
                  }`}>☕ 휴식 중입니다</p>
                  <p className={`text-sm mt-1 ${
                    darkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>잠시 쉬면서 재충전하세요!</p>
                </div>
              </div>
            )}

            {/* Timer Display */}
            <TimerDisplay
              timeLeft={timeLeft}
              selectedDuration={selectedDuration}
              timerType={timerType}
              focusMode={focusMode}
              darkMode={darkMode}
              colors={colors}
            />

            {/* Timer Controls */}
            <TimerControls
              isRunning={isRunning}
              focusMode={focusMode}
              timerType={timerType}
              timeLeft={timeLeft}
              selectedDuration={selectedDuration}
              getActiveMemoContent={getActiveMemoContent}
              startTimer={startTimer}
              pauseTimer={pauseTimer}
              resetTimer={resetTimer}
              saveCurrentSession={saveCurrentSession}
            />

            {/* Duration Selector */}
            {!focusMode && (
              <DurationSelector
                selectedDuration={selectedDuration}
                customMinutes={customMinutes}
                setCustomMinutes={setCustomMinutes}
                setDuration={setDuration}
                isRunning={isRunning}
                timerType={timerType}
                darkMode={darkMode}
                focusMode={focusMode}
                handleCustomDuration={handleCustomDuration}
              />
            )}

            {/* Today's Quick Stats */}
            {!focusMode && (
              <QuickStats
                stats={stats}
                timerType={timerType}
                darkMode={darkMode}
              />
            )}

            {/* Memo Section */}
            {!focusMode && (
              <MemoList
                memos={memos}
                filteredMemos={getFilteredMemos()}
                getAllMemoTags={getAllMemoTags}
                selectedMemoTags={selectedMemoTags}
                toggleMemoTagFilter={toggleMemoTagFilter}
                setSelectedMemoTags={setSelectedMemoTags}
                activeMemoId={activeMemoId}
                draggedMemo={draggedMemo}
                darkMode={darkMode}
                addMemo={addMemo}
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
            )}
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className={`rounded-2xl shadow-xl p-8 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h2 className={`text-2xl font-bold mb-6 ${
              darkMode ? 'text-gray-100' : 'text-gray-800'
            }`}>작업 통계</h2>
            
            {/* Overall Stats & Data Location */}
            <StatsOverview
              stats={stats}
              darkMode={darkMode}
              dataPath={dataPath}
            />

            {/* Tags Section */}
            <TagFilter
              tags={tags}
              selectedTags={selectedTags}
              toggleTagFilter={toggleTagFilter}
              setSelectedTags={setSelectedTags}
              darkMode={darkMode}
            />

            {/* Session History */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-semibold ${
                  darkMode ? 'text-gray-100' : 'text-gray-800'
                }`}>
                  오늘의 작업 기록
                  {selectedTags.length > 0 && (
                    <span className={`ml-2 text-sm font-normal ${
                      darkMode ? 'text-purple-400' : 'text-purple-600'
                    }`}>
                      (필터링됨: {selectedTags.map(t => `#${t}`).join(', ')})
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-4">
                  <ViewModeToggle
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    darkMode={darkMode}
                  />
                  {viewMode === 'timeline' && (
                    <TimeRangeSelector
                      startHour={timeRangeStart}
                      endHour={timeRangeEnd}
                      onStartChange={setTimeRangeStart}
                      onEndChange={setTimeRangeEnd}
                      darkMode={darkMode}
                    />
                  )}
                </div>
              </div>
              
              {/* List View */}
              {viewMode === 'list' && (
                <SessionList
                  sessions={todaySessions}
                  selectedTags={selectedTags}
                  darkMode={darkMode}
                  onEdit={(session) => {
                    setEditingSession(session);
                    setShowEditModal(true);
                  }}
                  onDelete={confirmDeleteSession}
                />
              )}

              {/* Timeline View */}
              {viewMode === 'timeline' && (
                <TimelineView
                  hourlyUsage={hourlyUsage}
                  selectedTags={selectedTags}
                  darkMode={darkMode}
                  setExpandedTimeSlot={setExpandedTimeSlot}
                />
              )}
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          activeContent={getActiveMemoContent()}
          onComplete={() => handleTaskCompletion(true, false)}
          onInProgress={() => handleTaskCompletion(false, true)}
          darkMode={darkMode}
        />

        {/* Partial Save Modal */}
        <PartialSaveModal
          isOpen={showPartialSaveModal}
          onClose={() => {
            setShowPartialSaveModal(false);
            setPartialSessionData(null);
          }}
          sessionData={partialSessionData}
          onComplete={() => handlePartialSaveCompletion(true, false)}
          onInProgress={() => handlePartialSaveCompletion(false, true)}
          darkMode={darkMode}
        />

        {/* Time Slot Expansion Modal */}
        {expandedTimeSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className={`rounded-2xl p-8 max-w-2xl w-full shadow-2xl transform transition-all duration-300 animate-slideUp ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex items-start justify-between mb-6">
                <h3 className={`text-2xl font-bold ${
                  darkMode ? 'text-gray-100' : 'text-gray-800'
                }`}>
                  겹치는 세션 상세보기
                  <span className={`ml-2 text-lg ${
                    darkMode ? 'text-purple-400' : 'text-purple-600'
                  }`}>
                    ({expandedTimeSlot.sessions.length}개 세션)
                  </span>
                </h3>
                <button
                  onClick={() => setExpandedTimeSlot(null)}
                  className={`transition-colors ${
                    darkMode
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Time Range Info */}
              <div className={`mb-6 p-4 rounded-lg ${
                darkMode ? 'bg-purple-900' : 'bg-purple-50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🕐</span>
                  <span className={`font-semibold ${
                    darkMode ? 'text-purple-300' : 'text-purple-700'
                  }`}>
                    시간 범위
                  </span>
                </div>
                <p className={`text-sm ${
                  darkMode ? 'text-purple-200' : 'text-purple-600'
                }`}>
                  {expandedTimeSlot.startTime.toLocaleTimeString('ko-KR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })} - {expandedTimeSlot.endTime.toLocaleTimeString('ko-KR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })} ({expandedTimeSlot.duration}분)
                </p>
              </div>

              {/* Sessions List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {expandedTimeSlot.sessions.map((session, index) => (
                  <div
                    key={session.id}
                    onClick={() => {
                      setSelectedSession(session);
                      setExpandedTimeSlot(null);
                    }}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 hover:border-purple-500'
                        : 'bg-white border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {session.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          <h4 className={`font-semibold ${
                            darkMode ? 'text-gray-100' : 'text-gray-800'
                          }`}>{session.title}</h4>
                        </div>
                        <div className={`text-sm ml-7 ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {new Date(session.timestamp).toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })} - {session.duration}분 {session.partial ? '(부분 완료)' : '세션'}
                        </div>
                        {/* Tags */}
                        {extractTags(session.title).length > 0 && (
                          <div className="flex gap-2 flex-wrap mt-2 ml-7">
                            {extractTags(session.title).map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  darkMode
                                    ? 'bg-purple-900 text-purple-300'
                                    : 'bg-purple-100 text-purple-700'
                                }`}
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          session.completed
                            ? darkMode
                              ? 'bg-green-900 text-green-300'
                              : 'bg-green-100 text-green-700'
                            : session.inProgress
                              ? darkMode
                                ? 'bg-yellow-900 text-yellow-300'
                                : 'bg-yellow-100 text-yellow-700'
                              : darkMode
                                ? 'bg-red-900 text-red-300'
                                : 'bg-red-100 text-red-700'
                        }`}>
                          {session.completed ? '완료' : session.inProgress ? '진행 중' : '미완료'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setExpandedTimeSlot(null)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Session Detail Modal */}
        {selectedSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-2xl p-8 max-w-lg w-full shadow-2xl ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex items-start justify-between mb-6">
                <h3 className={`text-2xl font-bold ${
                  darkMode ? 'text-gray-100' : 'text-gray-800'
                }`}>세션 상세 정보</h3>
                <button
                  onClick={() => setSelectedSession(null)}
                  className={`transition-colors ${
                    darkMode
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Session Info */}
              <div className="space-y-4 mb-6">
                {/* Title */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>작업 제목</label>
                  <p className={`text-lg font-semibold ${
                    darkMode ? 'text-gray-100' : 'text-gray-800'
                  }`}>{selectedSession.title}</p>
                </div>

                {/* Time Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>시작 시간</label>
                    <p className={darkMode ? 'text-gray-200' : 'text-gray-800'}>
                      {new Date(selectedSession.timestamp).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>종료 시간</label>
                    <p className={darkMode ? 'text-gray-200' : 'text-gray-800'}>
                      {selectedSession.endTime
                        ? new Date(selectedSession.endTime).toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '-'}
                    </p>
                  </div>
                </div>

                {/* Duration and Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>소요 시간</label>
                    <p className={`font-semibold ${
                      darkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>{selectedSession.duration}분</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>상태</label>
                    <div className="flex items-center gap-2">
                      {selectedSession.completed ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-green-600 font-semibold">완료</span>
                        </>
                      ) : selectedSession.inProgress ? (
                        <>
                          <Clock className="w-5 h-5 text-yellow-500" />
                          <span className="text-yellow-600 font-semibold">진행 중</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-red-500" />
                          <span className="text-red-600 font-semibold">미완료</span>
                        </>
                      )}
                      {selectedSession.partial && (
                        <span className={`text-xs ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>(부분)</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {extractTags(selectedSession.title).length > 0 && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>태그</label>
                    <div className="flex gap-2 flex-wrap">
                      {extractTags(selectedSession.title).map((tag, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            darkMode
                              ? 'bg-purple-900 text-purple-300'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    restartSession(selectedSession);
                    setSelectedSession(null);
                  }}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  다시 시작
                </button>
                <button
                  onClick={() => {
                    confirmDeleteSession(selectedSession.id);
                    setSelectedSession(null);
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Session Edit Modal */}
        {showEditModal && editingSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-2xl p-8 max-w-md w-full shadow-2xl ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-2xl font-bold mb-6 ${
                darkMode ? 'text-gray-100' : 'text-gray-800'
              }`}>세션 수정</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    작업 제목
                  </label>
                  <input
                    type="text"
                    id="edit-title"
                    defaultValue={editingSession.title}
                    className={`w-full px-4 py-3 rounded-lg focus:border-purple-500 focus:outline-none ${
                      darkMode
                        ? 'bg-gray-700 border-2 border-gray-600 text-gray-100'
                        : 'bg-white border-2 border-gray-200 text-gray-800'
                    }`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      시작 시간
                    </label>
                    <input
                      type="datetime-local"
                      id="edit-start-time"
                      defaultValue={(() => {
                        const date = new Date(editingSession.timestamp);
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const hours = String(date.getHours()).padStart(2, '0');
                        const minutes = String(date.getMinutes()).padStart(2, '0');
                        return `${year}-${month}-${day}T${hours}:${minutes}`;
                      })()}
                      onChange={(e) => {
                        if (e.target.value) {
                          const date = new Date(e.target.value);
                          const formatted = date.toLocaleString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          });
                          const previewEl = document.getElementById('start-time-preview');
                          if (previewEl) {
                            previewEl.textContent = formatted;
                          }
                        }
                      }}
                      className={`w-full px-4 py-3 rounded-lg focus:border-purple-500 focus:outline-none ${
                        darkMode
                          ? 'bg-gray-700 border-2 border-gray-600 text-gray-100'
                          : 'bg-white border-2 border-gray-200 text-gray-800'
                      }`}
                    />
                    <p id="start-time-preview" className={`text-xs mt-1 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {new Date(editingSession.timestamp).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      종료 시간
                    </label>
                    <input
                      type="datetime-local"
                      id="edit-end-time"
                      defaultValue={editingSession.endTime ? (() => {
                        const date = new Date(editingSession.endTime);
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const hours = String(date.getHours()).padStart(2, '0');
                        const minutes = String(date.getMinutes()).padStart(2, '0');
                        return `${year}-${month}-${day}T${hours}:${minutes}`;
                      })() : ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          const date = new Date(e.target.value);
                          const formatted = date.toLocaleString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          });
                          const previewEl = document.getElementById('end-time-preview');
                          if (previewEl) {
                            previewEl.textContent = formatted;
                          }
                        }
                      }}
                      className={`w-full px-4 py-3 rounded-lg focus:border-purple-500 focus:outline-none ${
                        darkMode
                          ? 'bg-gray-700 border-2 border-gray-600 text-gray-100'
                          : 'bg-white border-2 border-gray-200 text-gray-800'
                      }`}
                    />
                    {editingSession.endTime && (
                      <p id="end-time-preview" className={`text-xs mt-1 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {new Date(editingSession.endTime).toLocaleString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </p>
                    )}
                    {!editingSession.endTime && (
                      <p id="end-time-preview" className={`text-xs mt-1 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}></p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const titleInput = document.getElementById('edit-title');
                    const startTimeInput = document.getElementById('edit-start-time');
                    const endTimeInput = document.getElementById('edit-end-time');
                    
                    const newTitle = titleInput.value.trim();
                    const newStartTime = startTimeInput.value ? new Date(startTimeInput.value) : null;
                    const newEndTime = endTimeInput.value ? new Date(endTimeInput.value) : null;
                    
                    if (!newTitle) {
                      alert('작업 제목을 입력해주세요!');
                      return;
                    }
                    if (!newStartTime) {
                      alert('시작 시간을 입력해주세요!');
                      return;
                    }
                    if (!newEndTime) {
                      alert('종료 시간을 입력해주세요!');
                      return;
                    }
                    if (newStartTime >= newEndTime) {
                      alert('종료 시간은 시작 시간보다 늦어야 합니다!');
                      return;
                    }
                    
                    handleUpdateSession(editingSession.id, newTitle, newStartTime, newEndTime);
                  }}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  저장
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingSession(null);
                  }}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                    darkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setDeleteConfirmData(null);
          }}
          onConfirm={() => {
            if (deleteConfirmData) {
              deleteConfirmData.callback();
              setShowDeleteConfirm(false);
              setDeleteConfirmData(null);
            }
          }}
          type={deleteConfirmData?.type || 'memo'}
          darkMode={darkMode}
          dontAskDelete={dontAskDelete}
          onDontAskChange={setDontAskDelete}
        />

        {/* Audio element for notification */}
        <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUKnk77RgGwU7k9n0yH0pBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBSh+zPLaizsKElyx6OyrVhgLSKXh8bllHAU2jdXzzn8qBQ==" />
      </div>
    </div>
  );
}