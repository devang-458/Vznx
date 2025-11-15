const { Router } = require("express");
const {
    suggestTaskBreakdown,
    suggestAssignee,
    smartSchedule,
    generateTaskDescription,
    predictCompletion
} = require("../controller/aiController.js");
const { protect } = require("../middleware/authMiddleware.js");

const router = Router();

// All AI endpoints require authentication
router.use(protect);

// AI Assistant endpoints
router.post('/suggest-breakdown', suggestTaskBreakdown);
router.post('/suggest-assignee', suggestAssignee);
router.post('/smart-schedule', smartSchedule);
router.post('/generate-description', generateTaskDescription);
router.post('/predict-completion', predictCompletion);

module.exports = router;
