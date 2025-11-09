const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { route } = require("./authRoutes");
const { exportUsersReport, exportTasksReport } = require("../controller/reportController");

const router = express.Router();

router.get("/export/tasks", protect, adminOnly, exportTasksReport);
router.get("/export/users", protect, adminOnly, exportUsersReport);

module.exports = router;