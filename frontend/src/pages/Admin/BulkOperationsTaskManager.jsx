import React, { useState, useEffect, useContext } from 'react'
import AdminLayout from '../../components/layouts/DashboardLayout'
import { UserContext } from '../../context/userContext'
import axiosInstance from '../../utils/axiosinstance'
import { API_PATHS } from '../../utils/apiPaths'
import { LuCheck, LuClock, LuFlag, LuTrash2 } from "react-icons/lu"

const BulkOperationsTaskManager = () => {
    const { user } = useContext(UserContext)
    const [tasks, setTasks] = useState([])
    const [filteredTasks, setFilteredTasks] = useState([])
    const [selectedTasks, setSelectedTasks] = useState(new Set())
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    // Bulk operation states
    const [bulkStatus, setBulkStatus] = useState('')
    const [bulkPriority, setBulkPriority] = useState('')
    const [bulkDueDate, setBulkDueDate] = useState('')
    const [bulkAssignee, setBulkAssignee] = useState('')
    const [users, setUsers] = useState([])

    // Filter states
    const [filterStatus, setFilterStatus] = useState('all')
    const [filterPriority, setFilterPriority] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')

    // Fetch tasks
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                setLoading(true)
                const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS)
                const taskList = Array.isArray(response.data) ? response.data : response.data.tasks || []
                setTasks(taskList)
                setFilteredTasks(taskList)
            } catch (err) {
                setError('Failed to fetch tasks')
                console.error(err)
                setTasks([])
                setFilteredTasks([])
            } finally {
                setLoading(false)
            }
        }
        fetchTasks()
    }, [])

    // Fetch users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS)
                const userList = Array.isArray(response.data) ? response.data : response.data.users || []
                setUsers(userList)
            } catch (err) {
                console.error('Error fetching users:', err)
                setUsers([])
            }
        }
        fetchUsers()
    }, [])

    // Apply filters
    useEffect(() => {
        let filtered = tasks

        if (filterStatus !== 'all') {
            filtered = filtered.filter(task => task.status === filterStatus)
        }

        if (filterPriority !== 'all') {
            filtered = filtered.filter(task => task.priority === filterPriority)
        }

        if (searchTerm) {
            filtered = filtered.filter(task =>
                task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.description?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        setFilteredTasks(filtered)
    }, [tasks, filterStatus, filterPriority, searchTerm])

    // Handle select all
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedTasks(new Set(filteredTasks.map(t => t._id)))
        } else {
            setSelectedTasks(new Set())
        }
    }

    // Handle individual select
    const handleSelectTask = (taskId) => {
        const newSelected = new Set(selectedTasks)
        if (newSelected.has(taskId)) {
            newSelected.delete(taskId)
        } else {
            newSelected.add(taskId)
        }
        setSelectedTasks(newSelected)
    }

    // Bulk operations
    const handleBulkUpdateStatus = async () => {
        if (selectedTasks.size === 0) {
            setError('Please select at least one task')
            return
        }
        if (!bulkStatus) {
            setError('Please select a status')
            return
        }

        try {
            await axiosInstance.put(API_PATHS.BULK_OPERATIONS.UPDATE_STATUS, {
                taskIds: Array.from(selectedTasks),
                status: bulkStatus
            })
            setSuccessMessage(`Updated ${selectedTasks.size} tasks to ${bulkStatus}`)
            setBulkStatus('')
            setSelectedTasks(new Set())
            // Refresh tasks
            const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS)
            const taskList = Array.isArray(response.data) ? response.data : response.data.tasks || []
            setTasks(taskList)
        } catch (err) {
            setError('Failed to update tasks: ' + (err.response?.data?.message || err.message))
        }
    }

    const handleBulkUpdatePriority = async () => {
        if (selectedTasks.size === 0) {
            setError('Please select at least one task')
            return
        }
        if (!bulkPriority) {
            setError('Please select a priority')
            return
        }

        try {
            await axiosInstance.put(API_PATHS.BULK_OPERATIONS.UPDATE_PRIORITY, {
                taskIds: Array.from(selectedTasks),
                priority: bulkPriority
            })
            setSuccessMessage(`Updated ${selectedTasks.size} tasks to ${bulkPriority} priority`)
            setBulkPriority('')
            setSelectedTasks(new Set())
            // Refresh tasks
            const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS)
            const taskList = Array.isArray(response.data) ? response.data : response.data.tasks || []
            setTasks(taskList)
        } catch (err) {
            setError('Failed to update priority: ' + (err.response?.data?.message || err.message))
        }
    }

    const handleBulkUpdateDueDate = async () => {
        if (selectedTasks.size === 0) {
            setError('Please select at least one task')
            return
        }
        if (!bulkDueDate) {
            setError('Please select a due date')
            return
        }

        try {
            await axiosInstance.put(API_PATHS.BULK_OPERATIONS.UPDATE_DUE_DATE, {
                taskIds: Array.from(selectedTasks),
                dueDate: bulkDueDate
            })
            setSuccessMessage(`Updated ${selectedTasks.size} tasks due date`)
            setBulkDueDate('')
            setSelectedTasks(new Set())
            // Refresh tasks
            const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS)
            const taskList = Array.isArray(response.data) ? response.data : response.data.tasks || []
            setTasks(taskList)
        } catch (err) {
            setError('Failed to update due date: ' + (err.response?.data?.message || err.message))
        }
    }

    const handleBulkAssign = async () => {
        if (selectedTasks.size === 0) {
            setError('Please select at least one task')
            return
        }
        if (!bulkAssignee) {
            setError('Please select an assignee')
            return
        }

        try {
            await axiosInstance.put(API_PATHS.BULK_OPERATIONS.ASSIGN_TASKS, {
                taskIds: Array.from(selectedTasks),
                assignedTo: bulkAssignee
            })
            setSuccessMessage(`Assigned ${selectedTasks.size} tasks`)
            setBulkAssignee('')
            setSelectedTasks(new Set())
            // Refresh tasks
            const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS)
            const taskList = Array.isArray(response.data) ? response.data : response.data.tasks || []
            setTasks(taskList)
        } catch (err) {
            setError('Failed to assign tasks: ' + (err.response?.data?.message || err.message))
        }
    }

    const handleBulkDelete = async () => {
        if (selectedTasks.size === 0) {
            setError('Please select at least one task')
            return
        }

        if (window.confirm(`Are you sure you want to delete ${selectedTasks.size} task(s)?`)) {
            try {
                await axiosInstance.delete(API_PATHS.BULK_OPERATIONS.DELETE_TASKS, {
                    data: { taskIds: Array.from(selectedTasks) }
                })
                setSuccessMessage(`Deleted ${selectedTasks.size} tasks`)
                setSelectedTasks(new Set())
                // Refresh tasks
                const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS)
                const taskList = Array.isArray(response.data) ? response.data : response.data.tasks || []
                setTasks(taskList)
            } catch (err) {
                setError('Failed to delete tasks: ' + (err.response?.data?.message || err.message))
            }
        }
    }

    return (
        <AdminLayout>
            <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Bulk Operations Manager</h1>
                <p className="text-gray-600 mb-8">Perform bulk actions on multiple tasks at once</p>

                {/* Messages */}
                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                        <button onClick={() => setError('')} className="ml-4 text-red-700 font-bold">✕</button>
                    </div>
                )}
                {successMessage && (
                    <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                        {successMessage}
                        <button onClick={() => setSuccessMessage('')} className="ml-4 text-green-700 font-bold">✕</button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filters */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Filters</h2>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search tasks..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="InProgress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                                <select
                                    value={filterPriority}
                                    onChange={(e) => setFilterPriority(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Priorities</option>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>

                            <div className="text-sm text-gray-600">
                                Selected: <span className="font-bold text-blue-600">{selectedTasks.size}</span> tasks
                            </div>
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Bulk Actions</h2>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select
                                    value={bulkStatus}
                                    onChange={(e) => setBulkStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="InProgress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>

                            <button
                                onClick={handleBulkUpdateStatus}
                                disabled={selectedTasks.size === 0}
                                className="w-full mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 flex items-center justify-center"
                            >
                                <LuCheck className="mr-2" size={18} /> Update Status
                            </button>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                                <select
                                    value={bulkPriority}
                                    onChange={(e) => setBulkPriority(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Priority</option>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>

                            <button
                                onClick={handleBulkUpdatePriority}
                                disabled={selectedTasks.size === 0}
                                className="w-full mb-4 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-gray-400 flex items-center justify-center"
                            >
                                <LuFlag className="mr-2" size={18} /> Update Priority
                            </button>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                                <input
                                    type="date"
                                    value={bulkDueDate}
                                    onChange={(e) => setBulkDueDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <button
                                onClick={handleBulkUpdateDueDate}
                                disabled={selectedTasks.size === 0}
                                className="w-full mb-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 flex items-center justify-center"
                            >
                                <LuClock className="mr-2" size={18} /> Update Due Date
                            </button>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
                                <select
                                    value={bulkAssignee}
                                    onChange={(e) => setBulkAssignee(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select User</option>
                                    {Array.isArray(users) && users.map(u => (
                                        <option key={u._id} value={u._id}>{u.name}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handleBulkAssign}
                                disabled={selectedTasks.size === 0}
                                className="w-full mb-4 px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 disabled:bg-gray-400 flex items-center justify-center"
                            >
                                Assign Tasks
                            </button>

                            <button
                                onClick={handleBulkDelete}
                                disabled={selectedTasks.size === 0}
                                className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400 flex items-center justify-center"
                            >
                                <LuTrash2 className="mr-2" size={18} /> Delete Selected
                            </button>
                        </div>
                    </div>

                    {/* Tasks Table */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="overflow-x-auto">
                                {loading ? (
                                    <div className="p-8 text-center">Loading tasks...</div>
                                ) : filteredTasks && filteredTasks.length > 0 ? (
                                    <table className="w-full">
                                        <thead className="bg-gray-100 border-b">
                                            <tr>
                                                <th className="p-4 text-left">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedTasks.size === filteredTasks.length && filteredTasks.length > 0}
                                                        onChange={handleSelectAll}
                                                        className="w-5 h-5"
                                                    />
                                                </th>
                                                <th className="p-4 text-left font-medium text-gray-700">Title</th>
                                                <th className="p-4 text-left font-medium text-gray-700">Status</th>
                                                <th className="p-4 text-left font-medium text-gray-700">Priority</th>
                                                <th className="p-4 text-left font-medium text-gray-700">Due Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredTasks.map(task => (
                                                <tr key={task._id} className="border-b hover:bg-gray-50">
                                                    <td className="p-4">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedTasks.has(task._id)}
                                                            onChange={() => handleSelectTask(task._id)}
                                                            className="w-5 h-5"
                                                        />
                                                    </td>
                                                    <td className="p-4 text-gray-800">{task.title}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded text-sm font-medium ${task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                            task.status === 'InProgress' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {task.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded text-sm font-medium ${task.priority === 'High' ? 'bg-red-100 text-red-800' :
                                                            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-green-100 text-green-800'
                                                            }`}>
                                                            {task.priority}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-gray-600">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-8 text-center text-gray-500">No tasks found</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
export default BulkOperationsTaskManager;
