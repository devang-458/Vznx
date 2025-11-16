const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getInsights } = require('../controller/insightController');

// Get insights
router.get('/', protect, getInsights);

module.exports = router;
