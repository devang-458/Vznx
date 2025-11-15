const Task = require("../models/Task");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { createActivity } = require("./activityController");

/**
 * Get all users with task counts
 */
const getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } }).select("-password");
        const usersWithTaskCounts = await Promise.all(
            users.map(async (user) => {
                const pendingTask = await Task.countDocuments({
                    assignedTo: user._id,
                    status: 'Pending',
                });
                const inProgressTasks = await Task.countDocuments({
                    assignedTo: user._id,
                    status: "In Progress"
                });
                const completedTasks = await Task.countDocuments({
                    assignedTo: user._id,
                    status: "Completed"
                });

                return {
                    ...user._doc,
                    pendingTask,
                    inProgressTasks,
                    completedTasks
                };
            })
        );
        res.json(usersWithTaskCounts);
    } catch (error) {
        res.status(500).json({
            message: "server error", error: error.message
        });
    }
};

/**
 * Get user by ID
 */
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ message: "user not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({
            message: "server error",
            error: error.message
        });
    }
};

/**
 * Create new user (Admin only)
 */
const createUser = async (req, res) => {
    try {
        const { name, email, password, role, profileImageUrl } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User with this email already exists"
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'member',
            profileImageUrl: profileImageUrl || null
        });

        // Log activity
        await createActivity(
            'user_joined',
            req.user._id,
            null,
            user._id,
            { userName: user.name }
        );

        res.status(201).json({
            message: "User created successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImageUrl: user.profileImageUrl
            }
        });

    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

/**
 * Update user (Admin only)
 */
const updateUser = async (req, res) => {
    try {
        const { name, email, role } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if email is being changed and if it's already taken
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    message: "Email already in use"
                });
            }
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;

        await user.save();

        res.json({
            message: "User updated successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImageUrl: user.profileImageUrl
            }
        });

    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

/**
 * Delete user (Admin only)
 */
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if user has assigned tasks
        const assignedTasksCount = await Task.countDocuments({
            assignedTo: user._id,
            status: { $ne: 'Completed' }
        });

        if (assignedTasksCount > 0) {
            return res.status(400).json({
                message: `Cannot delete user with ${assignedTasksCount} active task(s). Please reassign or complete them first.`
            });
        }

        await user.deleteOne();

        res.json({
            message: "User deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

/**
 * Get user statistics
 */
const getUserStats = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Get task statistics
        const totalTasks = await Task.countDocuments({ assignedTo: userId });
        const pendingTasks = await Task.countDocuments({ 
            assignedTo: userId, 
            status: 'Pending' 
        });
        const inProgressTasks = await Task.countDocuments({ 
            assignedTo: userId, 
            status: 'In Progress' 
        });
        const completedTasks = await Task.countDocuments({ 
            assignedTo: userId, 
            status: 'Completed' 
        });

        // Get overdue tasks
        const overdueTasks = await Task.countDocuments({
            assignedTo: userId,
            status: { $ne: 'Completed' },
            dueDate: { $lt: new Date() }
        });

        // Calculate completion rate
        const completionRate = totalTasks > 0 
            ? Math.round((completedTasks / totalTasks) * 100) 
            : 0;

        // Get recent completed tasks (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentCompletions = await Task.countDocuments({
            assignedTo: userId,
            status: 'Completed',
            updatedAt: { $gte: sevenDaysAgo }
        });

        res.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImageUrl: user.profileImageUrl
            },
            statistics: {
                totalTasks,
                pendingTasks,
                inProgressTasks,
                completedTasks,
                overdueTasks,
                completionRate,
                recentCompletions
            }
        });

    } catch (error) {
        console.error("Error fetching user stats:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = { 
    getUsers, 
    getUserById, 
    createUser, 
    updateUser, 
    deleteUser,
    getUserStats 
};