import React, { useContext, useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import { UserContext } from '../../context/userContext';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apiPaths';
import { IoAddCircle, IoDownload, IoPencil, IoTrash, IoClose } from 'react-icons/io5';
import { addThousandsSeparator } from '../../utils/helper';

const ManageUsers = () => {
  useUserAuth();
  const { user } = useContext(UserContext);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member'
  });

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
      console.log('✅ Users fetched:', response.data);
      setUsers(response.data || []);
    } catch (error) {
      console.error(' Error fetching users:', error);
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleExportUsers = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.REPORTS.EXPORT_USERS, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'users_report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(' Error exporting users:', error);
      alert('Failed to export users');
    }
  };

  const handleOpenModal = (userToEdit = null) => {
    if (userToEdit) {
      setEditingUser(userToEdit);
      setFormData({
        name: userToEdit.name,
        email: userToEdit.email,
        password: '',
        role: userToEdit.role
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'member'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'member'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      alert('Name and email are required');
      return;
    }

    if (!editingUser && !formData.password) {
      alert('Password is required for new users');
      return;
    }

    try {
      if (editingUser) {
        // Update user
        const updateData = {
          name: formData.name,
          email: formData.email,
          role: formData.role
        };

        await axiosInstance.put(
          API_PATHS.USERS.UPDATE_USER(editingUser._id),
          updateData
        );
        alert('User updated successfully');
      } else {
        // Create user
        await axiosInstance.post(API_PATHS.USERS.CREATE_USER, formData);
        alert('User created successfully');
      }

      handleCloseModal();
      fetchUsers();
    } catch (error) {
      console.error(' Error saving user:', error);
      alert(error.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      await axiosInstance.delete(API_PATHS.USERS.DELETE_USER(userId));
      alert('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error(' Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  return (
    <DashboardLayout activeMenu="Team Members">
      <div className="my-5">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">Team Members</h2>
              <p className="text-sm text-gray-500 mt-1">
                Manage your team members and their roles
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleExportUsers}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center gap-2"
              >
                <IoDownload /> Export
              </button>
              <button
                onClick={() => handleOpenModal()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
              >
                <IoAddCircle /> Add Member
              </button>
            </div>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-500 mt-2">Loading users...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Pending</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">In Progress</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Completed</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-gray-500">
                        No users found. Click "Add Member" to create your first user.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u._id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-800">{u.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                            }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-800 font-semibold text-sm">
                            {addThousandsSeparator(u.pendingTask || 0)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-cyan-100 text-cyan-800 font-semibold text-sm">
                            {addThousandsSeparator(u.inProgressTasks || 0)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800 font-semibold text-sm">
                            {addThousandsSeparator(u.completedTasks || 0)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleOpenModal(u)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit User"
                            >
                              <IoPencil size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete User"
                            >
                              <IoTrash size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <IoClose size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@example.com"
                  required
                />
              </div>

              {!editingUser && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter password"
                    required={!editingUser}
                    minLength="6"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ManageUsers;