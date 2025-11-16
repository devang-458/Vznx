const express = require("express");

const { adminOnly, protect } = require("../middleware/authMiddleware");
const { getUsers, getUserById, createUser, updateUser, deleteUser } = require("../controller/userController");
const validate = require("../middleware/validationMiddleware"); // Import validate middleware
const { createUserSchema, updateUserSchema } = require("../validation/userValidation"); // Import Joi schemas

const router = express.Router();

router.get("/", protect, getUsers);
router.post("/", protect, adminOnly, validate(createUserSchema), createUser);
router.get("/:id", protect, getUserById);
router.put("/:id", protect, adminOnly, validate(updateUserSchema), updateUser);
router.delete("/:id", protect, adminOnly, deleteUser);

module.exports = router