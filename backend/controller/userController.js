const Task = require("../models/Task.js");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'member' }).select("-password");
        const usersWithTaskCounts = await Promise.all(
            users.map(async (user) => {
                const pendingTask = await Task.countDocuments({
                    assignedTo: user._id,
                    status: 'Pending',
                })
                const inProgressTasks = await Task.countDocuments({
                    assignedTo: user._id,
                    status: "In Progress"
                })
                const completedTasks = await Task.countDocuments({
                    assignedTo: user._id,
                    status: "Completed"
                })

                return {
                    ...user._docs,
                    pendingTask,
                    inProgressTasks,
                    completedTasks
                }
            }))
    } catch (err) {
        res.status(500).json({
            message: "server error", error: error.messge
        })
    }
}

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ message: "user not found" })
        res.json(user);
    } catch (err) {

    }
}



module.exports = { getUsers, getUserById }