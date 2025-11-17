import React, { useState } from 'react';
import { LuUser, LuCheck, LuChevronDown } from 'react-icons/lu';

const AssigneeDropdown = ({ users, task, onAssigneeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const assignedUser = Array.isArray(users) ? users.find(u => u._id === task.assignedTo?.[0]) : undefined;

  const handleSelect = (userId) => {
    onAssigneeChange(task._id, userId);
    setIsOpen(false);
  };

  return (
    <div className="relative mt-2">
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="flex items-center justify-between w-full px-3 py-1.5 text-xs text-left bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="flex items-center">
          {assignedUser ? (
            <>
              <img src={assignedUser.profileImageUrl || `https://ui-avatars.com/api/?name=${assignedUser.name}&background=random`} alt={assignedUser.name} className="w-4 h-4 rounded-full mr-2" />
              <span className="text-gray-800">{assignedUser.name}</span>
            </>
          ) : (
            <>
              <LuUser className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-gray-500">Unassigned</span>
            </>
          )}
        </div>
        <LuChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-48 overflow-y-auto">
          <ul className="py-1">
            <li
              onClick={(e) => { e.stopPropagation(); handleSelect(null); }}
              className="flex items-center px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              <LuUser className="w-4 h-4 mr-2 text-gray-500" />
              Unassigned
            </li>
            {users.map(user => (
              <li
                key={user._id}
                onClick={(e) => { e.stopPropagation(); handleSelect(user._id); }}
                className="flex items-center justify-between px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <div className="flex items-center">
                  <img src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} className="w-4 h-4 rounded-full mr-2" />
                  {user.name}
                </div>
                {assignedUser?._id === user._id && <LuCheck className="w-4 h-4 text-blue-600" />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AssigneeDropdown;
