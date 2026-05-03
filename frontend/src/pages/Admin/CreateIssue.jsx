import React, { useState, useContext, useEffect } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Input from '../../components/Inputs/Input';
import Button from '../../components/layouts/Button';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apiPaths';
import { toast } from 'react-toastify';
import useFetchData from '../../hooks/useFetchData';
import { UserContext } from '../../context/userContext';
import AITaskInput from '../../components/AITaskInput';

const ISSUE_TYPES = ['Story', 'Task', 'Bug', 'Epic'];
const ISSUE_STATUSES = ['To Do', 'In Progress', 'Done', 'Blocked', 'Review'];
const ISSUE_PRIORITIES = ['Low', 'Medium', 'High', 'Highest'];

const CreateIssue = () => {
  const { projectId: projectIdParam } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [selectedProjectId, setSelectedProjectId] = useState(projectIdParam || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState(ISSUE_TYPES[0]);
  const [status, setStatus] = useState(ISSUE_STATUSES[0]);
  const [priority, setPriority] = useState(ISSUE_PRIORITIES[1]);
  const [assigneeId, setAssigneeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAIInput, setShowAIInput] = useState(false);

  // Fetch all projects for the dropdown
  const { data: projectsData, loading: projectsLoading } = useFetchData(
    API_PATHS.PROJECTS.GET_ALL_PROJECTS,
    { initialData: [] }
  );

  // Fetch all users for assignee dropdown
  const { data: usersData, loading: usersLoading } = useFetchData(
    API_PATHS.USERS.GET_ALL_USERS,
    { initialData: [] }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) {
      toast.error('Please select a project');
      return;
    }
    setLoading(true);

    try {
      const response = await axiosInstance.post(API_PATHS.ISSUES.CREATE_ISSUE, {
        title,
        description,
        project: selectedProjectId,
        type,
        status,
        priority,
        assignee: assigneeId || null,
      });
      toast.success('Issue created successfully!');
      navigate(`/admin/issues/${response.data.issue._id || response.data.issue.id}`);
    } catch (error) {
      console.error('Error creating issue:', error);
      toast.error(error.response?.data?.message || 'Failed to create issue.');
    } finally {
      setLoading(false);
    }
  };

  const handleAICreationSuccess = (issue) => {
    toast.success('Issue created by AI!');
    navigate(`/admin/issues/${issue._id || issue.id}`);
  };

  return (
    <DashboardLayout activeMenu="Create Issue">
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 text-[#2563eb]">Create New Issue</h1>
          <Button 
            variant="secondary" 
            onClick={() => setShowAIInput(!showAIInput)}
            className="flex items-center gap-2"
          >
            {showAIInput ? 'Use Manual Form' : '✨ Use AI Input'}
          </Button>
        </div>

        {showAIInput ? (
          <div className="bg-white rounded-xl shadow-md p-8 border border-blue-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">AI Task Input</h2>
            <p className="text-gray-500 mb-6">Describe your task in natural language, and our AI will create the issue for you.</p>
            <AITaskInput 
              projectId={selectedProjectId} 
              onIssueCreated={handleAICreationSuccess} 
            />
            {!selectedProjectId && (
              <p className="mt-4 text-sm text-red-500 italic">* Please select a project first to use AI input for a specific project.</p>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">
                    Project <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="project"
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563eb] bg-white"
                    required
                  >
                    <option value="">Select a Project</option>
                    {projectsData.map(proj => (
                      <option key={proj._id} value={proj._id}>{proj.name}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief summary of the issue"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide detailed steps to reproduce or acceptance criteria..."
                    rows="5"
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                  ></textarea>
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563eb] bg-white"
                  >
                    {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563eb] bg-white"
                  >
                    {ISSUE_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563eb] bg-white"
                  >
                    {ISSUE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-1">
                    Assignee
                  </label>
                  <select
                    id="assignee"
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563eb] bg-white"
                  >
                    <option value="">Unassigned</option>
                    {usersData.map(u => (
                      <option key={u._id} value={u._id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-gray-100">
                <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || projectsLoading} 
                  className="bg-[#2563eb] hover:bg-blue-700 px-8"
                >
                  {loading ? 'Creating...' : 'Create Issue'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CreateIssue;
