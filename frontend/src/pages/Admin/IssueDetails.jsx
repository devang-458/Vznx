import React, { useContext, useState, useEffect } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useNavigate, useParams } from 'react-router-dom';
import useFetchData from '../../hooks/useFetchData';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/userContext';
import Button from '../../components/layouts/Button';
import axiosInstance from '../../utils/axiosinstance';
import { toast } from 'react-toastify';
import { FiZap, FiTrash2, FiArrowLeft, FiUser, FiActivity, FiTag, FiCalendar } from 'react-icons/fi';

const ISSUE_STATUSES = ['To Do', 'In Progress', 'Done', 'Blocked', 'Review'];

const IssueDetails = () => {
  const { issueId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  
  const [currentStatus, setCurrentStatus] = useState('');
  const [currentAssignee, setCurrentAssignee] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingAssignee, setUpdatingAssignee] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [generatingSubtasks, setGeneratingSubtasks] = useState(false);
  const [subtasks, setSubtasks] = useState([]);

  const { data: issue, loading, error, fetchData: refetchIssue } = useFetchData(
    user && issueId ? API_PATHS.ISSUES.GET_ISSUE_BY_ID(issueId) : null,
    { skip: !user || !issueId }
  );

  const { data: usersData } = useFetchData(
    API_PATHS.USERS.GET_ALL_USERS,
    { initialData: [] }
  );

  useEffect(() => {
    if (issue) {
      setCurrentStatus(issue.status);
      setCurrentAssignee(issue.assignee?._id || issue.assignee?.id || '');
    }
  }, [issue]);

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await axiosInstance.put(API_PATHS.ISSUES.UPDATE_ISSUE_STATUS(issueId), { status: newStatus });
      setCurrentStatus(newStatus);
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssigneeChange = async (newAssigneeId) => {
    setUpdatingAssignee(true);
    try {
      await axiosInstance.put(API_PATHS.ISSUES.UPDATE_ISSUE_ASSIGNEE(issueId), { assigneeId: newAssigneeId || null });
      setCurrentAssignee(newAssigneeId);
      toast.success('Assignee updated');
      refetchIssue();
    } catch (err) {
      toast.error('Failed to update assignee');
    } finally {
      setUpdatingAssignee(false);
    }
  };

  const handleGenerateSubtasks = async () => {
    setGeneratingSubtasks(true);
    try {
      const response = await axiosInstance.post(API_PATHS.ISSUES.GENERATE_SUBTASKS(issueId));
      setSubtasks(response.data.subtasks || []);
      toast.success('AI sub-tasks generated!');
    } catch (err) {
      toast.error('Failed to generate sub-tasks');
    } finally {
      setGeneratingSubtasks(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this issue permanently?')) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(API_PATHS.ISSUES.DELETE_ISSUE(issueId));
      toast.success('Issue deleted');
      navigate(`/admin/projects/${issue.project._id || issue.project.id}/kanban`);
    } catch (err) {
      toast.error('Failed to delete issue');
      setDeleting(false);
    }
  };

  if (loading) return <DashboardLayout activeMenu="Projects"><div className="p-10 text-center">Loading...</div></DashboardLayout>;
  if (error || !issue) return <DashboardLayout activeMenu="Projects"><div className="p-10 text-center text-red-500">Error loading issue</div></DashboardLayout>;

  return (
    <DashboardLayout activeMenu="Projects">
      <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
        {/* Navigation */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-[#2563eb] transition-colors"
        >
          <FiArrowLeft /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <span className="px-2 py-1 bg-blue-50 text-[#2563eb] text-xs font-bold rounded uppercase tracking-wider">
                  {issue.type}
                </span>
                <div className="flex gap-2 text-xs text-gray-400">
                  <span>ID: {issueId.slice(-6)}</span>
                  <span>•</span>
                  <span>Created {new Date(issue.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{issue.title}</h1>
              <div className="prose max-w-none">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {issue.description || 'No description provided.'}
                </p>
              </div>
            </div>

            {/* AI Sub-tasks Section */}
            {issue.type === 'Story' && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <FiZap className="text-yellow-500" />
                    <h2 className="text-lg font-semibold text-gray-800">AI Suggested Sub-tasks</h2>
                  </div>
                  <Button 
                    onClick={handleGenerateSubtasks} 
                    disabled={generatingSubtasks}
                    className="bg-[#2563eb] text-xs py-1"
                  >
                    {generatingSubtasks ? 'Generating...' : 'Regenerate'}
                  </Button>
                </div>

                {subtasks.length > 0 ? (
                  <div className="space-y-3">
                    {subtasks.map((st, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <input type="checkbox" className="w-4 h-4 text-[#2563eb] rounded" />
                        <span className="text-sm text-gray-700">{st}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-xl">
                    <p className="text-gray-400 text-sm mb-4">No sub-tasks generated yet.</p>
                    <Button 
                      variant="secondary" 
                      onClick={handleGenerateSubtasks}
                      disabled={generatingSubtasks}
                    >
                      {generatingSubtasks ? 'Generating...' : 'Click to Generate with AI'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Sidebar Stats */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
              {/* Status Section */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block flex items-center gap-2">
                  <FiActivity /> Status
                </label>
                <select
                  value={currentStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updatingStatus}
                  className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#2563eb] outline-none bg-gray-50 font-medium"
                >
                  {ISSUE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Assignee Section */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block flex items-center gap-2">
                  <FiUser /> Assignee
                </label>
                <select
                  value={currentAssignee}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  disabled={updatingAssignee}
                  className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#2563eb] outline-none bg-gray-50 font-medium"
                >
                  <option value="">Unassigned</option>
                  {usersData?.map(u => (
                    <option key={u._id} value={u._id}>{u.name}</option>
                  ))}
                </select>
              </div>

              {/* Priority & Details */}
              <div className="pt-4 border-t border-gray-50 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-2"><FiTag /> Priority</span>
                  <span className={`font-bold ${
                    issue.priority === 'Highest' ? 'text-red-600' : 
                    issue.priority === 'High' ? 'text-orange-600' : 'text-blue-600'
                  }`}>{issue.priority}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-2"><FiCalendar /> Project</span>
                  <span className="font-medium text-gray-700">{issue.project?.name}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-gray-50">
                <Button 
                  onClick={handleDelete} 
                  disabled={deleting}
                  variant="danger" 
                  className="w-full flex items-center justify-center gap-2 bg-[#ef4444]"
                >
                  <FiTrash2 /> {deleting ? 'Deleting...' : 'Delete Issue'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default IssueDetails;
