import React, { useState, useEffect } from 'react';
import { IoPlay, IoPause, IoStop, IoRefresh } from 'react-icons/io5';
import axiosInstance from '../../utils/axiosinstance';

export default function PomodoroTimer() {
  const [mode, setMode] = useState('work'); // 'work', 'break', 'longBreak'
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [totalTimeToday, setTotalTimeToday] = useState(0);

  const WORK_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;
  const LONG_BREAK_TIME = 15 * 60;

  useEffect(() => {
    let interval;

    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime(prev => prev - 1);
      }, 1000);
    } else if (time === 0 && isRunning) {
      handleSessionComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, time]);

  useEffect(() => {
    loadUserTasks();
  }, []);

  const loadUserTasks = async () => {
    try {
      const response = await axiosInstance.get('/api/tasks/user-dashboard-data');
      setTasks(response.data.data?.tasks || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleSessionComplete = () => {
    setIsRunning(false);

    if (mode === 'work') {
      // Play notification sound (optional)
      playNotification();

      // Save time entry if task is selected
      if (selectedTaskId) {
        saveTimeEntry();
      }

      // Update sessions
      const newSessions = sessionsCompleted + 1;
      setSessionsCompleted(newSessions);

      // Switch to break
      if (newSessions % 4 === 0) {
        setMode('longBreak');
        setTime(LONG_BREAK_TIME);
      } else {
        setMode('break');
        setTime(BREAK_TIME);
      }
    } else {
      // Break completed, switch back to work
      setMode('work');
      setTime(WORK_TIME);
    }
  };

  const saveTimeEntry = async () => {
    try {
      await axiosInstance.post(`/api/tasks/${selectedTaskId}/time/manual`, {
        duration: WORK_TIME,
        description: 'Pomodoro session'
      });
    } catch (error) {
      console.error('Error saving time entry:', error);
    }
  };

  const playNotification = () => {
    // Use Web Audio API or play a simple beep
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(
      mode === 'work'
        ? WORK_TIME
        : mode === 'break'
        ? BREAK_TIME
        : LONG_BREAK_TIME
    );
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getModeLabel = () => {
    switch (mode) {
      case 'work':
        return 'Work Time 🎯';
      case 'break':
        return 'Break Time ☕';
      case 'longBreak':
        return 'Long Break 🌳';
      default:
        return 'Pomodoro';
    }
  };

  const getModeColor = () => {
    switch (mode) {
      case 'work':
        return 'from-blue-500 to-blue-600';
      case 'break':
        return 'from-green-500 to-green-600';
      case 'longBreak':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const progressPercentage =
    mode === 'work'
      ? ((WORK_TIME - time) / WORK_TIME) * 100
      : mode === 'break'
      ? ((BREAK_TIME - time) / BREAK_TIME) * 100
      : ((LONG_BREAK_TIME - time) / LONG_BREAK_TIME) * 100;

  return (
    <div className="rounded-lg shadow-lg p-8 max-w-md mx-auto bg-gray-50">
      <style>{`
        .pomodoro-container {
          background: linear-gradient(to bottom right, #f9fafb, #f3f4f6);
        }
      `}</style>
      <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">Pomodoro Timer</h1>

      {/* Mode Selector */}
      <div className="flex gap-2 mb-6 justify-center">
        <button
          onClick={() => {
            setMode('work');
            setTime(WORK_TIME);
          }}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            mode === 'work'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Work (25m)
        </button>
        <button
          onClick={() => {
            setMode('break');
            setTime(BREAK_TIME);
          }}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            mode === 'break'
              ? 'bg-green-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Break (5m)
        </button>
        <button
          onClick={() => {
            setMode('longBreak');
            setTime(LONG_BREAK_TIME);
          }}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            mode === 'longBreak'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Long (15m)
        </button>
      </div>

      {/* Timer Display */}
      <div className={`rounded-2xl p-8 mb-6 shadow-lg`} style={{
        background: mode === 'work' 
          ? 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)'
          : mode === 'break'
          ? 'linear-gradient(135deg, #10b981 0%, #047857 100%)'
          : 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)'
      }}>
        <p className="text-white/80 text-center mb-2">{getModeLabel()}</p>
        <div className="text-7xl font-bold text-white text-center font-mono">
          {formatTime(time)}
        </div>

        {/* Progress Circle */}
        <div className="relative w-40 h-40 mx-auto mt-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="3"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeDasharray={`${(progressPercentage / 100) * 283} 283`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.3s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white/60 text-sm font-medium">{Math.round(progressPercentage)}%</span>
          </div>
        </div>
      </div>

      {/* Task Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Focus on task (optional)</label>
        <select
          value={selectedTaskId || ''}
          onChange={(e) => setSelectedTaskId(e.target.value || null)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="">Select a task...</option>
          {tasks.map(task => (
            <option key={task._id} value={task._id}>
              {task.title}
            </option>
          ))}
        </select>
      </div>

      {/* Controls */}
      <div className="flex gap-3 justify-center mb-6">
        <button
          onClick={toggleTimer}
          className={`p-3 rounded-full text-white font-medium transition ${
            isRunning
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isRunning ? <IoPause className="text-2xl" /> : <IoPlay className="text-2xl" />}
        </button>

        <button
          onClick={resetTimer}
          className="p-3 rounded-full bg-gray-500 text-white hover:bg-gray-600 transition font-medium"
        >
          <IoRefresh className="text-2xl" />
        </button>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Sessions Today:</span>
          <span className="font-bold text-gray-900">{sessionsCompleted}/8</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${(sessionsCompleted / 8) * 100}%` }}
          ></div>
        </div>
        <p className="text-center text-gray-500 mt-3 text-xs">
          {8 - sessionsCompleted} sessions until daily goal
        </p>
      </div>

      {/* Motivational Message */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-center text-sm text-blue-700">
          {mode === 'work' && sessionsCompleted === 0
            ? '🚀 Start your first session!'
            : mode === 'work' && sessionsCompleted > 0
            ? `💪 Keep up the great work! ${sessionsCompleted} sessions done!`
            : '😊 Take a well-deserved break!'}
        </p>
      </div>
    </div>
  );
}
