import React, { useContext } from 'react';
import { UserContext } from '../../context/userContext';
import AssigneeDropdown from '../AssigneeDropdown';

const TaskCard = ({ task, dragHandleProps, users, onAssigneeChange }) => {
  const { user: currentUser } = useContext(UserContext);

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 mb-3 border border-gray-200 flex items-start">
      <div {...dragHandleProps} className="cursor-grab pt-1 pr-2 text-gray-400 hover:text-gray-600">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 4H3V6H5V4Z" fill="currentColor" />
          <path d="M5 7H3V9H5V7Z" fill="currentColor" />
          <path d="M5 10H3V12H5V10Z" fill="currentColor" />
          <path d="M9 4H7V6H9V4Z" fill="currentColor" />
          <path d="M9 7H7V9H9V7Z" fill="currentColor" />
          <path d="M9 10H7V12H9V10Z" fill="currentColor" />
          <path d="M13 4H11V6H13V4Z" fill="currentColor" />
          <path d="M13 7H11V9H13V7Z" fill="currentColor" />
          <path d="M13 10H11V12H13V10Z" fill="currentColor" />
        </svg>
      </div>
      <div className="w-full">
        <h4 className="font-semibold text-sm text-gray-800">{task.title}</h4>
        <p className="text-xs text-gray-600 mt-1">{task.description}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            task.priority === 'High' ? 'bg-red-100 text-red-700' :
            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          }`}>
            {task.priority}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          {Array.isArray(task.assignedTo) && task.assignedTo.length > 0 ? (
            task.assignedTo.map(assignedUserId => {
              const assignedUser = users?.find(u => u._id === assignedUserId);
              return assignedUser ? (
                <div key={assignedUser._id} className="flex items-center">
                  <img
                    src={assignedUser.profileImageUrl || `https://ui-avatars.com/api/?name=${assignedUser.name}&background=random`}
                    alt={assignedUser.name}
                    className="w-5 h-5 rounded-full mr-1"
                  />
                  <span className="text-xs text-gray-700">
                    {assignedUser._id === currentUser?._id ? 'You' : assignedUser.name}
                  </span>
                </div>
              ) : null;
            })
          ) : (
            <span className="text-xs text-gray-500">Unassigned</span>
          )}
        </div>
        {currentUser?.role === 'admin' && (
          <AssigneeDropdown users={users} task={task} onAssigneeChange={onAssigneeChange} />
        )}
      </div>
    </div>
  );
};

export default TaskCard;
