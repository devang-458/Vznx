import React, { useContext, useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import { UserContext } from '../../context/userContext';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apiPaths';
import moment from 'moment';
import InfoCard from '../../components/Cards/InfoCard';
import { addThousandsSeparator } from '../../utils/helper';

import {
  IoStatsChart,
  IoListCircle,
  IoHourglass,
  IoCheckmarkCircle
} from "react-icons/io5";
import { LuSquareArrowRight, LuCirclePlus } from 'react-icons/lu';
import { FiZap } from 'react-icons/fi';

import { useNavigate } from 'react-router-dom';
import TaskListTable from '../../components/TaskListTable';
import CustomPieChart from '../../components/Charts/CustomPieChart';
import CustomBarChart from '../../components/Charts/CustomBarChart';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ["#3B82F6", "#F59E0B", "#06B6D4", "#10B981"];

// Predict overdue tasks (3-day window)
const predictPotentiallyOverdue = (tasks = []) => {
  const now = moment();
  return tasks.filter(t => {
    if (!t?.dueDate) return false;
    if (t.status === 'Completed') return false;
    const diff = moment(t.dueDate).diff(now, 'days');
    return diff >= 0 && diff <= 3;
  });
};

const Dashboard = () => {
  useUserAuth();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [dashboardData, setDashboardData] = useState(null);
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);
  const [filter, setFilter] = useState({ status: 'all', mineOnly: false });
  const [modalTask, setModalTask] = useState(null);
  const [fabOpen, setFabOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load dashboard data
  const getDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axiosInstance.get(API_PATHS.TASKS.GET_DASHBOARD_DATA);

      const normalized = {
        charts: res.data?.charts || {
          taskDistribution: res.data?.taskDistribution || {},
          taskPriorityLevels: res.data?.taskPriorityLevels || {}
        },
        recentTasks: res.data?.recentTasks || []
      };

      setDashboardData(normalized);

      setPieChartData([
        { name: "Pending", value: normalized.charts.taskDistribution?.Pending || 0 },
        { name: "In Progress", value: normalized.charts.taskDistribution["In Progress"] || normalized.charts.taskDistribution?.InProgress || 0 },
        { name: "Completed", value: normalized.charts.taskDistribution?.Completed || 0 }
      ]);

      setBarChartData([
        { name: "Low", value: normalized.charts.taskPriorityLevels?.Low || 0 },
        { name: "Medium", value: normalized.charts.taskPriorityLevels?.Medium || 0 },
        { name: "High", value: normalized.charts.taskPriorityLevels?.High || 0 }
      ]);

    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data.");
    }

    setLoading(false);
  };

  useEffect(() => {
    if (user) getDashboardData();
  }, [user]);

  // New Task button logic
  const createTask = () => {
    if (user?.role === "admin") {
      navigate("/tasks/create");
    } else {
      navigate("/tasks/create");
    }
  };

  const totals = dashboardData?.charts?.taskDistribution || {};
  const totalAll = (totals.Pending || 0) + (totals["In Progress"] || totals.InProgress || 0) + (totals.Completed || 0);
  const completionRate = totalAll ? Math.round((totals.Completed / totalAll) * 100) : 0;

  const potentialOverdue = useMemo(() => predictPotentiallyOverdue(dashboardData?.recentTasks || []), [dashboardData]);

  // Filtered task list
  const filteredTasks = useMemo(() => {
    if (!dashboardData?.recentTasks) return [];

    let list = [...dashboardData.recentTasks];

    if (filter.status !== "all") {
      list = list.filter(t => t.status === filter.status);
    }

    if (filter.mineOnly && user) {
      list = list.filter(t => t?.assignedTo?._id === user?._id);
    }

    return list;
  }, [dashboardData, filter, user]);

  // Modal component
  const TaskModal = ({ task, onClose }) => {
    if (!task) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black bg-opacity-40"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold">{task.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{task.description}</p>

            <div className="mt-4 flex gap-3 text-xs">
              <div className="px-2 py-1 rounded bg-gray-200">Status: {task.status}</div>
              <div className="px-2 py-1 rounded bg-gray-200">Priority: {task.priority}</div>
              <div className="px-2 py-1 rounded bg-gray-200">Due: {moment(task.dueDate).format("MMM D")}</div>
            </div>

            <button
              className="btn-primary mt-5"
              onClick={() => navigate(`/tasks/${task._id}`)}
            >
              Open Task
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="min-h-screen bg-gray-50 p-6 md:p-10">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">
              Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
            </h1>
            <p className="text-sm text-gray-600">
              {moment().format("dddd, Do MMM YYYY")}
            </p>

            {potentialOverdue.length > 0 && (
              <div className="mt-3 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
                <FiZap />
                {potentialOverdue.length} task(s) might miss deadline
              </div>
            )}
          </div>

          {/* Filter + New Task */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border rounded-full px-3 py-1 shadow-sm">
              <select
                className="text-sm outline-none"
                value={filter.status}
                onChange={(e) => setFilter(f => ({ ...f, status: e.target.value }))}
              >
                <option value="all">All statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <label className="flex items-center gap-2 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={filter.mineOnly}
                  onChange={(e) => setFilter(f => ({ ...f, mineOnly: e.target.checked }))}
                />
                My tasks only
              </label>
            </div>

            <button className="btn-primary" onClick={createTask}>
              + New Task
            </button>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 mt-8">
          <InfoCard icon={<IoStatsChart />} label="Total" value={totalAll} color="bg-blue-500" />
          <InfoCard icon={<IoListCircle />} label="Pending" value={totals.Pending || 0} color="bg-yellow-400" />
          <InfoCard icon={<IoHourglass />} label="In Progress" value={totals["In Progress"] || totals.InProgress || 0} color="bg-cyan-400" />
          <InfoCard icon={<IoCheckmarkCircle />} label="Completed" value={totals.Completed || 0} color="bg-green-400" />
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h5 className="font-medium">Task Distribution</h5>
            <CustomPieChart data={pieChartData} colors={COLORS} />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h5 className="font-medium">Priority Levels</h5>
            <CustomBarChart data={barChartData} />
          </div>

          {/* RECENT TASKS */}
          <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h5 className="font-medium">Recent Tasks</h5>
              <button className="text-sm text-blue-600" onClick={getDashboardData}>
                Refresh
              </button>
            </div>

            <TaskListTable tableData={filteredTasks} onRowClick={task => setModalTask(task)} />
          </div>
        </div>

        {/* FLOATING CREATE BUTTON */}
        <div className="fixed right-6 bottom-6 z-50">
          <button
            onClick={() => setFabOpen(prev => !prev)}
            className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg grid place-items-center"
          >
            <LuCirclePlus size={22} />
          </button>

          {fabOpen && (
            <div className="absolute bottom-20 right-0 bg-white shadow-xl rounded-xl p-3 w-48">
              <button
                className="flex items-center gap-2 py-2"
                onClick={() => navigate("/tasks/create")}
              >
                <LuCirclePlus /> Create Task
              </button>
            </div>
          )}
        </div>

        <TaskModal task={modalTask} onClose={() => setModalTask(null)} />

        {error && <p className="text-red-600 mt-4">{error}</p>}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
