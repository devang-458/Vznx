const Comment = require("../models/Comment.js");
const Task = require("../models/Task.js");
const User = require("../models/User.js");

// Add comment to a task
const addComment = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { content, mentions } = req.body;
        const userId = req.user._id || req.user.id;

        // Validate task exists
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Create comment
        const comment = await Comment.create({
            task: taskId,
            author: userId,
            content,
            mentions: mentions || []
        });

        // Populate author details
        await comment.populate('author', 'name profileImageUrl email');
        await comment.populate('mentions', 'name email');

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: comment
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all comments for a task
const getTaskComments = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { limit = 50, skip = 0 } = req.query;

        // Validate task exists
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Get comments with pagination
        const comments = await Comment.find({ task: taskId, parentComment: null })
            .populate('author', 'name profileImageUrl email')
            .populate('mentions', 'name email')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        // Get count
        const total = await Comment.countDocuments({ task: taskId, parentComment: null });

        res.json({
            success: true,
            data: {
                comments,
                total,
                limit: parseInt(limit),
                skip: parseInt(skip)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get comment threads (parent and replies)
const getCommentThread = async (req, res) => {
    try {
        const { commentId } = req.params;

        // Get parent comment and all replies
        const parentComment = await Comment.findById(commentId)
            .populate('author', 'name profileImageUrl email')
            .populate('mentions', 'name email');

        if (!parentComment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const replies = await Comment.find({ parentComment: commentId })
            .populate('author', 'name profileImageUrl email')
            .populate('mentions', 'name email')
            .sort({ createdAt: 1 });

        res.json({
            success: true,
            data: {
                parentComment,
                replies
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update comment
const updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content, mentions } = req.body;
        const userId = req.user._id || req.user.id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check authorization
        if (comment.author.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this comment' });
        }

        // Update comment
        comment.content = content || comment.content;
        comment.mentions = mentions || comment.mentions;
        comment.isEdited = true;
        comment.editedAt = new Date();

        await comment.save();
        await comment.populate('author', 'name profileImageUrl email');
        await comment.populate('mentions', 'name email');

        res.json({
            success: true,
            message: 'Comment updated successfully',
            data: comment
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete comment
const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user._id || req.user.id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check authorization
        if (comment.author.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        // Delete comment and all replies
        await Comment.deleteMany({ 
            $or: [
                { _id: commentId },
                { parentComment: commentId }
            ]
        });

        res.json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Add reaction to comment
const addReaction = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { emoji } = req.body;
        const userId = req.user._id || req.user.id;

        if (!emoji) {
            return res.status(400).json({ message: 'Emoji is required' });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if user already reacted with same emoji
        const existingReaction = comment.reactions.find(
            r => r.user.toString() === userId.toString() && r.emoji === emoji
        );

        if (existingReaction) {
            // Remove reaction if already exists
            comment.reactions = comment.reactions.filter(
                r => !(r.user.toString() === userId.toString() && r.emoji === emoji)
            );
        } else {
            // Add new reaction
            comment.reactions.push({
                user: userId,
                emoji
            });
        }

        await comment.save();
        await comment.populate('author', 'name profileImageUrl email');

        res.json({
            success: true,
            message: 'Reaction updated successfully',
            data: comment
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Reply to comment
const replyToComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content, mentions } = req.body;
        const userId = req.user._id || req.user.id;

        // Verify parent comment exists
        const parentComment = await Comment.findById(commentId);
        if (!parentComment) {
            return res.status(404).json({ message: 'Parent comment not found' });
        }

        // Create reply
        const reply = await Comment.create({
            task: parentComment.task,
            author: userId,
            content,
            mentions: mentions || [],
            parentComment: commentId
        });

        await reply.populate('author', 'name profileImageUrl email');
        await reply.populate('mentions', 'name email');

        res.status(201).json({
            success: true,
            message: 'Reply added successfully',
            data: reply
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    addComment,
    getTaskComments,
    getCommentThread,
    updateComment,
    deleteComment,
    addReaction,
    replyToComment
};
