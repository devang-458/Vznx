import React, { useState, useEffect, useContext } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { UserContext } from "../../context/userContext";
import axiosInstance from "../../utils/axiosinstance";
import { API_PATHS } from "../../utils/apiPaths";
import { LuCheck, LuFlag } from "react-icons/lu";
import TaskListTable from "../../components/TaskListTable";
import Input from "../../components/Inputs/Input";
import Button from "../../components/layouts/Button";
import useFetchData from "../../hooks/useFetchData";
import { IoTrash } from "react-icons/io5";

const BulkOperationsTaskManager = () => {
    const { data: tasksData, loading, error, fetchData: refetchTasks } = useFetchData(
        API_PATHS.TASKS.GET_ALL_TASKS,
        { initialData: [] }
    );

    const tasks = Array.isArray(tasksData) ? tasksData : tasksData?.tasks || [];
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [selectedTasks, setSelectedTasks] = useState(new Set());
    // const [loading, setLoading] = useState(true); // Removed, now from hook

    // Filters
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterPriority, setFilterPriority] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    // Bulk Inputs
    const [bulkStatus, setBulkStatus] = useState("");
    const [bulkPriority, setBulkPriority] = useState("");

    // useEffect(() => { // Removed, now handled by hook
    //     fetchTasks();
    // }, []);

    // const fetchTasks = async () => { // Removed, now handled by hook
    //     try {
    //         const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS);
    //         const taskList = Array.isArray(response.data)
    //             ? response.data
    //             : response.data.tasks || [];
    //         setTasks(taskList);
    //         setFilteredTasks(taskList);
    //     } catch (err) {
    //         setTasks([]);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // Filtering
    useEffect(() => {
        let filtered = tasks;

        if (filterStatus !== "all") {
            filtered = filtered.filter((t) => t.status === filterStatus);
        }

        if (filterPriority !== "all") {
            filtered = filtered.filter((t) => t.priority === filterPriority);
        }

        if (searchTerm) {
            filtered = filtered.filter(
                (t) =>
                    t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    t.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredTasks(filtered);
    }, [tasks, filterStatus, filterPriority, searchTerm]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedTasks(new Set(filteredTasks.map((t) => t._id)));
        } else {
            setSelectedTasks(new Set());
        }
    };

    const handleSelectTask = (taskId) => {
        const newSelected = new Set(selectedTasks);
        newSelected.has(taskId) ? newSelected.delete(taskId) : newSelected.add(taskId);
        setSelectedTasks(newSelected);
    };

    const runBulk = async (endpoint, payload, method = 'put') => {
        if (selectedTasks.size === 0) {
            alert("Select tasks first");
            return;
        }

        try {
            if (method === 'delete') {
                await axiosInstance.delete(endpoint, { data: payload });
            } else {
                await axiosInstance[method](endpoint, payload);
            }
            alert("Bulk operation successful");
            setSelectedTasks(new Set());
            refetchTasks(); // Call refetchTasks from the hook
        } catch (err) {
            alert("Bulk operation failed");
        }
    };

    return (
        <DashboardLayout activeMenu="Bulk Operations">
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Bulk Operations Manager</h1>
                    </div>

                    {/* Filters Section */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

                            <Input
                                type="text"
                                placeholder="Search tasks..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-field"
                            />

                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="input-field"
                            >
                                <option value="all">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="InProgress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>

                            <select
                                value={filterPriority}
                                onChange={(e) => setFilterPriority(e.target.value)}
                                className="input-field"
                            >
                                <option value="all">All Priority</option>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>

                            <div className="flex items-center font-semibold text-gray-700">
                                Selected: {selectedTasks.size}
                            </div>
                        </div>
                    </div>

                    {/* Bulk Action Section */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">

                        <select
                            value={bulkStatus}
                            onChange={(e) => setBulkStatus(e.target.value)}
                            className="input-field"
                        >
                            <option value="">Set Status</option>
                            <option value="Pending">Pending</option>
                            <option value="InProgress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>

                        <Button
                            className="flex items-center gap-2"
                            variant="primary"
                            onClick={() =>
                                runBulk(API_PATHS.BULK_OPERATIONS.UPDATE_STATUS, {
                                    taskIds: Array.from(selectedTasks),
                                    status: bulkStatus,
                                })
                            }
                        >
                            <LuCheck /> Update Status
                        </Button>

                        <select
                            value={bulkPriority}
                            onChange={(e) => setBulkPriority(e.target.value)}
                            className="input-field"
                        >
                            <option value="">Set Priority</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>

                        <Button
                            className="flex items-center gap-2"
                            variant="primary"
                            onClick={() =>
                                runBulk(API_PATHS.BULK_OPERATIONS.UPDATE_PRIORITY, {
                                    taskIds: Array.from(selectedTasks),
                                    priority: bulkPriority,
                                })
                            }
                        >
                            <LuFlag /> Update Priority
                        </Button>

                        <Button
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white"
                            variant="danger"
                            onClick={() => {
                                if (window.confirm("Are you sure you want to delete the selected tasks?")) {
                                    runBulk(API_PATHS.BULK_OPERATIONS.DELETE_TASKS, {
                                        taskIds: Array.from(selectedTasks),
                                    }, 'delete');
                                }
                            }}
                        >
                            <IoTrash /> Delete Selected
                        </Button>

                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <p className="text-gray-500">Loading tasks...</p>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-4">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    selectedTasks.size === filteredTasks.length &&
                                                    filteredTasks.length > 0
                                                }
                                                onChange={handleSelectAll}
                                            />
                                        </th>
                                        <th className="p-4">Title</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Priority</th>
                                        <th className="p-4">Due Date</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredTasks.length > 0 ? (
                                        filteredTasks.map((task) => (
                                            <tr key={task._id} className="border-b hover:bg-gray-50">
                                                <td className="p-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedTasks.has(task._id)}
                                                        onChange={() => handleSelectTask(task._id)}
                                                    />
                                                </td>
                                                <td className="p-4">{task.title}</td>
                                                <td className="p-4">{task.status}</td>
                                                <td className="p-4">{task.priority}</td>
                                                <td className="p-4">
                                                    {task.dueDate
                                                        ? new Date(task.dueDate).toLocaleDateString()
                                                        : "-"}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="p-6 text-center text-gray-500">
                                                No tasks found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>



                </div>
            </div>
        </DashboardLayout>
    );
};

export default BulkOperationsTaskManager;
