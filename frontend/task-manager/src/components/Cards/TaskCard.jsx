import React from 'react';
import { IoCalendarOutline, IoPersonOutline, IoCheckmarkCircle } from 'react-icons/io5';
import moment from 'moment';

const TaskCard = ({ task, onClick }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-500';
      case 'In Progress':
        return 'bg-cyan-500';
      case 'Pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const progress = task.progress || 0;
  const completedTodos = task.completedTodoCount || 0;
  const totalTodos = task.todoChecklist?.length || 0;

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 cursor-pointer border border-gray-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-lg text-gray-800 flex-1 pr-2">
          {task.title}
        </h3>
        <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {task.description}
      </p>

      {/* Progress Bar */}
      {totalTodos > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600 font-medium">Progress</span>
            <span className="text-xs font-semibold text-gray-700">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${getStatusColor(task.status)}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center gap-1 mt-1">
            <IoCheckmarkCircle className="text-gray-500 text-xs" />
            <span className="text-xs text-gray-500">
              {completedTodos} of {totalTodos} tasks completed
            </span>
          </div>
        </div>
      )}

      {/* Status Badge */}
      <div className="mb-3">
        <span className={`inline-flex items-center text-xs px-3 py-1 rounded-full text-white ${getStatusColor(task.status)}`}>
          {task.status}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <IoCalendarOutline />
          <span>Due: {moment(task.dueDate).format('MMM DD, YYYY')}</span>
        </div>
        {task.assignedTo && task.assignedTo.length > 0 && (
          <div className="flex items-center gap-1">
            <IoPersonOutline />
            <span>{task.assignedTo.length} assigned</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;