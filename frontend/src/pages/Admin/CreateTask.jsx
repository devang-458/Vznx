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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newTodoItem, setNewTodoItem] = useState("");

  useEffect(() => {
    const fetchData = async () => {
        try {
            const userRes = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
            setUsers(userRes.data || []);
            
            if (taskId) {
                const taskRes = await axiosInstance.get(API_PATHS.TASKS.GET_TASK_BY_ID(taskId));
                const task = taskRes.data;
                setFormData({
                    title: task.title || "",
                    description: task.description || "",
                    priority: task.priority || "Medium",
                    dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
                    assignedTo: task.assignedTo || [],
                    todoChecklist: task.todoChecklist || [],
                    attachments: task.attachments || [],
                    comment: task.comment || "",
                });
            }
        } catch (err) {
            setError("Failed to load initial data");
        }
    };
    fetchData();
  }, [taskId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (taskId) {
        await axiosInstance.put(API_PATHS.TASKS.UPDATE_TASK(taskId), formData);
      } else {
        await axiosInstance.post(API_PATHS.TASKS.CREATE_TASK, { ...formData, createdBy: user._id });
      }
      navigate("/admin/tasks");
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    const uploadData = new FormData();
    uploadData.append("attachment", file);
    try {
      const response = await axiosInstance.post("/api/tasks/upload-attachment", uploadData, { headers: { "Content-Type": "multipart/form-data" } });
      setFormData(prev => ({ ...prev, attachments: [...prev.attachments, response.data.filePath] }));
    } catch (e) { setError("Failed to upload"); }
  };

  return (
    <DashboardLayout activeMenu="New Task">
      <div className="p-8 bg-slate-50 min-h-screen">
        <div className="max-w-6xl mx-auto bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900 mb-8">{taskId ? "Edit Task" : "Create New Task"}</h1>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-8 gap-y-6">
            <div className="col-span-2">
              <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Task title" className="w-full text-lg font-bold border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500" required />
            </div>

            <div className="col-span-2">
              <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Description" className="w-full h-24 border border-slate-200 rounded-xl p-4 outline-none focus:border-blue-500" required />
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Priority</label>
                <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white text-sm">
                    {PRIORITY_DATA.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Due Date</label>
                <input type="date" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm" required />
            </div>

            <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Assignees</label>
                <div className="flex flex-wrap gap-2">
                    {users.map(u => (
                        <button key={u._id} type="button" onClick={() => setFormData({...formData, assignedTo: formData.assignedTo.includes(u._id) ? formData.assignedTo.filter(id => id !== u._id) : [...formData.assignedTo, u._id]})} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${formData.assignedTo.includes(u._id) ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                            {u.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Checklist</label>
                <div className="flex gap-2 mb-2">
                    <input type="text" value={newTodoItem} onChange={(e) => setNewTodoItem(e.target.value)} placeholder="Add item..." className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                    <button type="button" onClick={() => { if(newTodoItem) setFormData({...formData, todoChecklist: [...formData.todoChecklist, {text: newTodoItem, completed: false}]}); setNewTodoItem("")}} className="bg-slate-900 text-white px-4 rounded-xl"><IoAddCircle size={20} /></button>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                    {formData.todoChecklist.map((item, i) => <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-xs">{item.text}<button type="button" onClick={() => setFormData({...formData, todoChecklist: formData.todoChecklist.filter((_, idx) => idx !== i)})} className="text-slate-400 hover:text-red-500"><IoTrash /></button></div>)}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Comment</label>
                <textarea value={formData.comment} onChange={(e) => setFormData({...formData, comment: e.target.value})} className="w-full h-24 border border-slate-200 rounded-xl p-3 text-sm outline-none" placeholder="Task notes..." />
            </div>

            <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Attachments</label>
                <input type="file" onChange={(e) => handleFileUpload(e.target.files[0])} className="w-full text-sm border border-slate-200 rounded-xl p-3" />
            </div>

            <div className="col-span-2 pt-4 flex gap-4 justify-end">
                <button type="button" onClick={() => navigate(-1)} className="text-sm font-bold text-slate-600 px-6 py-3">Cancel</button>
                <button type="submit" disabled={loading} className="text-sm font-bold text-white bg-blue-600 px-8 py-3 rounded-xl shadow-lg shadow-blue-200">
                    {loading ? "Saving..." : "Save Task"}
                </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateTask;