import React, { useContext, useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import { UserContext } from '../../context/userContext';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apiPaths';
import { useNavigate } from 'react-router-dom';
import { IoAddCircle, IoFilter, IoDownload } from 'react-icons/io5';
import { STATUS_DATA } from '../../utils/data';
import TaskListTable from '../../components/TaskListTable';
import InfoCard from '../../components/Cards/infoCard';
import { 
  IoStatsChart, 
  IoListCircle, 
  IoHourglass, 
  IoCheckmarkCircle 
} from 'react-icons/io5';
import { addThousandsSeparator } from '../../utils/helper';

const ManageTasks = () => {
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
      console.error('❌ Error fetching tasks:', error);
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

  const handleExportTasks = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.REPORTS.EXPORT_TASKS, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'tasks_report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('❌ Error exporting tasks:', error);
      alert('Failed to export tasks');
    }
  };

  const handleCreateTask = () => {
    navigate('/admin/create-task');
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await axiosInstance.delete(API_PATHS.TASKS.DELETE_TASK(taskId));
      fetchTasks(statusFilter);
      alert('Task deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting task:', error);
      alert('Failed to delete task');
    }
  };

  return (
    <DashboardLayout activeMenu="Manage Tasks">
      <div className="card my-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Manage Tasks</h2>
            <p className="text-sm text-gray-500 mt-1">
              View, filter, and manage all tasks
            </p>
          </div>
          
          <div className="flex gap-3">
            {user?.role === 'admin' && (
              <>
                <button
                  onClick={handleExportTasks}
                  className="btn-secondary flex items-center gap-2"
                >
                  <IoDownload /> Export
                </button>
                <button
                  onClick={handleCreateTask}
                  className="btn-primary flex items-center gap-2"
                >
                  <IoAddCircle /> Create Task
                </button>
              </>
            )}
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
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageTasks;