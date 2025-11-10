import React, { useContext, useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import { UserContext } from '../../context/userContext';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apiPaths';
import { useNavigate } from 'react-router-dom';
import { IoFilter, IoEye } from 'react-icons/io5';
import { STATUS_DATA } from '../../utils/data';
import InfoCard from '../../components/Cards/InfoCard';
import {
  IoStatsChart,
  IoListCircle,
  IoHourglass,
  IoCheckmarkCircle
} from 'react-icons/io5';
import { addThousandsSeparator } from '../../utils/helper';
import TaskCard from '../../components/Cards/TaskCard';

const MyTasks = () => {
  useUserAuth();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusSummary, setStatusSummary] = useState({
    all: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0
  });

  const fetchTasks = async (status = '') => {
    setLoading(true);
    try {
      const url = status
        ? `${API_PATHS.TASKS.GET_ALL_TASKS}?status=${status}`
        : API_PATHS.TASKS.GET_ALL_TASKS;

      const response = await axiosInstance.get(url);

      setTasks(response.data.tasks || []);
      setFilteredTasks(response.data.tasks || []);
      setStatusSummary(response.data.statusSummary || statusSummary);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    fetchTasks(status);
  };

  const handleViewTask = (taskId) => {
    navigate(`/user/tasks/${taskId}`);
  };

  return (
    <DashboardLayout activeMenu="Manage Tasks">
      <div className="card my-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-semibold">My Tasks</h2>
            <p className="text-sm text-gray-500 mt-1">
              View and manage your assigned tasks
            </p>
          </div>
        </div>

        {/* Status Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <InfoCard
            icon={<IoStatsChart />}
            label="Total Tasks"
            value={addThousandsSeparator(statusSummary.all)}
            color="bg-blue-500"
          />
          <InfoCard
            icon={<IoListCircle />}
            label="Pending"
            value={addThousandsSeparator(statusSummary.pendingTasks)}
            color="bg-yellow-500"
          />
          <InfoCard
            icon={<IoHourglass />}
            label="In Progress"
            value={addThousandsSeparator(statusSummary.inProgressTasks)}
            color="bg-cyan-500"
          />
          <InfoCard
            icon={<IoCheckmarkCircle />}
            label="Completed"
            value={addThousandsSeparator(statusSummary.completedTasks)}
            color="bg-green-500"
          />
        </div>

        {/* Filter Section */}
        <div className="flex items-center gap-3 mb-4">
          <IoFilter className="text-gray-500 text-xl" />
          <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
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

        {/* Tasks Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-500 mt-2">Loading tasks...</p>
            </div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl text-gray-300 mb-4">📋</div>
            <p className="text-gray-500 text-lg">No tasks found</p>
            <p className="text-gray-400 text-sm mt-2">
              {statusFilter ? 'Try changing the filter' : 'You have no tasks assigned yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onClick={() => handleViewTask(task._id)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyTasks;