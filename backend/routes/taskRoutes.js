const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");

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
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post('/upload-attachment', protect, upload.single('attachment'), uploadAttachment);
router.get('/dashboard-data', protect, adminOnly, getDashboardData);
router.get('/user-dashboard-data', protect, getUserDashboardData);
router.get('/', protect, getTasks);
router.get('/:id', protect, getTaskById);
router.post('/', protect, createTask);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, adminOnly, deleteTask);
router.put('/:id/status', protect, updateTaskStatus);
router.put('/:id/todo', protect, updateTaskChecklist);


module.exports = router;
