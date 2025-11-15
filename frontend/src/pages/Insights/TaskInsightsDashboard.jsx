import React, { useContext, useEffect, useState } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { useUserAuth } from '../../hooks/useUserAuth'
import { UserContext } from '../../context/userContext'
import axiosInstance from '../../utils/axiosinstance'
import { API_PATHS } from '../../utils/apiPaths'
import moment from 'moment'
import { LuRefreshCw, LuTriangleAlert, LuCheckCheck, LuClock, LuTrendingUp, LuLightbulb, LuZap, LuBadgeAlert } from 'react-icons/lu'

const TaskInsightsDashboard = () => {
    useUserAuth()
    const { user } = useContext(UserContext)

    const [insights, setInsights] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const fetchInsights = async () => {
        setLoading(true)
        setError('')
        try {
            const response = await axiosInstance.get(API_PATHS.ANALYTICS.GET_INSIGHTS)
            setInsights(response.data)
        } catch (error) {
            setError('Failed to load insights')
            console.error('Error fetching insights:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user) {
            fetchInsights()
        }
    }, [user])

    if (loading && !insights) {
        return (
            <DashboardLayout activeMenu="Task Insights">
                <div className='flex justify-center items-center h-96'>
                    <div className='text-center'>
                        <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4'></div>
                        <p className='text-gray-600'>Loading insights...</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    if (error || !insights) {
        return (
            <DashboardLayout activeMenu="Task Insights">
                <div className='card my-5 text-center py-8'>
                    <p className='text-red-600'>{error || 'No insights available'}</p>
                    <button
                        onClick={fetchInsights}
                        className='mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
                    >
                        Retry
                    </button>
                </div>
            </DashboardLayout>
        )
    }

    const { metrics, priorityBreakdown, urgentTasks, recommendations, dueSoon } = insights

    const getWorkloadStatus = (score) => {
        if (score >= 75) return { text: 'Heavy', color: 'bg-red-100 text-red-800', icon: '🔴' }
        if (score >= 50) return { text: 'Moderate', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' }
        return { text: 'Light', color: 'bg-green-100 text-green-800', icon: '🟢' }
    }

    const workloadStatus = getWorkloadStatus(metrics.workloadScore)

    return (
        <DashboardLayout activeMenu="Task Insights">
            <div className='p-4 md:p-6'>
                {/* Header */}
                <div className='flex justify-between items-center mb-6'>
                    <h1 className='text-2xl font-bold'>Task Insights & Analytics</h1>
                    <button
                        onClick={fetchInsights}
                        disabled={loading}
                        className='flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50'
                    >
                        <LuRefreshCw size={18} /> Refresh
                    </button>
                </div>

                {/* Key Metrics */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
                    <div className='card'>
                        <p className='text-sm text-gray-600 mb-2'>Completion Rate</p>
                        <p className='text-3xl font-bold text-blue-600'>{metrics.completionRate}%</p>
                        <p className='text-xs text-gray-500 mt-2'>{metrics.completedTasks} of {metrics.totalTasks} completed</p>
                    </div>

                    <div className={`card ${workloadStatus.color}`}>
                        <p className='text-sm font-medium mb-2'>Workload Status</p>
                        <p className='text-3xl font-bold'>{workloadStatus.icon} {workloadStatus.text}</p>
                        <p className='text-xs mt-2 opacity-75'>Score: {metrics.workloadScore}/100</p>
                    </div>

                    <div className='card'>
                        <p className='text-sm text-gray-600 mb-2'>Overdue Tasks</p>
                        <p className='text-3xl font-bold text-red-600'>{metrics.overdueCount}</p>
                        <p className='text-xs text-gray-500 mt-2'>Need attention</p>
                    </div>

                    <div className='card'>
                        <p className='text-sm text-gray-600 mb-2'>Avg Completion Time</p>
                        <p className='text-3xl font-bold text-green-600'>{metrics.avgCompletionDays}d</p>
                        <p className='text-xs text-gray-500 mt-2'>Per task average</p>
                    </div>
                </div>

                {/* Priority Breakdown */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
                    <div className='card'>
                        <h3 className='text-lg font-semibold mb-4'>Priority Breakdown</h3>
                        <div className='space-y-3'>
                            <div>
                                <div className='flex justify-between items-center mb-1'>
                                    <span className='text-sm font-medium'>High Priority</span>
                                    <span className='text-sm font-bold text-red-600'>{priorityBreakdown.High}</span>
                                </div>
                                <div className='w-full bg-gray-200 rounded-full h-2'>
                                    <div
                                        className='bg-red-500 h-2 rounded-full'
                                        style={{ width: `${(priorityBreakdown.High / (priorityBreakdown.High + priorityBreakdown.Medium + priorityBreakdown.Low)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div>
                                <div className='flex justify-between items-center mb-1'>
                                    <span className='text-sm font-medium'>Medium Priority</span>
                                    <span className='text-sm font-bold text-yellow-600'>{priorityBreakdown.Medium}</span>
                                </div>
                                <div className='w-full bg-gray-200 rounded-full h-2'>
                                    <div
                                        className='bg-yellow-500 h-2 rounded-full'
                                        style={{ width: `${(priorityBreakdown.Medium / (priorityBreakdown.High + priorityBreakdown.Medium + priorityBreakdown.Low)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div>
                                <div className='flex justify-between items-center mb-1'>
                                    <span className='text-sm font-medium'>Low Priority</span>
                                    <span className='text-sm font-bold text-green-600'>{priorityBreakdown.Low}</span>
                                </div>
                                <div className='w-full bg-gray-200 rounded-full h-2'>
                                    <div
                                        className='bg-green-500 h-2 rounded-full'
                                        style={{ width: `${(priorityBreakdown.Low / (priorityBreakdown.High + priorityBreakdown.Medium + priorityBreakdown.Low)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Smart Recommendations */}
                    <div className='card'>
                        <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                            <LuLightbulb className='text-yellow-500' size={20} />
                            Smart Recommendations
                        </h3>
                        <div className='space-y-3'>
                            {recommendations.length === 0 ? (
                                <p className='text-sm text-gray-500'>Great job! No recommendations at this time.</p>
                            ) : (
                                recommendations.map((rec, idx) => (
                                    <div key={idx} className={`p-3 rounded-lg border ${
                                        rec.priority === 'high' ? 'bg-red-50 border-red-200' :
                                        rec.priority === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                                        'bg-blue-50 border-blue-200'
                                    }`}>
                                        <p className='font-medium text-sm'>{rec.title}</p>
                                        <p className='text-xs text-gray-600 mt-1'>{rec.message}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Urgent Tasks */}
                {urgentTasks.length > 0 && (
                    <div className='card mb-6'>
                        <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                            <LuBadgeAlert className='text-red-500' size={20} />
                            Urgent Tasks (Overdue)
                        </h3>
                        <div className='space-y-2'>
                            {urgentTasks.map((task) => (
                                <div key={task._id} className='flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg'>
                                    <div>
                                        <p className='font-medium text-sm text-gray-900'>{task.title}</p>
                                        <p className='text-xs text-gray-600 mt-1'>
                                            Due: {moment(task.dueDate).format('MMM Do, YYYY')}
                                        </p>
                                    </div>
                                    <span className='px-2 py-1 bg-red-200 text-red-800 text-xs font-medium rounded'>
                                        {task.priority}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Due Soon */}
                {dueSoon.length > 0 && (
                    <div className='card'>
                        <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                            <LuClock className='text-orange-500' size={20} />
                            Due Soon
                        </h3>
                        <div className='space-y-2'>
                            {dueSoon.map((task) => (
                                <div key={task._id} className='flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg'>
                                    <div>
                                        <p className='font-medium text-sm text-gray-900'>{task.title}</p>
                                        <p className='text-xs text-gray-600 mt-1'>
                                            Due: {moment(task.dueDate).format('MMM Do, YYYY')}
                                        </p>
                                    </div>
                                    <span className='text-xs font-medium text-orange-700'>
                                        {moment(task.dueDate).fromNow()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

export default TaskInsightsDashboard
