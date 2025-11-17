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

const ISSUE_TYPES = ['Story', 'Task', 'Bug', 'Epic'];
const ISSUE_STATUSES = ['To Do', 'In Progress', 'Done', 'Blocked', 'Review'];
const ISSUE_PRIORITIES = ['Low', 'Medium', 'High', 'Highest'];

const CreateIssue = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(UserContext);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState(ISSUE_TYPES[0]);
  const [status, setStatus] = useState(ISSUE_STATUSES[0]);
  const [priority, setPriority] = useState(ISSUE_PRIORITIES[1]); // Default to Medium
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [parentIssueId, setParentIssueId] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const taskId = queryParams.get('taskId');
    const taskTitle = queryParams.get('taskTitle');

    if (taskTitle) {
      setTitle(`Related to: ${taskTitle}`);
    }
    if (taskId) {
      setDescription(`This issue is related to task ID: ${taskId}`);
      // Potentially set parentIssueId here if the backend supports linking issues this way
      // setParentIssueId(taskId); // This would require the backend to treat tasks as issues or have a specific related_task field
    }
  }, [location.search]);

  // Fetch users for assignee dropdown
  const { data: usersData, loading: usersLoading, error: usersError } = useFetchData(
    API_PATHS.USERS.GET_ALL_USERS,
    { initialData: [] }
  );

  // Fetch issues for parent issue dropdown (only for the current project)
  const { data: projectIssuesData, loading: projectIssuesLoading, error: projectIssuesError } = useFetchData(
    user && projectId ? API_PATHS.ISSUES.GET_ISSUES_BY_PROJECT(projectId) : null,
    { initialData: [], skip: !user || !projectId }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosInstance.post(API_PATHS.ISSUES.CREATE_ISSUE, {
        title,
        description,
        project: projectId,
        type,
        status,
        priority,
        assignee: assigneeId || null, // Send null if unassigned
        dueDate: dueDate || null, // Send null if no due date
        parent_issue: parentIssueId || null, // Send null if no parent
      });
      toast.success('Issue created successfully!');
      navigate(`/admin/projects/${projectId}/kanban`); // Navigate back to Kanban board
    } catch (error) {
      console.error('Error creating issue:', error);
      toast.error(error.response?.data?.message || 'Failed to create issue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout activeMenu="Projects">
      <div className="p-4 md:p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Issue for Project: {projectId}</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="issueTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="issueTitle"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Implement user authentication"
                className="w-full"
                required
              />
            </div>

            <div>
              <label htmlFor="issueDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="issueDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of the issue."
                rows="4"
                className="input-field w-full"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="issueType" className="block text-sm font-medium text-gray-700 mb-1">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="issueType"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="input-field w-full"
                >
                  {ISSUE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="issueStatus" className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="issueStatus"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="input-field w-full"
                >
                  {ISSUE_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="issuePriority" className="block text-sm font-medium text-gray-700 mb-1">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  id="issuePriority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="input-field w-full"
                >
                  {ISSUE_PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="issueAssignee" className="block text-sm font-medium text-gray-700 mb-1">
                  Assignee
                </label>
                {usersLoading ? (
                  <p className="text-gray-500">Loading assignees...</p>
                ) : usersError ? (
                  <p className="text-red-500">Error loading assignees.</p>
                ) : (
                  <select
                    id="issueAssignee"
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Unassigned</option>
                    {usersData.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label htmlFor="issueDueDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <Input
                  id="issueDueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="issueParent" className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Issue
                </label>
                {projectIssuesLoading ? (
                  <p className="text-gray-500">Loading issues...</p>
                ) : projectIssuesError ? (
                  <p className="text-red-500">Error loading issues.</p>
                ) : (
                  <select
                    id="issueParent"
                    value={parentIssueId}
                    onChange={(e) => setParentIssueId(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">No Parent</option>
                    {projectIssuesData.map((issue) => (
                      <option key={issue._id} value={issue._id}>
                        {issue.title} ({issue.type})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={loading || usersLoading || projectIssuesLoading}
                variant="primary"
                className="w-full"
              >
                {loading ? 'Creating Issue...' : 'Create Issue'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateIssue;
