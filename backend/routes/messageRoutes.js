const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { sendMessage, getMessages, getConversations } = require("../controller/messageController");

const router = express.Router();

router.post('/', protect, sendMessage);
router.get('/conversations', protect, getConversations);
router.get('/:otherUserId', protect, getMessages);

module.exports = router;
