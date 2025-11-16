const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validationMiddleware"); // Import validate middleware
const { sendMessage, getMessages, getConversations } = require("../controller/messageController");
const { sendMessageSchema } = require("../validation/messageValidation"); // Import Joi schemas

const router = express.Router();

router.post('/', protect, validate(sendMessageSchema), sendMessage);
router.get('/conversations', protect, getConversations);
router.get('/:otherUserId', protect, getMessages);

module.exports = router;
