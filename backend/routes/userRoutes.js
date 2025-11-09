const express = require("express");

const { adminOnly, protect } = require("../middleware/authMiddleware");
const { getUsers, getUserById} = require("../controller/userController");

const router = express.Router();

router.get("/", protect, adminOnly, getUsers);
router.get("/:id", protect, getUserById);


module.exports = router