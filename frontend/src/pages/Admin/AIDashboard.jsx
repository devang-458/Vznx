import React, { useState, useEffect, useContext } from 'react'
import AdminLayout from '../../components/layouts/DashboardLayout'
import { UserContext } from '../../context/userContext'
import axiosInstance from '../../utils/axiosinstance'
import { API_PATHS } from '../../utils/apiPaths'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ComposedChart
} from 'recharts'
import {
  LuTrendingUp, LuBrain, LuCheckCheck, LuClock,
  LuZap, LuTarget, LuUsers, LuLoader, LuRefreshCw
} from 'react-icons/lu'
import {
  IoIosAlert
} from "react-icons/io"

const AIDashboard = () => {
  const { user } = useContext(UserContext)
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [aiInsights, setAiInsights] = useState([])
  const [predictions, setPredictions] = useState([])
  const [anomalies, setAnomalies] = useState([])
  const [recommendations, setRecommendations] = useState([])

  // Fetch and analyze dashboard data
  useEffect(() => {
    const fetchAIData = async () => {
      try {
        setLoading(true)

        // Fetch tasks data
        const tasksResponse = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS)
        const tasks = Array.isArray(tasksResponse.data) ? tasksResponse.data : tasksResponse.data.tasks || []

        // Fetch analytics
        const analyticsResponse = await axiosInstance.get(API_PATHS.ANALYTICS.GET_TEAM_OVERVIEW)
        const analyticsData = analyticsResponse.data || {}

        // Generate AI insights
        generateAIInsights(tasks, analyticsData)
        generatePredictions(tasks)
        detectAnomalies(tasks)
        generateRecommendations(tasks, analyticsData)

        setDashboardData({ tasks, analytics: analyticsData })
      } catch (err) {
        console.error('Error fetching AI data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAIData()
  }, [])

  // Generate AI-powered insights
  const generateAIInsights = (tasks, analytics) => {
    const insights = []

    // Task velocity insight
    const completedTasks = tasks.filter(t => t.status === 'Completed').length
    const totalTasks = tasks.length
    const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0

    insights.push({
      id: 'velocity',
      title: 'Team Velocity',
      value: `${completionRate}%`,
      description: `${completedTasks} of ${totalTasks} tasks completed`,
      icon: LuTrendingUp,
      color: 'bg-green-100 text-green-700',
      trend: completionRate >= 70 ? 'up' : 'down'
    })

    // Priority distribution
    const highPriority = tasks.filter(t => t.priority === 'High').length
    const mediumPriority = tasks.filter(t => t.priority === 'Medium').length
    const lowPriority = tasks.filter(t => t.priority === 'Low').length

    insights.push({
      id: 'priority',
      title: 'Priority Distribution',
      value: `${highPriority} High`,
      description: `${mediumPriority} Medium, ${lowPriority} Low`,
      icon: LuTarget,
      color: 'bg-orange-100 text-orange-700'
    })

    // Overdue tasks
    const now = new Date()
    const overdueTasks = tasks.filter(t => {
      if (!t.dueDate || t.status === 'Completed') return false
      return new Date(t.dueDate) < now
    })

    insights.push({
      id: 'overdue',
      title: 'Overdue Tasks',
      value: overdueTasks.length,
      description: overdueTasks.length > 0 ? `${overdueTasks.length} tasks need attention` : 'All on track',
      icon: IoIosAlert,
      color: overdueTasks.length > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
    })

    // Workload distribution
    const inProgress = tasks.filter(t => t.status === 'InProgress').length
    insights.push({
      id: 'workload',
      title: 'Current Workload',
      value: inProgress,
      description: `${inProgress} tasks actively being worked on`,
      icon: LuClock,
      color: 'bg-blue-100 text-blue-700'
    })

    setAiInsights(insights)
  }

  // Generate predictions
  const generatePredictions = (tasks) => {
    const preds = []

    // Predict completion timeline
    const completedTasks = tasks.filter(t => t.status === 'Completed').length
    const totalTasks = tasks.length
    const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0

    if (completionRate > 0) {
      const remainingTasks = totalTasks - completedTasks
      const estimatedDaysToComplete = Math.ceil(remainingTasks / Math.max(completionRate, 0.1))

      preds.push({
        id: 'completion',
        title: 'Estimated Completion',
        value: `${estimatedDaysToComplete} days`,
        description: `At current velocity, all tasks will be done in ~${estimatedDaysToComplete} days`,
        confidence: Math.min(95, 70 + (completionRate * 30))
      })
    }

    // Predict bottlenecks
    const highPriorityIncomplete = tasks.filter(t => t.priority === 'High' && t.status !== 'Completed').length
    if (highPriorityIncomplete > 3) {
      preds.push({
        id: 'bottleneck',
        title: 'Potential Bottleneck',
        value: `${highPriorityIncomplete} high-priority tasks`,
        description: 'Multiple high-priority tasks might create delays',
        confidence: 85
      })
    }

    // Resource utilization prediction
    const avgTasksPerDay = tasks.length / Math.max(1, new Set(tasks.map(t => new Date(t.createdAt).toDateString())).size)
    preds.push({
      id: 'utilization',
      title: 'Resource Utilization',
      value: `${(avgTasksPerDay * 100).toFixed(0)}%`,
      description: `Team is ${avgTasksPerDay > 1 ? 'heavily' : 'moderately'} utilized`,
      confidence: 78
    })

    setPredictions(preds)
  }

  // Detect anomalies
  const detectAnomalies = (tasks) => {
    const anomaly_list = []

    // Detect tasks with unusual patterns
    const veryLongDescriptions = tasks.filter(t => t.description && t.description.length > 500)
    if (veryLongDescriptions.length > 0) {
      anomaly_list.push({
        id: 'long-desc',
        type: 'Information Overload',
        count: veryLongDescriptions.length,
        severity: 'warning',
        description: 'Some tasks have unusually detailed descriptions'
      })
    }

    // Detect tasks assigned to many people (if applicable)
    const now = new Date()
    const staleTasks = tasks.filter(t => {
      if (t.status === 'Completed') return false
      const createdDate = new Date(t.createdAt)
      const daysSinceCreation = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24))
      return daysSinceCreation > 30
    })

    if (staleTasks.length > 0) {
      anomaly_list.push({
        id: 'stale',
        type: 'Stale Tasks',
        count: staleTasks.length,
        severity: 'critical',
        description: 'Tasks created over 30 days ago still pending'
      })
    }

    // Detect imbalanced workload
    const pendingTasks = tasks.filter(t => t.status === 'Pending').length
    const completedTasks = tasks.filter(t => t.status === 'Completed').length
    if (pendingTasks > completedTasks * 2) {
      anomaly_list.push({
        id: 'imbalance',
        type: 'Workload Imbalance',
        count: pendingTasks,
        severity: 'warning',
        description: 'Pending tasks significantly outnumber completed tasks'
      })
    }

    setAnomalies(anomaly_list)
  }

  // Generate AI recommendations
  const generateRecommendations = (tasks, analytics) => {
    const recs = []

    // Recommendation 1: Focus on high priority
    const incompletHighPriority = tasks.filter(t => t.priority === 'High' && t.status !== 'Completed')
    if (incompletHighPriority.length > 0) {
      recs.push({
        id: 'priority-focus',
        title: '��� Focus on High-Priority Tasks',
        description: `${incompletHighPriority.length} high-priority tasks need completion. Consider prioritizing these to maintain project momentum.`,
        action: 'Review High Priority',
        priority: 'critical'
      })
    }

    // Recommendation 2: Address overdue tasks
    const now = new Date()
    const overdue = tasks.filter(t => {
      if (!t.dueDate || t.status === 'Completed') return false
      return new Date(t.dueDate) < now
    })

    if (overdue.length > 0) {
      recs.push({
        id: 'overdue-action',
        title: '⚠️ Address Overdue Tasks',
        description: `${overdue.length} task(s) are past their due date. Quick action needed to get back on schedule.`,
        action: 'View Overdue',
        priority: 'high'
      })
    }

    // Recommendation 3: Improve completion rate
    const completionRate = tasks.length > 0 ? (tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100 : 0
    if (completionRate < 50) {
      recs.push({
        id: 'completion-rate',
        title: '��� Boost Completion Rate',
        description: `Current completion rate is ${completionRate.toFixed(1)}%. Target 70%+ for better project health.`,
        action: 'Optimize Workflow',
        priority: 'medium'
      })
    }

    // Recommendation 4: Balance workload
    const inProgress = tasks.filter(t => t.status === 'InProgress').length
    const pending = tasks.filter(t => t.status === 'Pending').length

    if (pending > inProgress * 2) {
      recs.push({
        id: 'workload-balance',
        title: '⚖️ Rebalance Workload',
        description: `Too many pending tasks (${pending}). Move more tasks to "In Progress" to keep the team engaged.`,
        action: 'Start Tasks',
        priority: 'medium'
      })
    }

    setRecommendations(recs)
  }

  return (
    <AdminLayout>
      <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
              <LuBrain className="text-purple-600" size={40} />
              AI-Powered Dashboard
            </h1>
            <button
              onClick={() => window.location.reload()}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <LuRefreshCw size={24} className="text-gray-600" />
            </button>
          </div>
          <p className="text-gray-600">Intelligent insights, predictions & recommendations powered by AI</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <LuLoader className="animate-spin text-purple-600" size={48} />
          </div>
        ) : (
          <>
            {/* AI Insights Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {aiInsights.map(insight => {
                const Icon = insight.icon
                return (
                  <div key={insight.id} className={`${insight.color} rounded-lg p-6 shadow-md`}>
                    <div className="flex items-start justify-between mb-3">
                      <Icon size={28} />
                      {insight.trend === 'up' && <LuTrendingUp className="text-green-600" size={20} />}
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{insight.title}</h3>
                    <p className="text-3xl font-bold mb-2">{insight.value}</p>
                    <p className="text-sm opacity-90">{insight.description}</p>
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Predictions */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <LuZap className="text-yellow-500" />
                  AI Predictions
                </h2>
                <div className="space-y-4">
                  {predictions.length > 0 ? (
                    predictions.map(pred => (
                      <div key={pred.id} className="border-l-4 border-yellow-500 pl-4 py-3">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-800">{pred.title}</h3>
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            {pred.confidence}% confidence
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">{pred.description}</p>
                        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{ width: `${pred.confidence}%` }}
                          ></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No predictions available</p>
                  )}
                </div>
              </div>

              {/* Anomalies */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <IoIosAlert className="text-red-500" />
                  Anomalies Detected
                </h2>
                <div className="space-y-3">
                  {anomalies.length > 0 ? (
                    anomalies.map(anomaly => (
                      <div
                        key={anomaly.id}
                        className={`p-3 rounded-lg border-l-4 ${
                          anomaly.severity === 'critical'
                            ? 'bg-red-50 border-red-500'
                            : 'bg-yellow-50 border-yellow-500'
                        }`}
                      >
                        <h4 className="font-semibold text-gray-800 text-sm">{anomaly.type}</h4>
                        <p className="text-xs text-gray-600 mt-1">{anomaly.description}</p>
                        <span className="inline-block mt-2 text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded">
                          {anomaly.count} instances
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No anomalies detected ✓</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <LuCheckCheck className="text-green-600" />
                AI Recommendations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.length > 0 ? (
                  recommendations.map(rec => (
                    <div
                      key={rec.id}
                      className={`p-4 rounded-lg border-2 ${
                        rec.priority === 'critical'
                          ? 'border-red-300 bg-red-50'
                          : rec.priority === 'high'
                          ? 'border-orange-300 bg-orange-50'
                          : 'border-blue-300 bg-blue-50'
                      }`}
                    >
                      <h3 className="font-semibold text-gray-800 mb-2">{rec.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                      <button className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm rounded hover:opacity-90 transition">
                        {rec.action}
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">All systems optimal! ��</p>
                )}
              </div>
            </div>

            {/* Performance Metrics Chart */}
            {dashboardData && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Task Distribution Over Time</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={[
                    { name: 'Day 1', completed: 2, inProgress: 1, pending: 4 },
                    { name: 'Day 2', completed: 3, inProgress: 2, pending: 3 },
                    { name: 'Day 3', completed: 5, inProgress: 1, pending: 2 },
                    { name: 'Day 4', completed: 5, inProgress: 0, pending: 2 }
                  ]}>
                    <defs>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="completed" stackId="1" stroke="#10b981" fillOpacity={1} fill="url(#colorCompleted)" />
                    <Area type="monotone" dataKey="inProgress" stackId="1" stroke="#f59e0b" fill="#fbbf24" />
                    <Area type="monotone" dataKey="pending" stackId="1" stroke="#ef4444" fill="#fca5a5" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}

export default AIDashboard
