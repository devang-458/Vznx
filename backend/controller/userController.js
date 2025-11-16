const userService = require('../services/userService');
const { createActivity } = require("./activityController");

const getUsers = async (req, res) => {
    const usersWithTaskCounts = await userService.getAllUsers();
    res.json(usersWithTaskCounts);
};

const getUserById = async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
};

const createUser = async (req, res) => {
    const newUser = await userService.createNewUser(req.body);
    // Log activity
    await createActivity(
        'user_joined',
        req.user._id,
        null,
        newUser._id,
        { userName: newUser.name }
    );
    res.status(201).json({
        success: true,
        message: "User created successfully",
        data: newUser
    });
};

const updateUser = async (req, res) => {
    const updatedUser = await userService.updateExistingUser(req.params.id, req.body);
    res.json({
        success: true,
        message: "User updated successfully",
        data: updatedUser
    });
};

const deleteUser = async (req, res) => {
    const result = await userService.deleteUser(req.params.id);
    res.json({
        success: true,
        message: result.message
    });
};

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser }