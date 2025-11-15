const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
    bulkUpdateStatus,
    bulkUpdatePriority,
    bulkAssignTasks,
    bulkDeleteTasks,
    bulkUpdateDueDate
} = require("../controller/bulkOperationsController");

const router = express.Router();

router.put("/status", protect, bulkUpdateStatus);
router.put("/priority", protect, bulkUpdatePriority);
router.put("/assign", protect, adminOnly, bulkAssignTasks);
router.delete("/delete", protect, adminOnly, bulkDeleteTasks);
router.put("/due-date", protect, adminOnly, bulkUpdateDueDate);

module.exports = router;
