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
const validate = require("../middleware/validationMiddleware.js"); // Import validate middleware
const {
    addCommentSchema,
    updateCommentSchema,
    addReactionSchema,
    replyToCommentSchema
} = require("../validation/commentValidation.js"); // Import Joi schemas

const router = Router();

// All routes require authentication
router.use(protect);

// Comment endpoints
router.post('/tasks/:taskId/comments', validate(addCommentSchema), addComment);
router.get('/tasks/:taskId/comments', getTaskComments);
router.get('/comments/:commentId', getCommentThread);
router.put('/comments/:commentId', validate(updateCommentSchema), updateComment);
router.delete('/comments/:commentId', deleteComment);
router.post('/comments/:commentId/react', validate(addReactionSchema), addReaction);
router.post('/comments/:commentId/reply', validate(replyToCommentSchema), replyToComment);

module.exports = router;
