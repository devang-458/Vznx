import React from 'react'
import moment from 'moment/moment';
import { IoPencil, IoTrash } from 'react-icons/io5';
import { Link } from 'react-router-dom';

// Assuming props are { tableData, onDelete, showActions }
const TaskListTable = ({ tableData, onDelete, showActions, userRole }) => {
    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-500 border border-green-200';
            case 'Pending': return 'bg-purple-100 text-purple-500 border border-purple-200';
            case 'In Progress': return 'bg-cyan-100 text-cyan-500 border border-cyan-200';
            default: return 'bg-gray-100 text-gray-500 border border-gray-200';
        }
    };

    const getPriorityBadgeColor = (priority) => {
        switch (priority) {
            case "High": return 'bg-red-100 text-red-500 border border-red-200';
            case "Medium": return 'bg-orange-100 text-orange-500 border border-orange-200';
            case "Low": return 'bg-green-100 text-green-500 border border-green-200';
            default: return 'bg-gray-100 text-gray-500 border border-gray-200';
        }
    }

    return (
        <div className='overflow-x-auto p-0 rounded-lg mt-3'>
            <table className='min-w-full divide-y divide-gray-200'>
                <thead>
                    <tr className='text-left bg-gray-50'>
                        <th className='py-3 px-4 text-gray-800 font-medium text-xs uppercase tracking-wider'>Name</th>
                        <th className='py-3 px-4 text-gray-800 font-medium text-xs uppercase tracking-wider'>Status</th>
                        <th className='py-3 px-4 text-gray-800 font-medium text-xs uppercase tracking-wider'>Priority</th>
                        <th className='py-3 px-4 text-gray-800 font-medium text-xs uppercase tracking-wider hidden md:table-cell'>Created On</th>
                        {showActions && (
                            <th className='py-3 px-4 text-gray-800 font-medium text-xs uppercase tracking-wider'>Actions</th>
                        )}
                    </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                    {/* FIX: Using implicit return () for map function */}
                    {tableData.map((task) => (
                        <tr key={task._id} className='hover:bg-gray-50'>
                            <td className='py-3 px-4 text-gray-700 text-sm line-clamp-1 max-w-xs'>
                                {task.title}
                            </td>
                            {/* FIX: Using <td> tag */}
                            <td className="py-3 px-4">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full inline-block ${getStatusBadgeColor(task.status)}`}>
                                    {task.status}
                                </span>
                            </td>
                            {/* FIX: Using <td> tag */}
                            <td className="py-3 px-4">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full inline-block ${getPriorityBadgeColor(task.priority)}`}>
                                    {task.priority}
                                </span>
                            </td>
                            {/* FIX: Using <td> tag */}
                            <td className="py-3 px-4 text-gray-700 text-xs text-nowrap hidden md:table-cell">
                                {task.createdAt ? moment(task.createdAt).format('Do MMM YYYY') : 'N/A'}
                            </td>

                            {showActions && (
                                <td className="py-3 px-4 text-sm text-gray-500 whitespace-nowrap">
                                    <div className='flex items-center space-x-2'>
                                        {/* Edit Link: Navigates to the CreateTask route, passing task ID as a query parameter for update */}
                                        <Link
                                            to={userRole === 'admin'
                                                ? `/admin/create-task?taskId=${task._id}`
                                                : `/user/tasks/${task._id}`  
                                            }
                                            className='text-blue-600 hover:text-blue-900'
                                            title='Edit Task'
                                        >
                                            <IoPencil className='w-4 h-4' />
                                        </Link>

                                        {/* Delete Button: Only shown if the onDelete function is passed (i.e., for Admin) */}
                                        {onDelete && userRole === 'admin' && (
                                            <button
                                                onClick={() => onDelete(task._id)}
                                                className='text-red-600 hover:text-red-900'
                                                title='Delete Task'
                                            >
                                                <IoTrash className='w-4 h-4' />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                    {tableData.length === 0 && (
                        <tr>
                            <td colSpan={showActions ? 5 : 4} className="text-center py-6 text-gray-500">
                                No tasks found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default TaskListTable;