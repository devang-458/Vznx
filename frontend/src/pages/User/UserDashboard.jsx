import React, { useContext, useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { useUserAuth } from '../../hooks/useUserAuth'
import { UserContext } from '../../context/userContext'
import axiosInstance from '../../utils/axiosinstance'
import { API_PATHS } from '../../utils/apiPaths'
import moment from 'moment'
import { addThousandsSeparator } from '../../utils/helper'
import {
  IoStatsChart,
  IoListCircle,
  IoHourglass,
  IoCheckmarkCircle
} from 'react-icons/io5'
import { LuSquareArrowRight, LuCirclePlus, LuMessageCircle, LuCalendar, LuTrendingUp, LuSparkles, LuBell } from 'react-icons/lu'
import { FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import TaskListTable from '../../components/TaskListTable'
import CustomPieChart from '../../components/Charts/CustomPieChart'
import CustomBarChart from '../../components/Charts/CustomBarChart'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../../components/layouts/Button'
import useFetchData from '../../hooks/useFetchData'

const COLORS = ["#3B82F6", "#F59E0B", "#06B6D4", "#10B981"]

// Helper: turn various API shapes into a predictable normalized object
const normalizeDashboardResponse = (resp) => {
  if (!resp) return { charts: { taskDistribution: {}, taskPriorityLevels: {} }, recentTasks: [] }
  const charts = resp.charts || resp
  const taskDistribution = charts.taskDistribution || resp.taskDistribution || charts.task_distribution || {}
  const taskPriorityLevels = charts.taskPriorityLevels || resp.taskPriorityLevels || charts.taskPriority_levels || charts.priorityLevels || {}
  const recentTasks = resp.recentTasks || resp.tasks || resp.recent_tasks || []
  return { charts: { taskDistribution, taskPriorityLevels }, recentTasks }
}

const predictPotentiallyOverdue = (tasks = []) => {
  const now = moment()
  return tasks.filter(t => {
    if (!t?.dueDate) return false
    if (t.status === 'Completed') return false
    const diffDays = moment(t.dueDate).diff(now, 'days')
    return diffDays >= 0 && diffDays <= 3
  })
}

const UserDashboard = () => {
  useUserAuth()
  const navigate = useNavigate()
  const { user } = useContext(UserContext)

  const { data: dashboardData, loading, error, fetchData: refetchDashboardData } = useFetchData(
    user ? API_PATHS.TASKS.GET_USER_DASHBOARD_DATA : null,
    { skip: !user }
  );

  const { data: projectsData, loading: projectsLoading, error: projectsError } = useFetchData(
    user ? API_PATHS.PROJECTS.GET_ALL_PROJECTS : null,
    { skip: !user, initialData: [] }
  );

  const [pieChartData, setPieChartData] = useState([])
  const [barChartData, setBarChartData] = useState([])
  const [fabOpen, setFabOpen] = useState(false)
  const [filter, setFilter] = useState({ status: 'all', mineOnly: false })
  const [modalTask, setModalTask] = useState(null)

  const prepareChartData = (data) => {
    const normalized = data?.charts || data || {}
    const dist = normalized.taskDistribution || {}
    const prio = normalized.taskPriorityLevels || {}

    const taskDistributionData = [
      { name: 'Pending', value: dist.Pending || dist.pending || dist.totalPending || 0 },
      { name: 'In Progress', value: dist.InProgress || dist['In Progress'] || dist.in_progress || 0 },
      { name: 'Completed', value: dist.Completed || dist.completed || 0 }
    ]

    const priorityLevelData = [
      { name: 'Low', value: prio.Low || prio.low || prio.lowCount || 0 },
      { name: 'Medium', value: prio.Medium || prio.medium || prio.mid || 0 },
      { name: 'High', value: prio.High || prio.high || prio.highCount || 0 }
    ]

    setPieChartData(taskDistributionData)
    setBarChartData(priorityLevelData)
  }

  useEffect(() => {
    if (dashboardData) {
      const normalized = normalizeDashboardResponse(dashboardData);
      prepareChartData(normalized.charts);
    }
  }, [dashboardData]);

  const totals = dashboardData?.charts?.taskDistribution || {}
  const totalAll = totals?.All || ((totals.Pending || 0) + (totals.InProgress || 0) + (totals.Completed || 0))
  
  const potentialOverdue = useMemo(() => predictPotentiallyOverdue(dashboardData?.recentTasks || []), [dashboardData])

  const filteredTasks = useMemo(() => {
    if (!dashboardData?.recentTasks) return []
    let list = [...dashboardData.recentTasks]
    if (filter.status !== 'all') list = list.filter(t => t.status === filter.status)
    return list
  }, [dashboardData, filter])

  const createTask = () => {
    navigate('/user/tasks/create')
  }

  const TaskModal = ({ task, onClose }) => {
    if (!task) return null
    return (
      <AnimatePresence>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm px-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-gray-900">{task.title || 'Untitled task'}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                task.priority === 'High' ? 'bg-red-100 text-red-600' : 
                task.priority === 'Medium' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
              }`}>
                {task.priority || 'Medium'}
              </span>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">{task.description}</p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Status</p>
                <p className="text-sm font-semibold text-gray-800">{task.status || 'N/A'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Due Date</p>
                <p className="text-sm font-semibold text-gray-800">{task.dueDate ? moment(task.dueDate).format('MMM D, YYYY') : 'No Date'}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="primary" className="flex-1 rounded-xl py-3" onClick={() => { onClose(); navigate(`/tasks/${task._id || task.id}`); }}>
                Open Task
              </Button>
              <Button variant="ghost" className="rounded-xl px-6" onClick={onClose}>
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 space-y-8">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Ready to work, {user?.name ? user.name.split(' ')[0] : 'User'}? ✨
            </h1>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <LuCalendar size={14} className="text-blue-500" />
              <span>{moment().format('dddd, MMMM Do')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            {potentialOverdue.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-600 px-4 py-2 rounded-2xl text-xs font-bold"
              >
                <FiZap className="fill-rose-500" />
                <span>{potentialOverdue.length} Urgency alerts</span>
              </motion.div>
            )}
            <div className="bg-white border border-gray-100 rounded-2xl px-4 py-2 shadow-sm flex items-center gap-3">
               <select className="bg-transparent text-xs font-bold text-gray-700 outline-none" value={filter.status} onChange={(e) => setFilter(f => ({ ...f, status: e.target.value }))}>
                <option value="all">Status: All</option>
                <option value="Pending">Pending</option>
                <option value="InProgress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </header>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* STATS */}
          <div className="md:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<IoStatsChart />} label="My Tasks" value={totalAll} color="bg-blue-600" trend="Total" />
            <StatCard icon={<IoListCircle />} label="Pending" value={totals?.Pending || 0} color="bg-amber-500" trend="To Do" />
            <StatCard icon={<IoHourglass />} label="Working" value={totals?.InProgress || 0} color="bg-cyan-500" trend="Active" />
            <StatCard icon={<IoCheckmarkCircle />} label="Finished" value={totals?.Completed || 0} color="bg-emerald-500" trend="Done" />
          </div>

          {/* AI WIDGET */}
          <div className="md:col-span-4 row-span-2">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] p-6 text-white h-full relative overflow-hidden shadow-2xl shadow-indigo-200">
               <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                      <LuSparkles className="text-yellow-300" />
                    </div>
                    <span className="font-bold text-sm tracking-wide">MY MOMENTUM</span>
                  </div>
                  
                  <div className="space-y-4 flex-1">
                    <p className="text-lg font-medium leading-snug">"You've completed {totals?.Completed || 0} tasks this week. Keep the streak alive!"</p>
                    <div className="text-xs text-indigo-100/70 bg-white/10 p-3 rounded-2xl border border-white/10">
                      Top Project: <span className="text-white font-bold">{projectsData?.[0]?.name || "None"}</span>
                    </div>
                  </div>

                  <Button 
                    variant="ghost" 
                    className="mt-6 bg-white/10 hover:bg-white/20 text-white border-none rounded-xl text-xs font-bold py-3"
                    onClick={() => navigate('/user/tasks')}
                  >
                    Manage All Tasks <LuSquareArrowRight className="ml-2" />
                  </Button>
               </div>
               
               <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
               <div className="absolute bottom-[-40px] left-[-40px] w-48 h-48 bg-indigo-400/20 rounded-full blur-3xl"></div>
            </div>
          </div>

          {/* CHARTS */}
          <div className="md:col-span-4 bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 border-b-4 border-b-blue-500">
            <div className="flex justify-between items-center mb-6">
              <h5 className="font-black text-gray-800 text-sm uppercase tracking-widest">Efficiency</h5>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><LuTrendingUp size={16} /></div>
            </div>
            <div className="h-48 flex items-center justify-center">
              {pieChartData.length > 0 && pieChartData.some(item => item.value > 0) ? (
                <CustomPieChart data={pieChartData} colors={COLORS} />
              ) : (
                <p className="text-xs text-gray-400">No data available</p>
              )}
            </div>
          </div>

          {/* PROJECTS */}
          <div className="md:col-span-4 bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
             <div className="flex justify-between items-center mb-6">
              <h5 className="font-black text-gray-800 text-sm uppercase tracking-widest">My Hubs</h5>
              <Button variant="ghost" size="sm" className="text-xs font-bold text-blue-600 px-0" onClick={() => navigate('/user/projects')}>View All</Button>
            </div>
            
            <div className="space-y-4">
              {projectsLoading ? (
                <div className="h-20 bg-gray-50 animate-pulse rounded-2xl"></div>
              ) : projectsData.slice(0, 2).map((project) => (
                <div key={project._id} className="group flex items-center gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-gray-100" onClick={() => navigate(`/user/projects/${project._id}/kanban`)}>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {project.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 text-sm leading-tight">{project.name}</p>
                    <p className="text-[10px] text-gray-500 font-medium">{project.status || 'Active'}</p>
                  </div>
                  <LuSquareArrowRight className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* RECENT TASKS */}
          <div className="md:col-span-12 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h5 className="font-black text-gray-800 text-sm uppercase tracking-widest mb-1">Queue Stream</h5>
                <p className="text-xs text-gray-400 font-medium">Your upcoming deliverables</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold rounded-xl px-4" onClick={refetchDashboardData}>
                  Sync
                </Button>
                <Button variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl px-4 shadow-lg shadow-blue-200" onClick={createTask}>
                  + New Task
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto -mx-2">
               <TaskListTable tableData={filteredTasks.slice(0, 6)} onRowClick={task => setModalTask(task)} />
            </div>
          </div>

        </div>

        {/* FAB */}
        <div className="fixed right-8 bottom-8 z-50">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFabOpen(prev => !prev)}
            className="w-16 h-16 rounded-[1.5rem] bg-blue-600 text-white shadow-2xl shadow-blue-300 grid place-items-center relative z-10"
          >
            <LuCirclePlus size={28} className={`transition-transform duration-300 ${fabOpen ? 'rotate-45' : ''}`} />
          </motion.button>

          <AnimatePresence>
            {fabOpen && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-white/60 backdrop-blur-[2px] z-0" onClick={() => setFabOpen(false)} />
                <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="absolute bottom-20 right-0 bg-white shadow-2xl rounded-3xl p-4 w-56 border border-gray-100 z-10">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">Quick Actions</p>
                  <div className="space-y-1">
                    <ActionButton icon={<LuCirclePlus />} label="Create Task" onClick={createTask} />
                    <ActionButton icon={<LuMessageCircle />} label="Messages" onClick={() => navigate('/user/messages')} />
                    <ActionButton icon={<LuBell />} label="Notifications" onClick={() => navigate('/user/notification')} />
                    <ActionButton icon={<LuTrendingUp />} label="Insights" onClick={() => alert('AI Insights placeholder')} />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <TaskModal task={modalTask} onClose={() => setModalTask(null)} />
        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
        <div className="h-24"></div> 
      </div>
    </DashboardLayout>
  )
}

const StatCard = ({ icon, label, value, color, trend }) => (
  <motion.div whileHover={{ y: -5 }} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between h-40 group hover:shadow-xl hover:shadow-gray-200/50 transition-all">
    <div className="flex justify-between items-start">
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{trend}</span>
    </div>
    <div>
      <p className="text-2xl font-black text-gray-900 leading-none mb-1">{addThousandsSeparator(value)}</p>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{label}</p>
    </div>
  </motion.div>
);

const ActionButton = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center gap-3 p-3 text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-2xl transition-all">
    <span className="text-lg">{icon}</span>
    {label}
  </button>
);

export default UserDashboard