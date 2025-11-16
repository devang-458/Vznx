const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createIssue,
  getIssuesByProject,
  updateIssueStatus,
  assignIssue,
  aiCreateIssue,
  generateSubtasks,
  getIssue,
  deleteIssue,
} = require('../controller/issueController');

// Create a new issue
router.post('/issues', protect, createIssue);

// Get all issues for a specific project
router.get('/projects/:projectId/issues', protect, getIssuesByProject);

// Update an issue's status
router.put('/issues/:id/status', protect, updateIssueStatus);

// Assign an issue to a user
router.put('/issues/:id/assignee', protect, assignIssue);

// AI-assisted creation of an issue
router.post('/issues/ai-create', protect, aiCreateIssue);

// AI sub-task generation
router.post('/issues/:id/generate-subtasks', protect, generateSubtasks);

// Get a single issue by ID
router.get('/issues/:id', protect, getIssue);

// Delete an issue by ID
router.delete('/issues/:id', protect, deleteIssue);

module.exports = router;
