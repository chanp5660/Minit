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
  const audioRef = useRef(null);

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setShowConfirmation(true);
      if (audioRef.current) {
        audioRef.current.play();
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (!taskTitle.trim()) {
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

  const getTodaySessions = () => {
    const today = new Date().toDateString();
    return sessions.filter(s => new Date(s.timestamp).toDateString() === today);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🍅 뽀모도로 타이머</h1>
          <p className="text-gray-600">집중력을 높이고 생산성을 추적하세요</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-white rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('timer')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'timer'
                ? 'bg-purple-500 text-white shadow-md'
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
                ? 'bg-purple-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="inline-block w-5 h-5 mr-2" />
            통계
          </button>
        </div>

        {/* Timer Tab */}
        {activeTab === 'timer' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Task Input */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                작업 제목
              </label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="예: baseline 코드 작성"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-lg"
                disabled={isRunning}
              />
            </div>

            {/* Timer Display with Circle Progress */}
            <div className="text-center mb-8 relative">
              <div className="relative inline-block">
                <svg className="w-80 h-80 transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="160"
                    cy="160"
                    r="140"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                    fill="none"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="160"
                    cy="160"
                    r="140"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 140}
                    strokeDashoffset={2 * Math.PI * 140 * (1 - timeLeft / (selectedDuration * 60))}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-6xl font-bold text-purple-600 mb-2">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-gray-500 text-lg">
                    {selectedDuration}분 세션
                  </div>
                </div>
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex gap-4 justify-center mb-8">
              {!isRunning ? (
                <button
                  onClick={startTimer}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all flex items-center gap-2"
                >
                  <Play className="w-6 h-6" />
                  시작
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all flex items-center gap-2"
                >
                  <Pause className="w-6 h-6" />
                  일시정지
                </button>
              )}
              <button
                onClick={resetTimer}
                className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-6 h-6" />
                리셋
              </button>
              <button
                onClick={saveCurrentSession}
                disabled={!taskTitle.trim() || timeLeft === selectedDuration * 60}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-6 h-6" />
                지금 저장
              </button>
            </div>

            {/* Duration Presets */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                시간 설정
              </label>
              <div className="flex gap-3 flex-wrap">
                {[15, 25, 30, 45, 60].map(mins => (
                  <button
                    key={mins}
                    onClick={() => setDuration(mins)}
                    disabled={isRunning}
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${
                      selectedDuration === mins
                        ? 'bg-purple-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {mins}분
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Duration */}
            <div className="flex gap-2">
              <input
                type="number"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                placeholder="사용자 정의 (분)"
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                disabled={isRunning}
                min="1"
                max="180"
              />
              <button
                onClick={handleCustomDuration}
                disabled={isRunning || !customMinutes}
                className="px-6 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                설정
              </button>
            </div>

            {/* Today's Quick Stats */}
            <div className="mt-8 pt-6 border-t-2 border-gray-100">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">오늘의 요약</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.totalHours}h</div>
                  <div className="text-sm text-gray-600">집중 시간</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.sessionCount}</div>
                  <div className="text-sm text-gray-600">총 세션</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.completedCount}</div>
                  <div className="text-sm text-gray-600">완료</div>
                </div>
              </div>
            </div>
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

            {/* Session History */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">오늘의 작업 기록</h3>
              {getTodaySessions().length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>아직 기록된 세션이 없습니다</p>
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