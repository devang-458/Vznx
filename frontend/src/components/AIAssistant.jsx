import React, { useState } from 'react';
import { IoSparkles, IoClose } from 'react-icons/io5';
import axiosInstance from '../../utils/axiosinstance';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('breakdown');
  
  // Tab: Breakdown
  const [breakdownInput, setBreakdownInput] = useState({
    taskTitle: '',
    taskDescription: ''
  });
  const [breakdownResult, setBreakdownResult] = useState(null);

  // Tab: Schedule
  const [scheduleInput, setScheduleInput] = useState({
    taskPriority: 'medium',
    estimatedHours: 8,
    assignedTo: []
  });
  const [scheduleResult, setScheduleResult] = useState(null);

  // Tab: Assignee
  const [assigneeInput, setAssigneeInput] = useState({
    taskId: ''
  });
  const [assigneeResult, setAssigneeResult] = useState(null);

  const handleTaskBreakdown = async () => {
    if (!breakdownInput.taskTitle.trim()) {
      alert('Please enter a task title');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post('/api/ai/suggest-breakdown', breakdownInput);
      setBreakdownResult(response.data.data);
    } catch (error) {
      alert('Error generating breakdown: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSmartSchedule = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/api/ai/smart-schedule', scheduleInput);
      setScheduleResult(response.data.data);
    } catch (error) {
      alert('Error generating schedule: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestAssignee = async () => {
    if (!assigneeInput.taskId.trim()) {
      alert('Please enter a task ID');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post('/api/ai/suggest-assignee', assigneeInput);
      setAssigneeResult(response.data.data);
    } catch (error) {
      alert('Error getting suggestions: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-500 text-white rounded-full cursor-pointer shadow-lg flex items-center justify-center transition-all duration-300 ease-in-out z-40 hover:scale-110 hover:shadow-2xl active:scale-95"
        title="AI Assistant"
      >
        <IoSparkles className="text-2xl" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl w-11/12 max-w-lg max-h-[90vh] flex flex-col animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center gap-2">
                <IoSparkles className="text-xl text-purple-600" />
                <h2 className="text-xl font-bold">AI Assistant</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <IoClose className="text-2xl" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50 px-5 gap-2 overflow-x-auto">
              {[
                { id: 'breakdown', label: '📋 Break Down Task' },
                { id: 'schedule', label: '📅 Smart Schedule' },
                { id: 'assignee', label: '👥 Find Assignee' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 ease-in-out ${activeTab === tab.id ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-purple-600'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* Tab: Task Breakdown */}
              {activeTab === 'breakdown' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Task Title</label>
                    <input
                      type="text"
                      value={breakdownInput.taskTitle}
                      onChange={(e) => setBreakdownInput({ ...breakdownInput, taskTitle: e.target.value })}
                      placeholder="e.g., Build authentication system"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Description (optional)</label>
                    <textarea
                      value={breakdownInput.taskDescription}
                      onChange={(e) => setBreakdownInput({ ...breakdownInput, taskDescription: e.target.value })}
                      placeholder="Add more context..."
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>

                  <button
                    onClick={handleTaskBreakdown}
                    disabled={loading}
                    className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
                  >
                    {loading ? 'Analyzing...' : 'Generate Breakdown'}
                  </button>

                  {breakdownResult && (
                    <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                      <h3 className="font-semibold mb-3">Suggested Subtasks:</h3>
                      <ul className="space-y-2 mb-3">
                        {breakdownResult.suggestedSubtasks.map((subtask, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-purple-600 font-bold">•</span>
                            <span className="text-sm">{subtask}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="text-sm text-gray-700 space-y-1">
                        <p><strong>Estimated Duration:</strong> {breakdownResult.estimatedDuration}</p>
                        <p><strong>Difficulty:</strong> {breakdownResult.difficulty}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Smart Schedule */}
              {activeTab === 'schedule' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Priority Level</label>
                    <select
                      value={scheduleInput.taskPriority}
                      onChange={(e) => setScheduleInput({ ...scheduleInput, taskPriority: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="critical">🔴 Critical</option>
                      <option value="high">🟠 High</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="low">🟢 Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Estimated Hours</label>
                    <input
                      type="number"
                      value={scheduleInput.estimatedHours}
                      onChange={(e) => setScheduleInput({ ...scheduleInput, estimatedHours: parseInt(e.target.value) || 0 })}
                      min="1"
                      max="168"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <button
                    onClick={handleSmartSchedule}
                    disabled={loading}
                    className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
                  >
                    {loading ? 'Calculating...' : 'Suggest Schedule'}
                  </button>

                  {scheduleResult && (
                    <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-3">{scheduleResult.reasoning}</p>
                      <div className="bg-white p-3 rounded-lg mb-3 border-l-4 border-purple-600">
                        <p className="text-sm font-medium">Recommended Due Date:</p>
                        <p className="text-lg font-bold text-purple-600">
                          {new Date(scheduleResult.suggestedDueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600">Working days needed: {scheduleResult.workingDaysEstimate}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Suggest Assignee */}
              {activeTab === 'assignee' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Task ID</label>
                    <input
                      type="text"
                      value={assigneeInput.taskId}
                      onChange={(e) => setAssigneeInput({ ...assigneeInput, taskId: e.target.value })}
                      placeholder="Paste task ID"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <button
                    onClick={handleSuggestAssignee}
                    disabled={loading}
                    className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
                  >
                    {loading ? 'Analyzing...' : 'Get Suggestions'}
                  </button>

                  {assigneeResult && (
                    <div className="mt-4 space-y-3">
                      <div className="p-3 bg-green-50 border-l-4 border-green-600 rounded-lg">
                        <p className="text-xs text-green-600 mb-1">RECOMMENDED</p>
                        <p className="font-semibold text-sm">{assigneeResult.suggestedAssignee.name}</p>
                        <p className="text-xs text-gray-600">{assigneeResult.suggestedAssignee.reason}</p>
                        <p className="text-xs text-green-600 mt-1">Confidence: {Math.round(assigneeResult.suggestedAssignee.confidence * 100)}%</p>
                      </div>

                      {assigneeResult.alternatives.map((alt, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                          <p className="font-semibold text-sm">{alt.name}</p>
                          <p className="text-xs text-gray-600">{alt.workloadPercentage}% workload</p>
                        </div>
                      ))}

                      <p className="text-xs text-gray-500 mt-2">
                        Team average workload: {assigneeResult.teamMetrics.averageWorkload}%
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
