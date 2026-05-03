import React, { useContext, useState, useEffect } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useNavigate, useParams } from 'react-router-dom';
import useFetchData from '../../hooks/useFetchData';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/userContext';
import Button from '../../components/layouts/Button';
import axiosInstance from '../../utils/axiosinstance';
import { toast } from 'react-toastify';
import { FiEdit2, FiCheck, FiX, FiTrash2, FiPlus, FiBarChart2, FiList } from 'react-icons/fi';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data: project, loading, error, fetchData: refetchProject } = useFetchData(
    user && projectId ? API_PATHS.PROJECTS.GET_PROJECT_BY_ID(projectId) : null,
    { skip: !user || !projectId }
  );

  const { data: issues, loading: issuesLoading, error: issuesError } = useFetchData(
    user && projectId ? API_PATHS.ISSUES.GET_ISSUES_BY_PROJECT(projectId) : null,
    { initialData: [], skip: !user || !projectId }
  );

  useEffect(() => {
    if (project) {
      setEditName(project.name);
      setEditDescription(project.description || '');
    }
  }, [project]);

  const handleUpdateProject = async () => {
    setUpdating(true);
    try {
      await axiosInstance.put(API_PATHS.PROJECTS.UPDATE_PROJECT(projectId), {
        name: editName,
        description: editDescription,
      });
      toast.success('Project updated successfully!');
      setIsEditing(false);
      refetchProject();
    } catch (err) {
      console.error('Error updating project:', err);
      toast.error(err.response?.data?.message || 'Failed to update project.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    setDeleting(true);
    try {
      await axiosInstance.delete(API_PATHS.PROJECTS.DELETE_PROJECT(projectId));
      toast.success('Project deleted successfully!');
      navigate('/admin/projects');
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563eb]"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !project) {
    return (
      <DashboardLayout activeMenu="Projects">
        <div className="p-6 text-center">
          <p className="text-red-500 mb-4">{error?.message || 'Project not found.'}</p>
          <Button onClick={() => navigate('/admin/projects')}>Back to Projects</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="Projects">
      <div className="p-4 md:p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-3xl font-bold text-gray-900 border-b-2 border-[#2563eb] focus:outline-none w-full"
              />
            ) : (
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            )}
            <div className="flex items-center gap-4 mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                project.status === 'Active' ? 'bg-green-100 text-green-700' : 
                project.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {project.status}
              </span>
              <span className="text-sm text-gray-500">Created {new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleUpdateProject} disabled={updating} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                  <FiCheck /> {updating ? 'Saving...' : 'Save'}
                </Button>
                <Button onClick={() => setIsEditing(false)} variant="secondary" className="flex items-center gap-2">
                  <FiX /> Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} variant="secondary" className="flex items-center gap-2">
                <FiEdit2 /> Edit
              </Button>
            )}
            <Button onClick={handleDeleteProject} disabled={deleting} variant="danger" className="flex items-center gap-2 bg-[#ef4444] hover:bg-red-700">
              <FiTrash2 /> {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate(`/admin/projects/${projectId}/create-issue`)} className="flex items-center gap-2 bg-[#2563eb]">
            <FiPlus /> Create Issue
          </Button>
          <Button onClick={() => navigate(`/admin/projects/${projectId}/kanban`)} variant="secondary" className="flex items-center gap-2">
            <FiList /> Kanban Board
          </Button>
          <Button onClick={() => navigate(`/admin/projects/${projectId}/burndown-chart`)} variant="secondary" className="flex items-center gap-2">
            <FiBarChart2 /> Burndown Report
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Description</h2>
              {isEditing ? (
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full border rounded-lg p-3 h-32 focus:ring-2 focus:ring-[#2563eb] outline-none"
                  placeholder="Describe the project goals..."
                />
              ) : (
                <p className="text-gray-600 leading-relaxed">
                  {project.description || 'No description provided.'}
                </p>
              )}
            </div>

            {/* Linked Issues */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Linked Issues</h2>
                <span className="text-sm font-medium text-[#2563eb]">{issues?.length || 0} Total</span>
              </div>
              {issuesLoading ? (
                <p className="text-gray-500">Loading issues...</p>
              ) : issues?.length > 0 ? (
                <div className="space-y-3">
                  {issues.map(issue => (
                    <div 
                      key={issue._id} 
                      onClick={() => navigate(`/admin/issues/${issue._id}`)}
                      className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${
                          issue.priority === 'Highest' ? 'bg-red-500' : 
                          issue.priority === 'High' ? 'bg-orange-500' : 'bg-blue-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{issue.title}</p>
                          <p className="text-xs text-gray-500">{issue.type} • {issue.status}</p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {issue.assignee?.name || 'Unassigned'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4 italic">No issues linked to this project.</p>
              )}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Project Members</h2>
              <div className="space-y-4">
                {project.members?.map(member => (
                  <div key={member._id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#2563eb] font-bold text-xs">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                  </div>
                ))}
                {(!project.members || project.members.length === 0) && (
                  <p className="text-gray-500 text-sm italic">No members assigned.</p>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Stats</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Issues</span>
                  <span className="font-bold text-gray-900">{issues?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">In Progress</span>
                  <span className="font-bold text-blue-600">
                    {issues?.filter(i => i.status === 'In Progress').length || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Completed</span>
                  <span className="font-bold text-green-600">
                    {issues?.filter(i => i.status === 'Done').length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProjectDetails;
