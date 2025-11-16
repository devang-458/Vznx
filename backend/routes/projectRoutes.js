const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Assuming authMiddleware has a protect function
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} = require('../controller/projectController');

// All project routes are protected
router.route('/')
  .post(protect, createProject)
  .get(protect, getProjects);

router.route('/:id')
  .get(protect, getProject)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

module.exports = router;
