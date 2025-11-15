const Task = require("../models/Task.js");
const { createActivity } = require("./activityController");

// Bulk update task status
const bulkUpdateStatus = async (req, res) => {
    try {
        const { taskIds, status } = req.body;

        if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
            return res.status(400).json({ message: "Invalid task IDs" });
        }

        if (!status || !['Pending', 'In Progress', 'Completed'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        // Check authorization
        const tasks = await Task.find({ _id: { $in: taskIds } });

        const authorized = tasks.every(task =>
            req.user.role === 'admin' ||
            task.assignedTo.some(userId => userId.toString() === req.user._id.toString())
        );

        if (!authorized) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Update all tasks
        const result = await Task.updateMany(
            { _id: { $in: taskIds } },
            { status }
        );

        // Log activities
        for (const task of tasks) {
            const activityType = status === 'Completed' ? 'task_completed' : 'task_status_changed';
            await createActivity(activityType, req.user._id, task._id, null, {
                oldValue: task.status,
                newValue: status,
                taskTitle: task.title
            });
        }

        res.status(200).json({
            message: "Tasks updated successfully",
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error("Error updating task status:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Bulk update task priority
const bulkUpdatePriority = async (req, res) => {
    try {
        const { taskIds, priority } = req.body;

        if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
            return res.status(400).json({ message: "Invalid task IDs" });
        }

        if (!priority || !['Low', 'Medium', 'High'].includes(priority)) {
            return res.status(400).json({ message: "Invalid priority" });
        }

        // Check authorization
        const tasks = await Task.find({ _id: { $in: taskIds } });

        const authorized = tasks.every(task =>
            req.user.role === 'admin' ||
            task.assignedTo.some(userId => userId.toString() === req.user._id.toString())
        );

        if (!authorized) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Update all tasks
        const result = await Task.updateMany(
            { _id: { $in: taskIds } },
            { priority }
        );

        // Log activities
        for (const task of tasks) {
            await createActivity('task_priority_changed', req.user._id, task._id, null, {
                oldValue: task.priority,
                newValue: priority,
                taskTitle: task.title
            });
        }

        res.status(200).json({
            message: "Tasks updated successfully",
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error("Error updating task priority:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Bulk assign tasks (admin only)
const bulkAssignTasks = async (req, res) => {
    try {
        const { taskIds, userIds } = req.body;

        if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
            return res.status(400).json({ message: "Invalid task IDs" });
        }

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ message: "Invalid user IDs" });
        }

        // Update tasks and add new assignees
        const updatedTasks = [];
        for (const taskId of taskIds) {
            const task = await Task.findById(taskId);
            if (!task) continue;

            // Add new users to assignedTo
            for (const userId of userIds) {
                if (!task.assignedTo.includes(userId)) {
                    task.assignedTo.push(userId);
                    await createActivity('task_assigned', req.user._id, task._id, userId, {
                        taskTitle: task.title
                    });
                }
            }

            await task.save();
            updatedTasks.push(task);
        }

        res.status(200).json({
            message: "Tasks assigned successfully",
            updatedTasks
        });
    } catch (error) {
        console.error("Error assigning tasks:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Bulk delete tasks (admin only)
const bulkDeleteTasks = async (req, res) => {
    try {
        const { taskIds } = req.body;

        if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
            return res.status(400).json({ message: "Invalid task IDs" });
        }

        // Get tasks before deletion for logging
        const tasks = await Task.find({ _id: { $in: taskIds } });

        // Log deletion activities
        for (const task of tasks) {
            await createActivity('task_deleted', req.user._id, task._id, null, {
                taskTitle: task.title
            });
        }

        // Delete tasks
        const result = await Task.deleteMany({ _id: { $in: taskIds } });

        res.status(200).json({
            message: "Tasks deleted successfully",
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error("Error deleting tasks:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Bulk update due date (admin only)
const bulkUpdateDueDate = async (req, res) => {
    try {
        const { taskIds, dueDate } = req.body;

        if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
            return res.status(400).json({ message: "Invalid task IDs" });
        }

        if (!dueDate || isNaN(new Date(dueDate).getTime())) {
            return res.status(400).json({ message: "Invalid due date" });
        }

        const result = await Task.updateMany(
            { _id: { $in: taskIds } },
            { dueDate: new Date(dueDate) }
        );

        res.status(200).json({
            message: "Due dates updated successfully",
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error("Error updating due dates:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    bulkUpdateStatus,
    bulkUpdatePriority,
    bulkAssignTasks,
    bulkDeleteTasks,
    bulkUpdateDueDate
};
