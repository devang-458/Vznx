const express = require("express");

const { adminOnly, protect } = require("../middleware/authMiddleware");
const { getUsers, getUserById, createUser, updateUser, deleteUser } = require("../controller/userController");

const router = express.Router();

router.get("/", protect, adminOnly, getUsers);
router.post("/", protect, adminOnly, createUser);
router.get("/:id", protect, getUserById);
router.put("/:id", protect, adminOnly, updateUser);
router.delete("/:id", protect, adminOnly, deleteUser);

module.exports = router