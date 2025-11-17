import React, { useState, useEffect, useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LuX, LuPencil, LuSave, LuPlus, LuMessageSquare, LuPaperclip } from 'react-icons/lu';
import { IoAlert, } from 'react-icons/io5';
import moment from 'moment';
import axiosInstance from '../utils/axiosinstance';
import { API_PATHS } from '../utils/apiPaths';
import { UserContext } from '../context/userContext';
import Input from './Inputs/Input';
import Button from './layouts/Button';
import { PRIORITY_DATA } from '../utils/data';
import TaskComments from './TaskComments'; // Assuming this component exists
import AssigneeDropdown from './AssigneeDropdown'; // Assuming this component exists
import useFetchData from '../hooks/useFetchData'; // To fetch task details and users
import { useNavigate } from 'react-router-dom';

const TaskDetailModal = ({ isOpen, onClose, taskId, onTaskUpdate, users }) => {
  const getStatusClasses = (status) => {
    switch (status) {
      case 'To Do': return 'bg-gray-200 text-gray-800';
      case 'In Progress': return 'bg-blue-200 text-blue-800';
      case 'Review': return 'bg-yellow-200 text-yellow-800';
      case 'Completed': return 'bg-green-200 text-green-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const getPriorityClasses = (priority) => {
    switch (priority) {
      case 'Low': return 'bg-green-100 text-green-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'High': return 'bg-red-100 text-red-700';
      case 'Highest': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const { user: currentUser } = useContext(UserContext);
  const navigate = useNavigate(); // Assuming navigate is available for creating issues

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [newAttachment, setNewAttachment] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [commentAddedTrigger, setCommentAddedTrigger] = useState(0); // To trigger refetch in TaskComments


  // Fetch task details when modal opens or taskId changes
  useEffect(() => {
    if (isOpen && taskId) {
      setLoading(true);
      setError(null);
      axiosInstance.get(API_PATHS.TASKS.GET_TASK_BY_ID(taskId))
        .then(response => {
          setTask(response.data);
          setFormData({
            title: response.data.title,
            description: response.data.description,
            priority: response.data.priority,
            dueDate: moment(response.data.dueDate).format('YYYY-MM-DD'),
            status: response.data.status,
            assignedTo: response.data.assignedTo.map(u => u._id || u), // Ensure it's just IDs
            attachments: response.data.attachments || [],
          });
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch task details:", err);
          setError("Failed to load task details.");
          setLoading(false);
        });
    } else if (!isOpen) {
      setTask(null); // Clear task data when modal closes
      setLoading(true);
      setError(null);
      setIsEditing(false);
      setNewAttachment(null);
      setNewComment('');
      setCommentAddedTrigger(0); // Reset trigger
    }
  }, [isOpen, taskId]);

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const updatedTask = await axiosInstance.put(API_PATHS.TASKS.UPDATE_TASK(taskId), formData);
      setTask(updatedTask.data.updatedTask); // Assuming API returns updated task
      if (onTaskUpdate && typeof onTaskUpdate === 'function') {
        onTaskUpdate(updatedTask.data.updatedTask); // Notify parent of update
      }
      setIsEditing(false);
      setLoading(false);
    } catch (err) {
      console.error("Failed to update task:", err);
      setError("Failed to save task changes.");
      setLoading(false);
    }
  };

  const handleAttachmentUpload = async () => {
    if (!newAttachment) return;

    const uploadData = new FormData();
    uploadData.append("attachment", newAttachment);

    try {
      setLoading(true);
      const response = await axiosInstance.post(
        API_PATHS.TASKS.UPLOAD_ATTACHMENT, // Assuming this path exists
        uploadData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const newAttachments = [...(formData.attachments || []), response.data.filePath];
      setFormData(prev => ({ ...prev, attachments: newAttachments }));
      const updatedTask = { ...task, attachments: newAttachments };
      setTask(updatedTask); // Update task state directly
      if (onTaskUpdate && typeof onTaskUpdate === 'function') {
        onTaskUpdate(updatedTask); // Notify parent of update
      }
      setNewAttachment(null);
      setLoading(false);
    } catch (err) {
      console.error("Failed to upload attachment:", err);
      setError("Failed to upload attachment.");
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      setLoading(true);
      await axiosInstance.post(API_PATHS.COMMENTS.ADD_COMMENT(taskId), { content: newComment });
      setNewComment('');
      setCommentAddedTrigger(prev => prev + 1); // Trigger refetch in TaskComments
      // Refetch task to get updated comments
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_TASK_BY_ID(taskId));
      setTask(response.data);
      if (onTaskUpdate && typeof onTaskUpdate === 'function') {
        onTaskUpdate(response.data); // Notify parent of update
      }
      setLoading(false);
    } catch (err) {
      console.error("Failed to add comment:", err);
      setError("Failed to add comment.");
      setLoading(false);
    }
  };

  const handleCreateIssue = () => {
    // Navigate to the create issue page, pre-filling task details
    navigate(`/admin/create-issue?taskId=${taskId}&taskTitle=${task?.title}`);
    onClose(); // Close the modal
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black bg-opacity-40"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-[95%] md:w-full md:max-w-3xl bg-white rounded-2xl shadow-xl p-4 md:p-6 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Task Details</h3>
              <Button variant="secondary" size="icon" onClick={onClose}>
                <LuX className="text-xl" />
              </Button>
            </div>

            {loading && <div className="text-center py-8">Loading task...</div>}
            {error && <div className="text-center py-8 text-red-500">{error}</div>}

            {task && (
              <>
                {/* Task Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 shrink-0">Title:</label>
                    {isEditing ? (
                      <Input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="block w-full"
                      />
                    ) : (
                      <p className="text-lg font-semibold text-gray-900">{task.title}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 shrink-0">Status:</label>
                    {isEditing ? (
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="block w-full border-gray-300 rounded-md shadow-sm"
                      >
                        {['Pending', 'In Progress', 'Completed', 'To Do'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    ) : (
                      <p className={`text-gray-800 px-2 py-1 rounded-full text-sm ${getStatusClasses(task.status)}`}>{task.status}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 shrink-0">Priority:</label>
                    {isEditing ? (
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="block w-full border-gray-300 rounded-md shadow-sm"
                      >
                        {PRIORITY_DATA.map(p => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                    ) : (
                      <p className={`text-gray-800 px-2 py-1 rounded-full text-sm ${getPriorityClasses(task.priority)}`}>{task.priority}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 shrink-0">Due Date:</label>
                    {isEditing ? (
                      <Input
                        type="date"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleInputChange}
                        className="block w-full"
                      />
                    ) : (
                      <p className="text-gray-800">{moment(task.dueDate).format('MMM D, YYYY')}</p>
                    )}
                  </div>
                  <div className="md:col-span-2 flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700 shrink-0">Description:</label>
                    {isEditing ? (
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        className="block w-full border-gray-300 rounded-md shadow-sm"
                      ></textarea>
                    ) : (
                      <p className="text-gray-800 whitespace-pre-wrap">{task.description}</p>
                    )}
                  </div>
                  <div className="md:col-span-2 flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700 shrink-0">Assigned To:</label>
                    {currentUser?.role === 'admin' && isEditing ? (
                      <AssigneeDropdown
                        users={users}
                        task={task}
                        onAssigneeChange={(newAssigneeId) => {
                          setFormData(prev => ({ ...prev, assignedTo: newAssigneeId ? [newAssigneeId] : [] }));
                          // This doesn't directly update the backend, only local form state.
                          // Actual backend update happens on save.
                        }}
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(task.assignedTo) && task.assignedTo.length > 0 ? (
                          task.assignedTo.map(assignedUser => (
                            <span key={assignedUser._id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <img
                                src={assignedUser.profileImageUrl || `https://ui-avatars.com/api/?name=${assignedUser.name}&background=random`}
                                alt={assignedUser.name}
                                className="w-4 h-4 rounded-full mr-1"
                              />
                              {assignedUser.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500">Unassigned</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Attachments */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Attachments</h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {task.attachments && task.attachments.length > 0 ? (
                      task.attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                          <LuPaperclip className="mr-1" /> {attachment.split('/').pop()}
                        </a>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No attachments.</p>
                    )}
                  </div>
                  {currentUser?.role === 'admin' && ( // Only admin can add attachments
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        onChange={(e) => setNewAttachment(e.target.files[0])}
                        className="grow"
                      />
                      <Button onClick={handleAttachmentUpload} disabled={!newAttachment || loading}>
                        <LuPlus className="mr-1" /> Upload
                      </Button>
                    </div>
                  )}
                </div>

                {/* Comments */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Comments</h4>
                  <TaskComments taskId={taskId} onCommentAdded={commentAddedTrigger} />
                  <div className="mt-4 flex items-center gap-2">
                    <Input
                      type="text"
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="grow"
                    />
                    <Button onClick={handleAddComment} disabled={!newComment.trim() || loading}>
                      <LuMessageSquare className="mr-1" />
                      Comment
                    </Button>
                  </div>
                </div>

                {/* Create Issue Button (Admin only for now, can be extended) */}
                {currentUser?.role === 'admin' && (
                  <div className="flex justify-end mt-4">
                    <Button variant="secondary" onClick={handleCreateIssue}>
                      <IoAlert className="mr-2" /> Create Related Issue
                    </Button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6">
                  {currentUser?.role === 'admin' && (
                    isEditing ? (
                      <Button onClick={handleSave} disabled={loading}>
                        <LuSave className="mr-2" /> Save
                      </Button>
                    ) : (
                      <Button onClick={() => setIsEditing(true)} disabled={loading}>
                        <LuPencil className="mr-2" /> Edit Task
                      </Button>
                    )
                  )}
                  <Button variant="secondary" onClick={onClose}>
                    Close
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TaskDetailModal;
