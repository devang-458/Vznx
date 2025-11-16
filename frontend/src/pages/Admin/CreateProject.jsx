import React, { useState, useEffect, useContext } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Inputs/Input';
import Button from '../../components/layouts/Button';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apiPaths';
import { toast } from 'react-toastify';
import useFetchData from '../../hooks/useFetchData'; // Assuming this hook is available
import { UserContext } from '../../context/userContext';

const CreateProject = () => {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(UserContext);

  // Fetch all users to populate the members dropdown
  const { data: usersData, loading: usersLoading, error: usersError } = useFetchData(
    API_PATHS.USERS.GET_ALL_USERS,
    { initialData: [] }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosInstance.post(API_PATHS.PROJECTS.CREATE_PROJECT, {
        name: projectName,
        description: projectDescription,
        members: selectedMembers,
      });
      toast.success('Project created successfully!');
      navigate('/admin/projects'); // Navigate back to project list
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(error.response?.data?.message || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedMembers((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMembers.length === usersData.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(usersData.map((user) => user._id));
    }
  };

  return (
    <DashboardLayout activeMenu="Create Project">
      <div className="p-4 md:p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Project</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="projectName"
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g., Website Redesign"
                    className="w-full"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="projectDescription"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="A brief overview of the project goals and scope."
                    rows="4"
                    className="w-full border h-64 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  ></textarea>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm  font-medium text-gray-700 mb-1">
                    Members
                  </label>
                  {usersLoading ? (
                    <p className="text-gray-500">Loading users...</p>
                  ) : usersError ? (
                    <p className="text-red-500">Error loading users: {usersError.message}</p>
                  ) : (
                    <div className="border rounded-lg p-4 max-h-85.5 overflow-y-auto bg-gray-50 space-y-2">
                      <label className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedMembers.length === usersData.length}
                          onChange={handleSelectAll}
                          className="w-4 h-4"
                        />
                        <span className="text-sm font-medium">Select All</span>
                      </label>
                      {usersData.map((u) => (
                        <label
                          key={u._id}
                          className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedMembers.includes(u._id)}
                            onChange={() => handleUserSelect(u._id)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm font-medium">
                            {u.name} <span className="text-gray-500">({u.email})</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={loading || usersLoading}
                variant="primary"
                className="w-full"
              >
                {loading ? 'Creating Project...' : 'Create Project'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateProject;
