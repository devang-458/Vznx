const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
  },
  type: {
    type: String,
    required: true,
    enum: ['Story', 'Task', 'Bug', 'Epic'], // Example types
    default: 'Task',
  },
  status: {
    type: String,
    required: true,
    enum: ['To Do', 'In Progress', 'Done', 'Blocked', 'Review'], // Example statuses
    default: 'To Do',
  },
  priority: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High', 'Highest'], // Example priorities
    default: 'Medium',
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  parent_issue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
  ],
  dueDate: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model('Issue', issueSchema);
