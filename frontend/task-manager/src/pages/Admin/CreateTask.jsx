import React, { useContext, useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import { UserContext } from '../../context/userContext';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apiPaths';
import { useNavigate } from 'react-router-dom';
import { PRIORITY_DATA } from '../../utils/data';
import { IoAddCircle, IoTrash } from 'react-icons/io5';

const CreateTask = () => {
  useUserAuth();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: '',
    assignedTo: [],
    todoChecklist: []
  });

  const [users, setUsers] = useState([]);
  const [newTodoItem, setNewTodoItem] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
      setUsers(response.data || []);
    } catch (error) {
      console.error(' Error fetching users:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserSelect = (userId) => {
    setFormData(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(userId)
        ? prev.assignedTo.filter(id => id !== userId)
        : [...prev.assignedTo, userId]
    }));
  };

  const handleAddTodoItem = () => {
    if (!newTodoItem.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      todoChecklist: [
        ...prev.todoChecklist,
        { text: newTodoItem, completed: false }
      ]
    }));
    setNewTodoItem('');
  };

  const handleRemoveTodoItem = (index) => {
    setFormData(prev => ({
      ...prev,
      todoChecklist: prev.todoChecklist.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    if (!formData.dueDate) {
      setError('Due date is required');
      return;
    }
    if (formData.assignedTo.length === 0) {
      setError('Please assign at least one user');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(API_PATHS.TASKS.CREATE_TASK, formData);
      alert('Task created successfully!');
      navigate('/admin/tasks');
    } catch (error) {
      console.error(' Error creating task:', error);
      setError(error.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout activeMenu="Create Task">
      <div className="my-5 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Create New Task</h2>
            <p className="text-sm text-gray-500 mt-1">
              Fill in the details to create a new task
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter task title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter task description"
                rows="6"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />
            </div>

            {/* Priority & Due Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {PRIORITY_DATA.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                {formData.dueDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    Selected: {new Date(formData.dueDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                )}
              </div>
            </div>

            {/* Assign Users */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign To <span className="text-red-500">*</span>
              </label>
              <div className="border rounded-lg p-4 max-h-48 overflow-y-auto bg-gray-50">
                {users.length === 0 ? (
                  <p className="text-gray-500 text-sm">No users available</p>
                ) : (
                  users.map((u) => (
                    <label key={u._id} className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-white p-2 rounded transition">
                      <input
                        type="checkbox"
                        checked={formData.assignedTo.includes(u._id)}
                        onChange={() => handleUserSelect(u._id)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-sm">{u.name} <span className="text-gray-500">({u.email})</span></span>
                    </label>
                  ))
                )}
              </div>
              {formData.assignedTo.length > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ {formData.assignedTo.length} user{formData.assignedTo.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            {/* Todo Checklist */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Todo Checklist <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newTodoItem}
                  onChange={(e) => setNewTodoItem(e.target.value)}
                  placeholder="Add a checklist item"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTodoItem();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddTodoItem}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center gap-2"
                >
                  <IoAddCircle /> Add
                </button>
              </div>

              {formData.todoChecklist.length > 0 && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <p className="text-xs text-gray-600 mb-2 font-medium">
                    {formData.todoChecklist.length} item{formData.todoChecklist.length > 1 ? 's' : ''} in checklist
                  </p>
                  {formData.todoChecklist.map((item, index) => (
                    <div key={index} className="flex items-center justify-between mb-2 p-2 bg-white rounded shadow-sm">
                      <span className="text-sm flex-1">{item.text}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTodoItem(index)}
                        className="text-red-500 hover:text-red-700 ml-2"
                        title="Remove item"
                      >
                        <IoTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Task...' : 'Create Task'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/tasks')}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateTask;