const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: [
                'task_created',
                'task_updated',
                'task_completed',
                'task_assigned',
                'task_status_changed',
                'task_priority_changed',
                'task_deleted',
                'comment_added',
                'todo_checked',
                'user_joined'
            ],
            required: true
        },
        actor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        task: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task',
            optional: true
        },
        target: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            optional: true
        },
        metadata: {
            oldValue: mongoose.Schema.Types.Mixed,
            newValue: mongoose.Schema.Types.Mixed,
            taskTitle: String,
            comment: String
        },
        isRead: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

// Create indexes
activitySchema.index({ createdAt: -1 });
activitySchema.index({ actor: 1, createdAt: -1 });
activitySchema.index({ target: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
