const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const validate = require("../middleware/validationMiddleware"); // Import validate middleware
const {
    bulkUpdateStatus,
    bulkUpdatePriority,
    bulkAssignTasks,
    bulkDeleteTasks,
    bulkUpdateDueDate
} = require("../controller/bulkOperationsController");
const {
    bulkUpdateStatusSchema,
    bulkUpdatePrioritySchema,
    bulkAssignTasksSchema,
    bulkDeleteTasksSchema,
    bulkUpdateDueDateSchema
} = require("../validation/bulkOperationsValidation"); // Import Joi schemas

const router = express.Router();

router.put("/status", protect, validate(bulkUpdateStatusSchema), bulkUpdateStatus);
router.put("/priority", protect, validate(bulkUpdatePrioritySchema), bulkUpdatePriority);
router.put("/assign", protect, adminOnly, validate(bulkAssignTasksSchema), bulkAssignTasks);
router.delete("/delete", protect, adminOnly, validate(bulkDeleteTasksSchema), bulkDeleteTasks);
router.put("/due-date", protect, adminOnly, validate(bulkUpdateDueDateSchema), bulkUpdateDueDate);

module.exports = router;
