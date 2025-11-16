const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getBurndownChartData } = require('../controller/reportController');

// Get burndown chart data for a sprint
router.get('/burndown/:projectId/:startDate/:endDate', protect, getBurndownChartData);

module.exports = router;
