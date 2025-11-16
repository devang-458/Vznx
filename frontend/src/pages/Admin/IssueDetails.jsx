import React, { useContext, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useNavigate, useParams } from 'react-router-dom';
import useFetchData from '../../hooks/useFetchData';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/userContext';
import Button from '../../components/layouts/Button';
import axiosInstance from '../../utils/axiosinstance';
import { toast } from 'react-toastify';
import { FiZap } from 'react-icons/fi'; // For AI subtask generation

const ISSUE_STATUSES = ['To Do', 'In Progress', 'Done', 'Blocked', 'Review'];

const IssueDetails = () => {
  const { issueId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [deleting, setDeleting] = useState(false);
  const [generatingSubtasks, setGeneratingSubtasks] = useState(false);
  const [suggestedSubtasks, setSuggestedSubtasks] = useState([]);
  const [currentStatus, setCurrentStatus] = useState(issue?.status);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (issue) {
      setCurrentStatus(issue.status);
    }
  }, [issue]);

  const handleDeleteIssue = async () => {
    if (!window.confirm('Are you sure you want to delete this issue? This action cannot be undone.')) {
      return;
    }
    setDeleting(true);
    try {
      await axiosInstance.delete(API_PATHS.ISSUES.DELETE_ISSUE(issueId));
      toast.success('Issue deleted successfully!');
      // Navigate back to the project's Kanban board or issue list
      navigate(`/admin/projects/${issue.project._id}/kanban`);
    } catch (err) {
      console.error('Error deleting issue:', err);
      toast.error(err.response?.data?.message || 'Failed to delete issue.');
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setUpdatingStatus(true);
    try {
      await axiosInstance.put(API_PATHS.ISSUES.UPDATE_ISSUE_STATUS(issueId), { status: newStatus });
      setCurrentStatus(newStatus);
      toast.success(`Issue status updated to ${newStatus}`);
      refetchIssue(); // Refetch to update any other dependent data
    } catch (err) {
      console.error('Error updating issue status:', err);
      toast.error(err.response?.data?.message || 'Failed to update issue status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleGenerateSubtasks = async () => {
    if (!issue || issue.type !== 'Story') {
      toast.info('Sub-tasks can only be generated for "Story" type issues.');
      return;
    }
    setGeneratingSubtasks(true);
    try {
      const response = await axiosInstance.post(API_PATHS.ISSUES.GENERATE_SUBTASKS(issueId));
      setSuggestedSubtasks(response.data.subtasks);
      toast.success('Sub-tasks suggested by AI!');
    } catch (err) {
      console.error('Error generating subtasks:', err);
      toast.error(err.response?.data?.message || 'Failed to generate sub-tasks.');
    } finally {
      setGeneratingSubtasks(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeMenu="Projects">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading issue details...</p>
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

  if (!issue) {
    return (
      <DashboardLayout activeMenu="Projects">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Issue not found.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="Projects">
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{issue.title}</h1>
          <div className="flex gap-2">
            {issue.type === 'Story' && (
              <Button
                variant="secondary"
                onClick={handleGenerateSubtasks}
                disabled={generatingSubtasks}
                className="flex items-center gap-1"
              >
                {generatingSubtasks ? 'Generating...' : <><FiZap /> Generate Sub-tasks</>}
              </Button>
            )}
            {/* Placeholder for Edit Issue */}
            <Button variant="secondary" onClick={() => toast.info('Edit functionality coming soon!')}>
              Edit Issue
            </Button>
            <Button variant="danger" onClick={handleDeleteIssue} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete Issue'}
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Description</h2>
          <p className="text-gray-700">{issue.description || 'No description provided.'}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Project:</p>
              <p className="text-gray-800">{issue.project?.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Type:</p>
              <p className="text-gray-800">{issue.type}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Status:</p>
              <select
                value={currentStatus}
                onChange={handleStatusChange}
                className="input-field w-full mt-1"
                disabled={updatingStatus}
              >
                {ISSUE_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {updatingStatus && <p className="text-xs text-blue-500 mt-1">Updating status...</p>}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Priority:</p>
              <p className="text-gray-800">{issue.priority}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Assignee:</p>
              <p className="text-gray-800">{issue.assignee?.name || 'Unassigned'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Reporter:</p>
              <p className="text-gray-800">{issue.reporter?.name}</p>
            </div>
            {issue.parent_issue && (
              <div>
                <p className="text-sm font-medium text-gray-600">Parent Issue:</p>
                <p className="text-gray-800">{issue.parent_issue.title}</p>
              </div>
            )}
            {issue.dueDate && (
              <div>
                <p className="text-sm font-medium text-gray-600">Due Date:</p>
                <p className="text-gray-800">{new Date(issue.dueDate).toLocaleDateString()}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-600">Created At:</p>
              <p className="text-gray-800">{new Date(issue.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Last Updated:</p>
              <p className="text-gray-800">{new Date(issue.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {suggestedSubtasks.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Suggested Sub-tasks</h2>
            <ul className="list-disc list-inside space-y-1">
              {suggestedSubtasks.map((subtask, index) => (
                <li key={index} className="text-gray-700">{subtask}</li>
              ))}
            </ul>
            {/* TODO: Add functionality to create these subtasks */}
            <Button variant="primary" className="mt-4">Add Selected Sub-tasks</Button>
          </div>
        )}

        {/* TODO: Add comments section */}
      </div>
    </DashboardLayout>
  );
};

export default IssueDetails;
