import React, { useContext } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import { UserContext } from '../../context/userContext';
import useFetchData from '../../hooks/useFetchData';
import { API_PATHS } from '../../utils/apiPaths';
import Button from '../../components/layouts/Button';
import { useNavigate } from 'react-router-dom';
import { IoAddCircle } from 'react-icons/io5';

const ProjectList = () => {
  useUserAuth();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const { data: projects, loading, error, fetchData: refetchProjects } = useFetchData(
    user ? API_PATHS.PROJECTS.GET_ALL_PROJECTS : null, // Assuming API_PATHS.PROJECTS.GET_ALL_PROJECTS exists
    { initialData: [], skip: !user }
  );

  const handleCreateProject = () => {
    navigate('/admin/create-project'); // Navigate to a project creation page
  };

  if (loading) {
    return (
      <DashboardLayout activeMenu="Projects">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading projects...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout activeMenu="Projects">
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">Error: {error.message}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="Projects">
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          {user?.role === 'admin' && ( // Only admin can create projects
            <Button
              onClick={handleCreateProject}
              variant="primary"
              className="flex items-center gap-2"
            >
              <IoAddCircle /> Create New Project
            </Button>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl text-gray-300 mb-4">📂</div>
            <p className="text-gray-500 text-lg">No projects found.</p>
            <p className="text-gray-400 text-sm mt-2">
              Start by creating your first project!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project._id} className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{project.name}</h2>
                <p className="text-gray-600 text-sm mb-4">{project.description || 'No description provided.'}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-1">Owner:</span>
                  <span className="font-medium">{project.owner?.name || 'N/A'}</span>
                </div>
                {/* Add more project details here if needed */}
                <div className="mt-4 flex justify-between">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(user?.role === 'admin' ? `/admin/projects/${project._id}/kanban` : `/user/projects/${project._id}/kanban`)}
                  >
                    Kanban
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(user?.role === 'admin' ? `/admin/projects/${project._id}` : `/user/projects/${project._id}`)} // Navigate to project details based on role
                  >
                    View Project
                  </Button>
                  {user?.role === 'admin' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/edit-project/${project._id}`)}
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProjectList;
