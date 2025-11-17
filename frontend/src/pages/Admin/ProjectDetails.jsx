import React, { useContext, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useNavigate, useParams } from 'react-router-dom';
import useFetchData from '../../hooks/useFetchData';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/userContext';
import Button from '../../components/layouts/Button';
import axiosInstance from '../../utils/axiosinstance';
import { toast } from 'react-toastify';
import AITaskInput from '../../components/AITaskInput';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [deleting, setDeleting] = useState(false);

  const { data: project, loading, error, fetchData: refetchProject } = useFetchData(
    user && projectId ? API_PATHS.PROJECTS.GET_PROJECT_BY_ID(projectId) : null,
    { skip: !user || !projectId }
  );

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    setDeleting(true);
    try {
      await axiosInstance.delete(API_PATHS.PROJECTS.DELETE_PROJECT(projectId));
      toast.success('Project deleted successfully!');
      navigate('/admin/projects'); // Go back to project list
    } catch (err) {
      console.error('Error deleting project:', err);
      toast.error(err.response?.data?.message || 'Failed to delete project.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeMenu="Projects">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading project details...</p>
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

  if (!project) {
    return (
      <DashboardLayout activeMenu="Projects">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Project not found.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="Projects">
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate(`/admin/projects/${projectId}/issues`)}>
              View All Issues
            </Button>
            <Button variant="secondary" onClick={() => navigate(`/admin/projects/${projectId}/burndown-chart`)}>
              View Burndown Chart
            </Button>
            <Button variant="primary" onClick={() => navigate(`/admin/projects/${projectId}/create-issue`)}>
              Create Issue
            </Button>
            {/* Placeholder for Edit Project */}
            <Button variant="secondary" onClick={() => navigate(`/admin/edit-project/${projectId}`)}>
              Edit Project
            </Button>
            <Button variant="danger" onClick={handleDeleteProject} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete Project'}
            </Button>
          </div>
        </div>
        <div>
          
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Description</h2>
          <p className="text-gray-700">{project.description || 'No description provided.'}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">AI-Assisted Issue Creation</h2>
          <AITaskInput
            projectId={projectId}
            onIssueCreated={(issue) => toast.success(`AI created issue: ${issue.title}`)}
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Owner:</p>
              <p className="text-gray-800">{project.owner?.name} ({project.owner?.email})</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Created At:</p>
              <p className="text-gray-800">{new Date(project.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Last Updated:</p>
              <p className="text-gray-800">{new Date(project.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Members</h2>
          {project.members && project.members.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
              {project.members.map(member => (
                <li key={member._id} className="text-gray-700">{member.name} ({member.email})</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No members assigned to this project.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProjectDetails;
