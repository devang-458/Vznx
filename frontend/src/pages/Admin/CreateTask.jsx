// Improved Create Task UI with cleaner layout, better spacing, modern design, and optimized structure.
// NOTE: Replace your old component with this version.

import React, { useContext, useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useUserAuth } from "../../hooks/useUserAuth";
import { UserContext } from "../../context/userContext";
import axiosInstance from "../../utils/axiosinstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PRIORITY_DATA } from "../../utils/data";
import { IoAddCircle, IoTrash } from "react-icons/io5";


const CreateTask = () => {
  useUserAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useContext(UserContext);
  const taskId = searchParams.get("taskId");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    assignedTo: [],
    todoChecklist: [],
    attachments: [],
    comment: "",
  });

  const [users, setUsers] = useState([]);
  const [newTodoItem, setNewTodoItem] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetchUsers();
    if (taskId) {
      fetchTaskData(taskId);
      setIsEditMode(true);
    }
  }, [taskId]);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
      setUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchTaskData = async (id) => {
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_TASK_BY_ID(id));
      const task = response.data;

      setFormData({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "Medium",
        dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
        assignedTo: Array.isArray(task.assignedTo)
          ? task.assignedTo.map((u) => (typeof u === "object" ? u._id : u))
          : [],
        todoChecklist: task.todoChecklist || [],
        attachments: task.attachments || [],
        comment: task.comment || "",
      });
    } catch (error) {
      console.error("Error fetching task:", error);
      setError("Failed to load task details");
    }
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUserSelect = (userId) => {
    setFormData((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(userId)
        ? prev.assignedTo.filter((id) => id !== userId)
        : [...prev.assignedTo, userId],
    }));
  };

  const handleAddTodoItem = () => {
    if (!newTodoItem.trim()) return;

    setFormData((prev) => ({
      ...prev,
      todoChecklist: [...prev.todoChecklist, { text: newTodoItem, completed: false }],
    }));

    setNewTodoItem("");
  };

  const handleRemoveTodoItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      todoChecklist: prev.todoChecklist.filter((_, i) => i !== index),
    }));
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("attachment", file);

    try {
      setLoading(true);

      const response = await axiosInstance.post(
        "/api/tasks/upload-attachment",
        uploadData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setFormData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, response.data.filePath],
      }));
    } catch (error) {
      console.error("Upload error:", error);
      setError("Failed to upload file");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAttachment = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) return setError("Title is required");
    if (!formData.description.trim()) return setError("Description is required");
    if (!formData.dueDate) return setError("Due date is required");
    if (formData.assignedTo.length === 0) return setError("Please assign at least one user");

    try {
      setLoading(true);

      if (isEditMode && taskId) {
        await axiosInstance.put(API_PATHS.TASKS.UPDATE_TASK(taskId), formData);
        alert("Task updated successfully!");
      } else {
        await axiosInstance.post(API_PATHS.TASKS.CREATE_TASK, {
          ...formData,
          createdBy: user._id,
        });
        alert("Task created successfully!");
      }

      navigate("/admin/tasks");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout activeMenu="Create Task">
      <div className="min-h-0 bg-gray-50 p-6">

        <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-10 border border-gray-100 space-y-10">

          {/* Page Title */}
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? "Edit Task" : "Create New Task"}
          </h1>

          {error && (
            <div className="p-4 bg-red-100 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-10">

            {/* Row 1 – Title, Priority, Date */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority *</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {PRIORITY_DATA.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date *</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </section>

            {/* Row 2 – Description + Assign */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">

              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 border rounded-lg max-h-32 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Assign To *</label>
                <div className="border rounded-lg p-4 max-h-40 overflow-y-auto bg-gray-50 space-y-2">
                  {users.map((u) => (
                    <label
                      key={u._id}
                      className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.assignedTo.includes(u._id)}
                        onChange={() => handleUserSelect(u._id)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">
                        {u.name} <span className="text-gray-500">({u.email})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </section>

            {/* Row 3 – Checklist + comment */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">

              <div className="space-y-3">
                <label className="text-sm font-medium">Todo Checklist</label>

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newTodoItem}
                    onChange={(e) => setNewTodoItem(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg"
                    placeholder="Add item"
                  />
                  <button
                    type="button"
                    onClick={handleAddTodoItem}
                    className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <IoAddCircle className="mr-1" /> Add
                  </button>
                </div>

                {formData.todoChecklist.length > 0 && (
                  <div className="bg-gray-50 border p-4 rounded-lg space-y-2 max-h-40 overflow-y-auto">
                    {formData.todoChecklist.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white p-2 rounded shadow-sm"
                      >
                        <span className="text-sm">{item.text}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTodoItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <IoTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Comment</label>
                <textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  rows="5"
                  className="w-full px-4 py-3 border rounded-lg max-h-32 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </section>

            {/* Attachments */}
            <section className="space-y-4">
              <label className="text-sm font-medium">Attachments</label>

              <input
                type="file"
                onChange={(e) => handleFileUpload(e.target.files[0])}
                className="px-3 py-2 border rounded-lg w-full"
              />

              {formData.attachments.length > 0 && (
                <div className="bg-gray-50 border p-4 rounded-lg space-y-2">
                  {formData.attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white p-2 rounded shadow-sm text-sm"
                    >
                      <a href={file} target="_blank" className="text-blue-600 underline">
                        {file}
                      </a>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <IoTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
              >
                {loading ? (isEditMode ? "Updating..." : "Creating...") : isEditMode ? "Update Task" : "Create Task"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin/tasks")}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>

        </div>
      </div>
    </DashboardLayout>
  );
};


export default CreateTask;