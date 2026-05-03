import React, { useContext, useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import { UserContext } from '../../context/userContext';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apiPaths';
import moment from 'moment';
import { addThousandsSeparator } from '../../utils/helper';

import {
  IoStatsChart,
  IoListCircle,
  IoHourglass,
  IoCheckmarkCircle
} from "react-icons/io5";
import { LuSquareArrowRight, LuCirclePlus, LuMessageCircle, LuUsers, LuBell, LuTrendingUp, LuCalendar, LuSparkles } from 'react-icons/lu';
import { FiZap } from 'react-icons/fi';

import { useNavigate } from 'react-router-dom';
import TaskListTable from '../../components/TaskListTable';
import CustomPieChart from '../../components/Charts/CustomPieChart';
import CustomBarChart from '../../components/Charts/CustomBarChart';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/layouts/Button';
import useFetchData from '../../hooks/useFetchData';

const COLORS = ["#2563eb", "#f59e0b", "#0891b2", "#10b981"];

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

  const { data: dashboardData, loading, error, fetchData: refetchDashboardData } = useFetchData(
    user ? API_PATHS.TASKS.GET_DASHBOARD_DATA : null,
    { skip: !user }
  );

  const { data: insightsData, loading: insightsLoading, error: insightsError } = useFetchData(
    user ? API_PATHS.ANALYTICS.GET_INSIGHTS : null,
    { skip: !user, initialData: [] }
  );

  const { data: projectsData, loading: projectsLoading, error: projectsError } = useFetchData(
    user ? API_PATHS.PROJECTS.GET_ALL_PROJECTS : null,
    { skip: !user, initialData: [] }
  );

  const [pieChartData, setPieChartData] = useState([]);
  const [filter, setFilter] = useState({ status: 'all' });
  const [modalTask, setModalTask] = useState(null);
  const [fabOpen, setFabOpen] = useState(false);

  useEffect(() => {
    if (dashboardData) {
      const normalized = {
        charts: dashboardData?.charts || {
          taskDistribution: dashboardData?.taskDistribution || {},
          taskPriorityLevels: dashboardData?.taskPriorityLevels || {}
        },
        recentTasks: dashboardData?.recentTasks || []
      };

      setPieChartData([
        { name: "Pending", value: normalized.charts.taskDistribution?.Pending || 0 },
        { name: "In Progress", value: normalized.charts.taskDistribution["In Progress"] || normalized.charts.taskDistribution?.InProgress || 0 },
        { name: "Completed", value: normalized.charts.taskDistribution?.Completed || 0 }
      ]);
    }
  }, [dashboardData]);

  const createTask = () => {
    if (user?.role === "admin") {
      navigate("/admin/create-task");
    } else {
      navigate("/user/create-task");
    }
  };

  const totals = dashboardData?.charts?.taskDistribution || {};
  const totalAll = (totals.Pending || 0) + (totals["In Progress"] || totals.InProgress || 0) + (totals.Completed || 0);
  
  const potentialOverdue = useMemo(() => predictPotentiallyOverdue(dashboardData?.recentTasks || []), [dashboardData]);

  const filteredTasks = useMemo(() => {
    if (!dashboardData?.recentTasks) return [];
    let list = [...dashboardData.recentTasks];
    if (filter.status !== "all") {
      list = list.filter(t => t.status === filter.status);
    }
    return list;
  }, [dashboardData, filter]);

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="min-h-screen bg-slate-50 p-6 md:p-10 space-y-10">
        
        {/* TOP BAR */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              {moment().format("dddd, MMMM D, YYYY")}
            </p>
          </div>

          <div className="flex items-center gap-3">
             <button 
                onClick={refetchDashboardData}
                className="text-xs font-semibold text-slate-500 hover:text-blue-600 px-3 py-1.5 rounded-lg transition"
             >
                Refresh
             </button>
            <Button variant="primary" className="rounded-xl px-5 shadow-sm text-sm" onClick={createTask}>
              + Create Task
            </Button>
          </div>
        </header>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* STATS */}
          <div className="md:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="All Tasks" value={totalAll} icon={<IoStatsChart />} />
            <StatCard label="Pending" value={totals.Pending || 0} icon={<IoListCircle />} />
            <StatCard label="Working" value={totals["In Progress"] || totals.InProgress || 0} icon={<IoHourglass />} />
            <StatCard label="Completed" value={totals.Completed || 0} icon={<IoCheckmarkCircle />} />
          </div>

          {/* AI WIDGET */}
          <div className="md:col-span-4 row-span-2">
            <div className="bg-slate-900 rounded-3xl p-8 text-white h-full relative overflow-hidden shadow-xl">
               <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-white/10 rounded-xl">
                      <LuSparkles className="text-sky-400" size={20} />
                    </div>
                    <span className="font-semibold text-sm tracking-wide">AI Assistant</span>
                  </div>
                  
                  {insightsLoading ? (
                    <div className="flex-1 text-slate-400 text-sm">Analyzing current workload...</div>
                  ) : insightsData?.[0] ? (
                    <div className="space-y-4 flex-1">
                      <p className="text-base leading-relaxed text-slate-200">"{insightsData[0].insightText}"</p>
                      <div className="text-xs text-sky-200/80 bg-white/5 p-4 rounded-xl border border-white/5">
                        Suggested priority: <span className="text-white font-semibold">{insightsData[0].projectId?.name || "High Priority"}</span>
                      </div>
                    </div>
                  ) : (
                     <p className="text-slate-400 text-sm flex-1">No actionable insights yet.</p>
                  )}

                  <Button 
                    variant="ghost" 
                    className="mt-6 bg-white/5 hover:bg-white/10 text-white w-full rounded-xl text-xs font-semibold py-3"
                    onClick={() => navigate('/admin/insights')}
                  >
                    View Analytics
                  </Button>
               </div>
            </div>
          </div>

          {/* DISTRIBUTION */}
          <div className="md:col-span-4 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <h5 className="font-bold text-slate-900 text-sm mb-8">Task Status Distribution</h5>
            <div className="h-56 flex items-center justify-center">
              <CustomPieChart data={pieChartData} colors={COLORS} />
            </div>
          </div>

          {/* RECENT PROJECTS */}
          <div className="md:col-span-4 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
             <div className="flex justify-between items-center mb-8">
              <h5 className="font-bold text-slate-900 text-sm">Recent Projects</h5>
              <button className="text-xs font-bold text-blue-600" onClick={() => navigate('/admin/projects')}>View All</button>
            </div>
            
            <div className="space-y-5">
              {projectsLoading ? (
                [1,2].map(i => <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse"></div>)
              ) : projectsData.slice(0, 3).map((project) => (
                <div key={project._id} className="flex items-center justify-between group cursor-pointer" onClick={() => navigate(`/admin/projects/${project._id}/kanban`)}>
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                        {project.name.charAt(0)}
                     </div>
                     <div>
                       <p className="font-semibold text-slate-900 text-sm">{project.name}</p>
                       <p className="text-[11px] text-slate-400 font-medium">Updated {moment(project.updatedAt).fromNow()}</p>
                     </div>
                  </div>
                  <LuSquareArrowRight className="text-slate-300 group-hover:text-blue-600" />
                </div>
              ))}
            </div>
          </div>

          {/* TABLE */}
          <div className="md:col-span-12 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h5 className="font-bold text-slate-900 text-sm">Recent Deliverables</h5>
              <select className="bg-slate-50 border-none text-xs font-semibold text-slate-600 rounded-lg px-3 py-1.5" value={filter.status} onChange={(e) => setFilter({ status: e.target.value })}>
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="InProgress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <TaskListTable tableData={filteredTasks.slice(0, 5)} onRowClick={task => setModalTask(task)} />
          </div>

        </div>

      </div>
    </DashboardLayout >
  );
};

const StatCard = ({ label, value, icon }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
    <div className="text-slate-400 mb-4">{React.cloneElement(icon, { size: 24 })}</div>
    <div>
        <p className="text-3xl font-extrabold text-slate-900">{addThousandsSeparator(value)}</p>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">{label}</p>
    </div>
  </div>
);

export default Dashboard;
