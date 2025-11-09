const express = require("express");

const { adminOnly, protect } = require("../middleware/authMiddleware");
const { getUserProfile } = require("../controller/authController");

const router = express.Router();

router.get("/", protect, adminOnly, getUserProfile);
router.get("/", protect, getUserById);
router.delete("/", protect, adminOnly, deleteUser);


module.exports = router