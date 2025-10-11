import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock, Timer, BarChart3, Calendar } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';

const API_BASE = "http://localhost:4000/api/time-tracking";

const TimeTracker = () => {
  const outletContext = useOutletContext();
  const tasks = outletContext?.tasks || [];
  const [activeTracking, setActiveTracking] = useState(null);
  const [timeHistory, setTimeHistory] = useState([]);
  const [timeStats, setTimeStats] = useState(null);
  const [selectedTask, setSelectedTask] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [backendAvailable, setBackendAvailable] = useState(true);

  useEffect(() => {
    fetchActiveTracking();
    fetchTimeHistory();
    fetchTimeStats();
  }, []);

  useEffect(() => {
    let interval;
    if (activeTracking) {
      interval = setInterval(() => {
        const startTime = new Date(activeTracking.startTime);
        const now = new Date();
        setCurrentTime(Math.floor((now - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTracking]);

  const fetchActiveTracking = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log('No token found for active tracking');
        return;
      }
      
      console.log('Fetching active tracking...');
      const response = await axios.get(`${API_BASE}/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Active tracking response:', response.data);
      
      if (response.data.success) {
        setActiveTracking(response.data.timeTracking);
        console.log('Set active tracking:', response.data.timeTracking);
      }
    } catch (error) {
      console.error('Error fetching active tracking:', error);
    }
  };

  const fetchTimeHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const response = await axios.get(`${API_BASE}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setTimeHistory(response.data.timeTrackings || []);
      }
    } catch (error) {
      console.error('Error fetching time history:', error);
    }
  };

  const fetchTimeStats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const response = await axios.get(`${API_BASE}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setTimeStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching time stats:', error);
    }
  };

  const startTracking = async () => {
    if (!selectedTask) {
      alert('Please select a task to track time for');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert('Please login first');
        setLoading(false);
        return;
      }

      // Check if backend is available
      try {
        await axios.get('http://localhost:4000/api/task/gp', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBackendAvailable(true);
      } catch (backendError) {
        console.error('Backend not available:', backendError);
        setBackendAvailable(false);
        
        // Use local fallback
        const selectedTaskData = tasks.find(task => task._id === selectedTask);
        if (selectedTaskData) {
          const localTracking = {
            _id: `local_${Date.now()}`,
            task: selectedTaskData,
            startTime: new Date(),
            description: description,
            isActive: true,
            isLocal: true
          };
          setActiveTracking(localTracking);
          setCurrentTime(0);
          setDescription('');
          setSelectedTask('');
          alert('Time tracking started locally (backend unavailable)');
          setLoading(false);
          return;
        } else {
          alert('Selected task not found');
          setLoading(false);
          return;
        }
      }

      console.log('Sending time tracking request:', {
        taskId: selectedTask,
        description,
        token: token ? 'Present' : 'Missing'
      });

      const response = await axios.post(`${API_BASE}/start`, {
        taskId: selectedTask,
        description
      }, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000 // 10 second timeout
      });

      console.log('Time tracking response:', response.data);
      
      if (response.data.success) {
        setActiveTracking(response.data.timeTracking);
        setCurrentTime(0);
        setDescription('');
        setSelectedTask('');
        alert('Time tracking started successfully!');
      } else {
        alert(response.data.message || 'Error starting time tracking');
      }
    } catch (error) {
      console.error('Error starting time tracking:', error);
      
      if (error.code === 'ECONNABORTED') {
        alert('Request timeout. Please check your internet connection and try again.');
      } else if (error.response?.status === 404) {
        alert('Time tracking API not found. Please check if the backend server is running.');
      } else if (error.response?.status === 500) {
        alert('Server error. Please check if the backend server is running properly.');
      } else if (error.response?.status === 401) {
        alert('Authentication failed. Please login again.');
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Error starting time tracking';
        alert(`Error: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const stopTracking = async () => {
    if (!activeTracking) return;

    setLoading(true);
    
    // Handle local tracking
    if (activeTracking.isLocal) {
      const endTime = new Date();
      const duration = Math.round((endTime - new Date(activeTracking.startTime)) / (1000 * 60)); // in minutes
      
      // Save to localStorage for local tracking
      const localHistory = JSON.parse(localStorage.getItem('localTimeHistory') || '[]');
      localHistory.push({
        ...activeTracking,
        endTime: endTime,
        duration: duration,
        isActive: false
      });
      localStorage.setItem('localTimeHistory', JSON.stringify(localHistory));
      
      setActiveTracking(null);
      setCurrentTime(0);
      alert(`Time tracking stopped. Duration: ${duration} minutes`);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert('Please login first');
        setLoading(false);
        return;
      }

      const response = await axios.put(`${API_BASE}/stop/${activeTracking._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setActiveTracking(null);
        setCurrentTime(0);
        fetchTimeHistory();
        fetchTimeStats();
        alert('Time tracking stopped successfully!');
      } else {
        alert(response.data.message || 'Error stopping time tracking');
      }
    } catch (error) {
      console.error('Error stopping time tracking:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error stopping time tracking';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Time Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track time spent on your tasks
          </p>
          
          {/* Backend Status Indicator */}
          <div className={`mt-2 p-2 rounded-lg text-sm ${
            backendAvailable 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800' 
              : 'bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 border border-orange-200 dark:border-orange-800'
          }`}>
            {backendAvailable ? '🟢 Backend Connected' : '🟠 Local Mode (Backend Unavailable)'}
          </div>
          
          {tasks.filter(task => !task.completed).length === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200">
                No pending tasks available. Create some tasks first to track time.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Time Tracker */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Timer */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                <Timer className="w-5 h-5 text-purple-500" />
                Active Timer
              </h2>

              {activeTracking ? (
                <div className="text-center">
                  <div className="mb-4">
                    <div className="text-4xl font-mono font-bold text-purple-600 dark:text-purple-400 mb-2">
                      {formatTime(currentTime)}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {activeTracking.task?.title || 'Unknown Task'}
                    </p>
                    {activeTracking.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        {activeTracking.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={stopTracking}
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      <Square className="w-4 h-4" />
                      Stop
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mb-4">
                    <div className="text-4xl font-mono font-bold text-gray-400 mb-2">
                      00:00
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      No active timer
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Task
                      </label>
                      <select
                        value={selectedTask}
                        onChange={(e) => setSelectedTask(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Choose a task...</option>
                        {tasks.filter(task => !task.completed).map(task => (
                          <option key={task._id} value={task._id}>
                            {task.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description (Optional)
                      </label>
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What are you working on?"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    
                    <button
                      onClick={startTracking}
                      disabled={loading || !selectedTask}
                      className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 mx-auto"
                    >
                      <Play className="w-4 h-4" />
                      Start Timer
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Time History */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-500" />
                Recent Sessions
              </h2>

              <div className="space-y-3">
                {timeHistory.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No time tracking sessions yet
                  </p>
                ) : (
                  timeHistory.slice(0, 10).map((session) => (
                    <div
                      key={session._id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {session.task?.title || 'Unknown Task'}
                        </p>
                        {session.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {session.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {new Date(session.startTime).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-purple-600 dark:text-purple-400">
                          {formatDuration(session.duration)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="space-y-6">
            {timeStats && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                  Statistics
                </h2>

                <div className="space-y-4">
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {formatDuration(timeStats.totalTime)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total Time Tracked
                    </p>
                  </div>

                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {timeStats.totalSessions}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total Sessions
                    </p>
                  </div>

                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatDuration(timeStats.avgSessionTime)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Avg Session Time
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                Quick Actions
              </h2>

              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors">
                  <div className="font-medium text-gray-800 dark:text-gray-200">
                    View Detailed Reports
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    See comprehensive time analytics
                  </div>
                </button>

                <button className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors">
                  <div className="font-medium text-gray-800 dark:text-gray-200">
                    Export Data
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Download time tracking data
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeTracker;



