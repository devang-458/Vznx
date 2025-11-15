const { Router } = require("express");
const {
    addComment,
    getTaskComments,
    getCommentThread,
    updateComment,
    deleteComment,
    addReaction,
    replyToComment
} = require("../controller/commentController.js");
const { protect } = require("../middleware/authMiddleware.js");

const router = Router();

// All routes require authentication
router.use(protect);

// Comment endpoints
router.post('/tasks/:taskId/comments', addComment);
router.get('/tasks/:taskId/comments', getTaskComments);
router.get('/comments/:commentId', getCommentThread);
router.put('/comments/:commentId', updateComment);
router.delete('/comments/:commentId', deleteComment);
router.post('/comments/:commentId/react', addReaction);
router.post('/comments/:commentId/reply', replyToComment);

module.exports = router;
