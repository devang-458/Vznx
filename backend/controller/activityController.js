const Activity = require("../models/Activity.js");

// Create activity log entry
const createActivity = async (type, actorId, taskId = null, targetId = null, metadata = {}) => {
    try {
        const activity = await Activity.create({
            type,
            actor: actorId,
            task: taskId,
            target: targetId,
            metadata,
            isRead: false
        });
        return activity;
    } catch (error) {
        console.error("Error creating activity:", error);
        return null;
    }
};

// Get activity feed
const getActivityFeed = async (req, res) => {
    const { limit = 50, skip = 0 } = req.query;
    const userId = req.user._id;

    // Get activities where user is the target or actor
    const activities = await Activity.find({
        $or: [
            { target: userId },
            { actor: userId }
        ]
    })
        .populate('actor', 'name email profileImageUrl')
        .populate('task', 'title status priority')
        .populate('target', 'name email')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));

    const unreadCount = await Activity.countDocuments({
        target: userId,
        isRead: false
    });

    const hasMore = await Activity.countDocuments({
        $or: [
            { target: userId },
            { actor: userId }
        ],
        _id: { $nin: activities.map(a => a._id) }
    });

    res.status(200).json({
        activities,
        unreadCount,
        hasMore: hasMore > 0
    });
};

// Get team activity feed (admin only)
const getTeamActivityFeed = async (req, res) => {
    const { limit = 50, skip = 0 } = req.query;

    const activities = await Activity.find()
        .populate('actor', 'name email profileImageUrl')
        .populate('task', 'title status priority')
        .populate('target', 'name email')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));

    const hasMore = await Activity.countDocuments({
        _id: { $nin: activities.map(a => a._id) }
    });

    res.status(200).json({
        activities,
        hasMore: hasMore > 0
    });
};

// Get unread count
const getUnreadCount = async (req, res) => {
    const userId = req.user._id;
    const unreadCount = await Activity.countDocuments({
        target: userId,
        isRead: false
    });

    res.status(200).json({ unreadCount });
};

// Mark activities as read
const markAsRead = async (req, res) => {
    const { activityIds } = req.body;

    if (!activityIds || !Array.isArray(activityIds) || activityIds.length === 0) {
        return res.status(400).json({ message: "Invalid activity IDs" });
    }

    await Activity.updateMany(
        { _id: { $in: activityIds } },
        { isRead: true }
    );

    res.status(200).json({ message: "Activities marked as read" });
};

// Mark all activities as read
const markAllAsRead = async (req, res) => {
    const userId = req.user._id;

    await Activity.updateMany(
        { target: userId, isRead: false },
        { isRead: true }
    );

    res.status(200).json({ message: "All activities marked as read" });
};

module.exports = {
    createActivity,
    getActivityFeed,
    getTeamActivityFeed,
    getUnreadCount,
    markAsRead,
    markAllAsRead
};
