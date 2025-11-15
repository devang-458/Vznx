import React, { useEffect, useState } from 'react'
import axiosInstance from '../utils/axiosinstance'
import { API_PATHS } from '../utils/apiPaths'
import moment from 'moment'
import { LuCheckCheck, LuEdit, LuTrash2, LuUser, LuBadgeAlert, LuRefreshCw } from 'react-icons/lu'

const ActivityFeed = () => {
    const [activities, setActivities] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(false)
    const [limit] = useState(10)
    const [skip, setSkip] = useState(0)

    const getActivityIcon = (type) => {
        const icons = {
            'task_created': <LuCheckCheck className='text-blue-500' />,
            'task_updated': <LuEdit className='text-yellow-500' />,
            'task_completed': <LuCheckCheck className='text-green-500' />,
            'task_assigned': <LuUser className='text-purple-500' />,
            'task_status_changed': <LuRefreshCw className='text-cyan-500' />,
            'task_priority_changed': <LuBadgeAlert className='text-orange-500' />,
            'task_deleted': <LuTrash2 className='text-red-500' />,
            'todo_checked': <LuCheckCheck className='text-green-500' />,
            'user_joined': <LuUser className='text-indigo-500' />
        }
        return icons[type] || <LuRefreshCw />
    }

    const getActivityText = (activity) => {
        const actor = activity.actor?.name || 'Someone'
        const taskTitle = activity.metadata?.taskTitle || activity.task?.title || 'a task'

        const messages = {
            'task_created': `${actor} created task "${taskTitle}"`,
            'task_updated': `${actor} updated task "${taskTitle}"`,
            'task_completed': `${actor} completed task "${taskTitle}"`,
            'task_assigned': `${actor} assigned "${taskTitle}" to ${activity.target?.name}`,
            'task_status_changed': `${actor} changed status of "${taskTitle}" to ${activity.metadata?.newValue}`,
            'task_priority_changed': `${actor} changed priority of "${taskTitle}" to ${activity.metadata?.newValue}`,
            'task_deleted': `${actor} deleted task "${taskTitle}"`,
            'todo_checked': `${actor} checked an item in "${taskTitle}"`,
            'user_joined': `${actor} joined the team`
        }

        return messages[activity.type] || `${actor} performed an action on "${taskTitle}"`
    }

    const fetchActivities = async (skipAmount = 0) => {
        setLoading(true)
        try {
            const response = await axiosInstance.get(API_PATHS.ACTIVITIES.GET_FEED, {
                params: {
                    limit,
                    skip: skipAmount
                }
            })
            
            if (skipAmount === 0) {
                setActivities(response.data.activities || [])
            } else {
                setActivities([...activities, ...(response.data.activities || [])])
            }
            
            setUnreadCount(response.data.unreadCount || 0)
            setHasMore(response.data.hasMore || false)
        } catch (error) {
            console.error('Error fetching activities:', error)
        } finally {
            setLoading(false)
        }
    }

    const markAllAsRead = async () => {
        try {
            await axiosInstance.put(API_PATHS.ACTIVITIES.MARK_ALL_READ)
            setUnreadCount(0)
            fetchActivities()
        } catch (error) {
            console.error('Error marking all as read:', error)
        }
    }

    const loadMore = () => {
        const newSkip = skip + limit
        setSkip(newSkip)
        fetchActivities(newSkip)
    }

    useEffect(() => {
        fetchActivities()
    }, [])

    return (
        <div className='card'>
            <div className='flex justify-between items-center mb-4'>
                <div>
                    <h3 className='text-lg font-semibold'>Activity Feed</h3>
                    {unreadCount > 0 && (
                        <span className='inline-block mt-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full'>
                            {unreadCount} new
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className='text-sm text-blue-600 hover:text-blue-700 font-medium'
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {loading && activities.length === 0 ? (
                <div className='text-center py-6 text-gray-500'>
                    <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2'></div>
                    <p>Loading activities...</p>
                </div>
            ) : activities.length === 0 ? (
                <div className='text-center py-6 text-gray-500'>
                    No activities yet
                </div>
            ) : (
                <div className='space-y-3 max-h-96 overflow-y-auto'>
                    {activities.map((activity) => (
                        <div
                            key={activity._id}
                            className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                                !activity.isRead
                                    ? 'bg-blue-50 border border-blue-200'
                                    : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                        >
                            <div className='flex-shrink-0 mt-1'>
                                {getActivityIcon(activity.type)}
                            </div>
                            <div className='flex-1 min-w-0'>
                                <p className='text-sm font-medium text-gray-800'>
                                    {getActivityText(activity)}
                                </p>
                                <p className='text-xs text-gray-500 mt-1'>
                                    {moment(activity.createdAt).fromNow()}
                                </p>
                            </div>
                            {!activity.isRead && (
                                <div className='flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1'></div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {hasMore && (
                <button
                    onClick={loadMore}
                    disabled={loading}
                    className='w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50'
                >
                    {loading ? 'Loading...' : 'Load more'}
                </button>
            )}
        </div>
    )
}

export default ActivityFeed
