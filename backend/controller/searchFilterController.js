const Task = require("../models/Task.js");
const User = require("../models/User.js");

// Advanced task search
const searchTasks = async (req, res) => {
    try {
        const {
            query = '',
            status = '',
            priority = '',
            assignedTo = '',
            dueDateFrom = '',
            dueDateTo = '',
            overdue = 'false',
            sortBy = 'createdAt',
            sortOrder = 'desc',
            page = 1,
            limit = 10
        } = req.query;

        const filter = {};
        const userId = req.user._id;

        // For non-admin users, filter by assigned tasks
        if (req.user.role !== 'admin') {
            filter.assignedTo = userId;
        }

        // Text search
        if (query) {
            filter.$or = [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ];
        }

        // Status filter
        if (status) filter.status = status;

        // Priority filter
        if (priority) filter.priority = priority;

        // Assigned to filter
        if (assignedTo) filter.assignedTo = assignedTo;

        // Date range filter
        if (dueDateFrom || dueDateTo) {
            filter.dueDate = {};
            if (dueDateFrom) filter.dueDate.$gte = new Date(dueDateFrom);
            if (dueDateTo) filter.dueDate.$lte = new Date(dueDateTo);
        }

        // Overdue filter
        if (overdue === 'true') {
            filter.status = { $ne: 'Completed' };
            filter.dueDate = { $lt: new Date() };
        }

        // Build sort object
        const sortObj = {};
        sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Count total tasks matching filter
        const totalTasks = await Task.countDocuments(filter);

        // Execute query with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const tasks = await Task.find(filter)
            .populate('assignedTo', 'name email profileImageUrl')
            .populate('createdBy', 'name email')
            .sort(sortObj)
            .skip(skip)
            .limit(parseInt(limit));

        const totalPages = Math.ceil(totalTasks / parseInt(limit));
        const hasNextPage = parseInt(page) < totalPages;
        const hasPrevPage = parseInt(page) > 1;

        res.status(200).json({
            tasks,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalTasks,
                limit: parseInt(limit),
                hasNextPage,
                hasPrevPage
            }
        });
    } catch (error) {
        console.error("Error searching tasks:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get filter options
const getFilterOptions = async (req, res) => {
    try {
        // Get all users
        const users = await User.find().select('_id name email').lean();
        const userOptions = users.map(u => ({
            value: u._id,
            label: u.name,
            email: u.email
        }));

        // Status options
        const statuses = [
            { value: 'Pending', label: 'Pending' },
            { value: 'In Progress', label: 'In Progress' },
            { value: 'Completed', label: 'Completed' }
        ];

        // Priority options
        const priorities = [
            { value: 'Low', label: 'Low' },
            { value: 'Medium', label: 'Medium' },
            { value: 'High', label: 'High' }
        ];

        // Date range
        const tasks = await Task.find().select('dueDate').lean();
        let minDate = null, maxDate = null;
        if (tasks.length > 0) {
            const dates = tasks.map(t => t.dueDate).sort((a, b) => a - b);
            minDate = dates[0];
            maxDate = dates[dates.length - 1];
        }

        res.status(200).json({
            users: userOptions,
            statuses,
            priorities,
            dateRange: { min: minDate, max: maxDate }
        });
    } catch (error) {
        console.error("Error fetching filter options:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Search users (admin only)
const searchUsers = async (req, res) => {
    try {
        const { query = '', role = '', page = 1, limit = 10 } = req.query;

        const filter = {};

        if (query) {
            filter.$or = [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ];
        }

        if (role) filter.role = role;

        const totalUsers = await User.countDocuments(filter);
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const users = await User.find(filter)
            .select('-password')
            .skip(skip)
            .limit(parseInt(limit));

        const totalPages = Math.ceil(totalUsers / parseInt(limit));

        res.status(200).json({
            users,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalUsers,
                limit: parseInt(limit),
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1
            }
        });
    } catch (error) {
        console.error("Error searching users:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get quick filter counts
const getQuickFilters = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

        // Build base filter based on role
        const baseFilter = req.user.role === 'admin' ? {} : { assignedTo: userId };

        const allTasks = await Task.countDocuments(baseFilter);
        const dueToday = await Task.countDocuments({
            ...baseFilter,
            dueDate: { $gte: startOfToday, $lt: endOfToday }
        });

        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);

        const dueThisWeek = await Task.countDocuments({
            ...baseFilter,
            dueDate: { $gte: startOfWeek, $lt: endOfWeek }
        });

        const overdue = await Task.countDocuments({
            ...baseFilter,
            status: { $ne: 'Completed' },
            dueDate: { $lt: now }
        });

        const highPriority = await Task.countDocuments({
            ...baseFilter,
            priority: 'High',
            status: { $ne: 'Completed' }
        });

        const completedToday = await Task.countDocuments({
            ...baseFilter,
            status: 'Completed',
            updatedAt: { $gte: startOfToday, $lt: endOfToday }
        });

        const quickFilters = [
            { id: 'all', label: 'All Tasks', count: allTasks, icon: 'LuClipboardList', color: 'blue' },
            { id: 'today', label: 'Due Today', count: dueToday, icon: 'LuCalendar', color: 'orange' },
            { id: 'week', label: 'This Week', count: dueThisWeek, icon: 'LuCalendarDays', color: 'purple' },
            { id: 'overdue', label: 'Overdue', count: overdue, icon: 'LuBadgeAlert', color: 'red' },
            { id: 'high-priority', label: 'High Priority', count: highPriority, icon: 'LuZap', color: 'red' },
            { id: 'completed-today', label: 'Completed Today', count: completedToday, icon: 'LuCheckCheck', color: 'green' }
        ];

        res.status(200).json({ quickFilters });
    } catch (error) {
        console.error("Error fetching quick filters:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    searchTasks,
    getFilterOptions,
    searchUsers,
    getQuickFilters
};
