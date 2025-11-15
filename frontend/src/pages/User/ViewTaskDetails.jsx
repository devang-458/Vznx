import React, { useContext, useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import { UserContext } from '../../context/userContext';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apiPaths';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import {
  IoArrowBack,
  IoCalendarOutline,
  IoPersonOutline,
  IoCheckmarkCircle,
  IoAttach,
  IoDownload,
  IoAlertCircle
} from 'react-icons/io5';

const ViewTaskDetails = () => {
  useUserAuth();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { id } = useParams();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user && id) {
      fetchTaskDetails();
    }
  }, [user, id]);

  const fetchTaskDetails = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_TASK_BY_ID(id));
      setTask(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching task details:', error);
      setError('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleTodoToggle = async (todoIndex) => {
    if (!task) return;

    const updatedChecklist = task.todoChecklist.map((item, index) =>
      index === todoIndex ? { ...item, completed: !item.completed } : item
    );

    setUpdating(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await axiosInstance.put(API_PATHS.TASKS.UPDATE_TODO_CHECKLIST(id), {
        todoChecklist: updatedChecklist
      });
      
      setTask(response.data);
      setSuccessMessage('Checklist updated successfully!');
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating checklist:', error);
      setError('Failed to update checklist');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    setError('');
    setSuccessMessage('');
    
    try {
      await axiosInstance.put(API_PATHS.TASKS.UPDATE_TASK_STATUS(id), {
        status: newStatus
      });
      
      setTask(prev => ({ ...prev, status: newStatus }));
      setSuccessMessage('Status updated successfully!');
      
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Refresh task details to get updated progress
      fetchTaskDetails();
    } catch (error) {
      console.error(' Error updating status:', error);
      setError('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-500';
      case 'In Progress': return 'bg-cyan-500';
      case 'Pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const isOverdue = task && new Date(task.dueDate) < new Date() && task.status !== 'Completed';

  if (loading) {
    return (
      <DashboardLayout activeMenu="Manage Tasks">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-2">Loading task details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !task) {
    return (
      <DashboardLayout activeMenu="Manage Tasks">
        <div className="my-5">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center gap-2">
            <IoAlertCircle className="text-xl" />
            {error || 'Task not found'}
          </div>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center gap-2"
          >
            <IoArrowBack /> Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const progress = task?.progress || 0;
  const completedTodos = task?.todoChecklist?.filter(item => item.completed).length || 0;
  const totalTodos = task?.todoChecklist?.length || 0;

  return (
    <DashboardLayout activeMenu="Manage Tasks">
      <div className="my-5 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center gap-2 mb-4"
          >
            <IoArrowBack /> Back
          </button>
          
          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
              <IoCheckmarkCircle className="text-xl" />
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
              <IoAlertCircle className="text-xl" />
              {error}
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{task?.title}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-3 py-1 rounded-full border ${getPriorityColor(task?.priority)}`}>
                    {task?.priority} Priority
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full text-white ${getStatusColor(task?.status)}`}>
                    {task?.status}
                  </span>
                  {isOverdue && (
                    <span className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-800 border border-red-300 flex items-center gap-1">
                      <IoAlertCircle /> Overdue
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Status Update */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Status
              </label>
              <select
                value={task?.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updating}
                className="w-full md:max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Description */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600 text-sm whitespace-pre-wrap">{task?.description}</p>
            </div>

            {/* Progress Bar */}
            {totalTodos > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">Progress</h3>
                  <span className="text-sm font-semibold text-gray-700">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${getStatusColor(task?.status)}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <IoCheckmarkCircle />
                  {completedTodos} of {totalTodos} tasks completed
                </p>
              </div>
            )}

            {/* Meta Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b">
              <div className="flex items-start gap-3">
                <IoCalendarOutline className="text-2xl text-gray-500 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Due Date</p>
                  <p className={`text-sm ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                    {moment(task?.dueDate).format('MMMM DD, YYYY')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {moment(task?.dueDate).fromNow()}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <IoPersonOutline className="text-2xl text-gray-500 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Assigned To</p>
                  <p className="text-sm text-gray-600">
                    {task?.assignedTo?.length || 0} team member{task?.assignedTo?.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Assigned Members */}
            {task?.assignedTo && task.assignedTo.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Team Members</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {task.assignedTo.map((member) => (
                    <div key={member._id} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                      <img
                        src={member.profileImageUrl || '/default-avatar.png'}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{member.name}</p>
                        <p className="text-xs text-gray-500 truncate">{member.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments */}
            {task?.attachments && task.attachments.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <IoAttach /> Attachments ({task.attachments.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {task.attachments.map((attachment, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <img
                        src={attachment}
                        alt={`Attachment ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <a
                        href={attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 p-2 bg-gray-50 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <IoDownload /> Download
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Todo Checklist */}
            {task?.todoChecklist && task.todoChecklist.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Todo Checklist
                  {totalTodos > 0 && (
                    <span className="ml-2 text-xs font-normal text-gray-500">
                      ({completedTodos}/{totalTodos} completed)
                    </span>
                  )}
                </h3>
                <div className="space-y-2">
                  {task.todoChecklist.map((item, index) => (
                    <label
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        item.completed
                          ? 'bg-green-50 border-green-200 hover:bg-green-100'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleTodoToggle(index)}
                        disabled={updating}
                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <span
                        className={`flex-1 text-sm ${
                          item.completed ? 'line-through text-gray-500' : 'text-gray-700'
                        }`}
                      >
                        {item.text}
                      </span>
                      {item.completed && (
                        <IoCheckmarkCircle className="text-green-500 text-xl" />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ViewTaskDetails;