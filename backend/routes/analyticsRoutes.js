const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
    getTaskInsights,
    getTeamAnalytics,
    getSuggestedPriorities
} = require("../controller/taskAnalyticsController");

const router = express.Router();

// Get personal task insights
router.get('/insights', protect, getTaskInsights);

// Get suggested task priorities
router.get('/suggested-priorities', protect, getSuggestedPriorities);

// Get team-wide analytics (admin only)
router.get('/team', protect, adminOnly, getTeamAnalytics);



module.exports = router;