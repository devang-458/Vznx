import React, { useContext, useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import TaskListTable from '../../components/TaskListTable';
import { useUserAuth } from '../../hooks/useUserAuth';
import { UserContext } from '../../context/userContext';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apiPaths';
import { STATUS_DATA } from '../../utils/data';
import { IoAddCircle } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

const ManageTasks = () => {
  useUserAuth();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS);
      // Backend returns { tasks, statusSummary } object
      const tasksArray = response.data?.tasks || response.data || [];
      setTasks(Array.isArray(tasksArray) ? tasksArray : []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axiosInstance.delete(API_PATHS.TASKS.DELETE_TASK(taskId));
        setTasks(tasks.filter(task => task._id !== taskId));
        alert('Task deleted successfully!');
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task');
      }
    }
  };

  // Filter tasks based on search term and status
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout activeMenu="Manage Tasks">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Manage Tasks</h1>
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin/create-task')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
              >
                <IoAddCircle /> Create Task
              </button>
            )}
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <input
                type="text"
                placeholder="Search tasks by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field flex-1"
              />

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field max-w-xs"
              >
                <option value="">All Tasks</option>
                {STATUS_DATA.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tasks Table */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">Loading tasks...</p>
            </div>
          ) : (
            <TaskListTable
              tableData={filteredTasks}
              onDelete={user?.role === 'admin' ? handleDeleteTask : undefined}
              showActions={true}
              userRole={user?.role}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManageTasks;
