import React, { useContext, useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { useUserAuth } from '../../hooks/useUserAuth'
import { UserContext } from '../../context/userContext'
import axiosInstance from '../../utils/axiosinstance'
import { API_PATHS } from '../../utils/apiPaths'
import moment from 'moment'
import InfoCard from '../../components/Cards/InfoCard'
import { addThousandsSeparator } from '../../utils/helper'
import {
  IoStatsChart,
  IoListCircle,
  IoHourglass,
  IoCheckmarkCircle
} from 'react-icons/io5'
import { LuSquareArrowRight, LuCirclePlus, LuMessageCircle } from 'react-icons/lu'
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

  // API may return top-level charts or nested charts
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

  // const [dashboardData, setDashboardData] = useState(null) // Removed
  const [pieChartData, setPieChartData] = useState([])
  const [barChartData, setBarChartData] = useState([])
  // const [loading, setLoading] = useState(false) // Removed
  // const [error, setError] = useState(null) // Removed
  const [fabOpen, setFabOpen] = useState(false)
  const [filter, setFilter] = useState({ status: 'all', mineOnly: false })
  const [modalTask, setModalTask] = useState(null)

  const prepareChartData = (data) => {
    // Accept either { charts: { taskDistribution: {...} } } or top-level shape
    const normalized = data?.charts || data || {}
    const dist = normalized.taskDistribution || {}
    const prio = normalized.taskPriorityLevels || {}

    // produce { name, value } shape used by our chart components
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
    console.log("👉 taskDistributionData:", taskDistributionData);

    setPieChartData(taskDistributionData)
    setBarChartData(priorityLevelData)
  }

  // const getDashboardData = async () => { // Removed
  //   if (!user) return
  //   setLoading(true)
  //   setError(null)

  //   try {
  //     const response = await axiosInstance.get(API_PATHS.TASKS.GET_USER_DASHBOARD_DATA)
  //     const normalized = normalizeDashboardResponse(response.data)
  //     setDashboardData(normalized)
  //     prepareChartData(normalized.charts)
  //   } catch (err) {
  //     console.error('Error fetching user dashboard data', err)
  //     setError('Failed to load dashboard data')
  //     setDashboardData({ charts: { taskDistribution: {}, taskPriorityLevels: {} }, recentTasks: [] })
  //     setPieChartData([])
  //     setBarChartData([])
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  useEffect(() => {
    if (dashboardData) {
      const normalized = normalizeDashboardResponse(dashboardData);
      // setDashboardData(normalized); // No longer needed as dashboardData is from hook
      prepareChartData(normalized.charts);
    }
  }, [dashboardData]);

  const totals = dashboardData?.charts?.taskDistribution || {}
  const totalAll = totals?.All || ((totals.Pending || 0) + (totals.InProgress || 0) + (totals.Completed || 0))
  const completionRate = totalAll ? Math.round(((totals.Completed || 0) / totalAll) * 100) : 0

  const potentialOverdue = useMemo(() => predictPotentiallyOverdue(dashboardData?.recentTasks || []), [dashboardData])

  const filteredTasks = useMemo(() => {
    if (!dashboardData?.recentTasks) return []
    let list = [...dashboardData.recentTasks]
    if (filter.status !== 'all') list = list.filter(t => t.status === filter.status)
    if (filter.mineOnly && user) list = list.filter(t => (t.assigneeId === user.id || t.assignee === user.email || (Array.isArray(t.assignedTo) && t.assignedTo.includes(user._id))))
    return list
  }, [dashboardData, filter, user])

  const onSeeMore = () => navigate('/user/tasks')

  const createTask = () => {
    // user dashboard should navigate to user task creation
    navigate('/user/tasks/create')
  }

  const sendMessage = () => {
    navigate('/user/messages')
  }

  const TaskModal = ({ task, onClose }) => {
    if (!task) return null
    return (
      <AnimatePresence>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black bg-opacity-40" onClick={onClose}>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{task.title || 'Untitled task'}</h3>
                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                <div className="mt-3 flex gap-3 text-xs">
                  <div className="px-2 py-1 rounded-md bg-gray-100 text-sm">Status: {task.status || 'N/A'}</div>
                  <div className="px-2 py-1 rounded-md bg-gray-100 text-sm">Priority: {task.priority || 'Medium'}</div>
                  <div className="px-2 py-1 rounded-md bg-gray-100 text-sm">Due: {task.dueDate ? moment(task.dueDate).format('MMM D') : '—'}</div>
                </div>
              </div>
              <div className="text-right">
                <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => { navigator.clipboard?.writeText(window.location.href); }}>Share</Button>
                <div className="mt-3">
                  <Button variant="primary" onClick={() => { onClose(); navigate(`/tasks/${task._id || task.id}`); }}>Open Task</Button>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <h6 className="text-sm font-medium mb-2">Activity</h6>
              <div className="w-full h-28 bg-gray-50 rounded-md grid place-items-center text-sm text-gray-500">Mini trend chart placeholder</div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋</h1>
            <p className="text-sm text-gray-600 mt-1">{moment().format('dddd, Do MMM YYYY')}</p>
            {potentialOverdue?.length > 0 && (
              <div className="mt-3 inline-flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 px-3 py-2 rounded">
                <FiZap />
                <div className="text-sm">{potentialOverdue.length} task(s) may miss deadline — check Recent Tasks.</div>
                <Button variant="ghost" size="sm" className="ml-4 text-sm underline" onClick={() => { setFilter(f => ({ ...f, status: 'all', mineOnly: false })); window.scrollTo({ top: 800, behavior: 'smooth' }); }}>View</Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-nowrap">

            <div className="flex items-center gap-2  bg-white border rounded-full px-3 py-1 shadow-sm">
              <select className="text-sm outline-none" value={filter.status} onChange={(e) => setFilter(f => ({ ...f, status: e.target.value }))}>
                <option value="all">All statuses</option>
                <option value="Pending">Pending</option>
                <option value="InProgress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <label className="ml-2 text-sm text-gray-600 flex items-center gap-2">
                <input type="checkbox" checked={filter.mineOnly} onChange={(e) => setFilter(f => ({ ...f, mineOnly: e.target.checked }))} />
                <span className="text-xs p-1.5 flex flex-row w-22">My tasks only</span>
              </label>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button className="border-black border p-2.5 rounded-full " onClick={sendMessage}><LuMessageCircle  /></button>
              <Button variant="primary" onClick={createTask}>+ New Task</Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 mt-8">
          <motion.div whileHover={{ scale: 1.03 }} className="bg-white rounded-2xl p-5 shadow-md cursor-pointer">
            <InfoCard icon={<IoStatsChart />} label="My Tasks" value={addThousandsSeparator(totalAll || 0)} color="bg-blue-500" />
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} className="bg-white rounded-2xl p-5 shadow-md cursor-pointer">
            <InfoCard icon={<IoListCircle />} label="Pending" value={addThousandsSeparator(totals?.Pending || 0)} color="bg-yellow-400" />
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} className="bg-white rounded-2xl p-5 shadow-md cursor-pointer">
            <InfoCard icon={<IoHourglass />} label="In Progress" value={addThousandsSeparator(totals?.InProgress || 0)} color="bg-cyan-400" />
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} className="bg-white rounded-2xl p-5 shadow-md cursor-pointer">
            <InfoCard icon={<IoCheckmarkCircle />} label="Completed" value={addThousandsSeparator(totals?.Completed || 0)} color="bg-green-400" />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h5 className="font-medium">Task Distribution</h5>
              <div className="text-xs text-gray-500">Hover slices for details</div>
            </div>
            <CustomPieChart data={pieChartData} colors={COLORS} />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h5 className="font-medium">Task Priority Levels</h5>
              <div className="text-xs text-gray-500">Color-coded</div>
            </div>
            <CustomBarChart data={barChartData} />
          </div>

          <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h5 className="font-medium">Recent Tasks</h5>
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-600">Completion: <strong>{completionRate}%</strong></div>
                <Button variant="ghost" size="sm" className="text-gray-600" onClick={() => refetchDashboardData()}>Refresh</Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-blue-600" onClick={onSeeMore}>See All <LuSquareArrowRight /></Button>
              </div>
            </div>

            <TaskListTable tableData={filteredTasks} onRowClick={(task) => setModalTask(task)} />
          </div>
        </div>

        <div className="fixed right-6 bottom-6 z-50">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
            <div className="relative">
              <button onClick={() => setFabOpen(s => !s)} className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg grid place-items-center">
                <LuCirclePlus size={22} />
              </button>

              <AnimatePresence>
                {fabOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 bottom-20 w-52 bg-white rounded-xl shadow-xl p-3">
                    <div className="flex flex-col gap-2">
                      <Button variant="ghost" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 text-left" onClick={() => { navigate('/user/tasks/create'); setFabOpen(false); }}>
                        <LuCirclePlus />
                        <span className="text-sm">Create Task</span>
                      </Button>

                      <Button variant="ghost" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 text-left" onClick={() => { alert('AI Insights placeholder — hook up your AI endpoint here'); setFabOpen(false); }}>
                        <FiZap />
                        <span className="text-sm">AI Insights</span>
                      </Button>

                      <Button variant="ghost" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 text-left" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setFabOpen(false); }}>
                        <LuSquareArrowRight />
                        <span className="text-sm">View Summary</span>
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        <TaskModal task={modalTask} onClose={() => setModalTask(null)} />

        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
      </div>
    </DashboardLayout>
  )
}

export default UserDashboard
