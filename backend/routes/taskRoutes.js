const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const validate = require("../middleware/validationMiddleware"); // Import validate middleware
const {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskChecklist,
    getDashboardData,
    getUserDashboardData,
    uploadAttachment
} = require("../controller/taskController")
const {
    createTaskSchema,
    updateTaskSchema,
    updateTaskStatusSchema,
    updateTaskChecklistSchema
} = require("../validation/taskValidation"); // Import Joi schemas
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post('/upload-attachment', protect, upload.single('attachment'), uploadAttachment);
router.get('/dashboard-data', protect, adminOnly, getDashboardData);
router.get('/user-dashboard-data', protect, getUserDashboardData);
router.get('/', protect, getTasks);
router.get('/:id', protect, getTaskById);
router.post('/', protect, validate(createTaskSchema), createTask);
router.put('/:id', protect, validate(updateTaskSchema), updateTask);
router.delete('/:id', protect, adminOnly, deleteTask);
router.put('/:id/status', protect, validate(updateTaskStatusSchema), updateTaskStatus);
router.put('/:id/todo', protect, validate(updateTaskChecklistSchema), updateTaskChecklist);


module.exports = router;
