import React from 'react'
import moment from 'moment/moment';
import { IoPencil, IoTrash } from 'react-icons/io5';
import { LuSquareArrowRight } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import Button from './layouts/Button';

const TaskListTable = ({ tableData, onDelete, showActions, userRole, onRowClick }) => {
    const navigate = useNavigate();

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-100 text-emerald-600';
            case 'Pending': return 'bg-indigo-100 text-indigo-600';        
            case 'In Progress': return 'bg-sky-100 text-sky-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getPriorityBadgeColor = (priority) => {
        switch (priority) {
            case "High": return 'text-rose-600';
            case "Medium": return 'text-amber-600';
            case "Low": return 'text-emerald-600';
            default: return 'text-gray-600';
        }
    }

    const handleEdit = (e, taskId) => {
        e.stopPropagation();
        if (userRole === 'admin') {
            navigate(`/admin/create-task?taskId=${taskId}`);
        } else {
            navigate(`/user/tasks/${taskId}`);
        }
    };

    const handleDelete = (e, taskId) => {
        e.stopPropagation();
        if (onDelete) onDelete(taskId);
    };

    return (
        <div className='w-full'>
            <table className='w-full border-separate border-spacing-y-2'>
                <thead>
                    <tr className='text-left'>
                        <th className='pb-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]'>Deliverable</th>
                        <th className='pb-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]'>Status</th>
                        <th className='pb-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]'>Priority</th>
                        <th className='pb-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hidden md:table-cell'>Timeline</th>
                        {showActions && (
                            <th className='pb-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right'>Actions</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {tableData && tableData.length > 0 ? tableData.map((task) => (
                        <tr 
                            key={task._id} 
                            onClick={() => onRowClick && onRowClick(task)}
                            className='group bg-white hover:bg-gray-50/80 transition-all cursor-pointer'
                        >
                            <td className='py-4 px-4 rounded-l-2xl border-y border-l border-gray-100 group-hover:border-blue-100'>  
                                <p className='text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors truncate max-w-[200px] md:max-w-xs'>
                                    {task.title}
                                </p>
                            </td>
                            <td className="py-4 px-4 border-y border-gray-100 group-hover:border-blue-100">
                                <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-tight rounded-lg inline-block ${getStatusBadgeColor(task.status)}`}>
                                    {task.status}
                                </span>
                            </td>
                            <td className="py-4 px-4 border-y border-gray-100 group-hover:border-blue-100">
                                <div className='flex items-center gap-1.5'>
                                    <div className={`w-1.5 h-1.5 rounded-full ${
                                        task.priority === 'High' ? 'bg-rose-500' : 
                                        task.priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`} />
                                    <span className={`text-xs font-bold ${getPriorityBadgeColor(task.priority)}`}>
                                        {task.priority}
                                    </span>
                                </div>
                            </td>
                            <td className="py-4 px-4 border-y border-gray-100 group-hover:border-blue-100 text-gray-500 text-[11px] font-bold hidden md:table-cell">
                                {task.createdAt ? moment(task.createdAt).format('MMM D, YYYY') : 'N/A'}
                            </td>

                            {showActions ? (
                                <td className="py-4 px-4 rounded-r-2xl border-y border-r border-gray-100 group-hover:border-blue-100 text-right">  
                                    <div className='flex items-center justify-end gap-1'>
                                        <Button
                                            onClick={(e) => handleEdit(e, task._id)}
                                            variant="ghost"
                                            size="sm"
                                            className='text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-xl transition-all'
                                        >
                                            <IoPencil className='w-3.5 h-3.5' />
                                        </Button>
                                        {onDelete && (
                                            <Button
                                                onClick={(e) => handleDelete(e, task._id)}
                                                variant="ghost"
                                                size="sm"
                                                className='text-gray-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition-all'
                                            >
                                                <IoTrash className='w-3.5 h-3.5' />
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            ) : (
                                <td className="py-4 px-4 rounded-r-2xl border-y border-r border-gray-100 group-hover:border-blue-100 text-right">
                                    <LuSquareArrowRight className='inline-block text-gray-300 group-hover:text-blue-600 transition-colors' />
                                </td>
                            )}
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={showActions ? 5 : 4} className="text-center py-12 text-gray-400 italic text-sm">
                                No deliverables found in this stream.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default TaskListTable;
