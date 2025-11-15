const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
    getActivityFeed,
    getTeamActivityFeed,
    getUnreadCount,
    markAsRead,
    markAllAsRead
} = require("../controller/activityController");

const router = express.Router();

router.get("/feed", protect, getActivityFeed);
router.get("/team-feed", protect, adminOnly, getTeamActivityFeed);
router.get("/unread-count", protect, getUnreadCount);
router.put("/mark-read", protect, markAsRead);
router.put("/mark-all-read", protect, markAllAsRead);

module.exports = router;
