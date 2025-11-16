
const userService = require('../services/userService');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

const registerUser = async (req, res) => {
    const { adminInviteToken, ...userData } = req.body;
    const user = await userService.registerUser(userData, adminInviteToken);
    res.status(201).json(user);
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await userService.loginUser(email, password);
    res.json(user);
};

const getUserProfile = async (req, res) => {
    const user = await userService.getUserProfile(req.user.id);
    res.json(user);
};

const updateUserProfile = async (req, res) => {
    const updatedUser = await userService.updateUserProfile(req.user.id, req.body);
    res.json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
    });
};

const getPreferences = async (req, res) => {
    const preferences = await userService.getPreferences(req.user.id);
    res.json({
        success: true,
        data: preferences
    });
};

const updatePreferences = async (req, res) => {
    const updatedPreferences = await userService.updatePreferences(req.user.id, req.body);
    res.json({
        success: true,
        message: 'Preferences updated successfully',
        data: updatedPreferences
    });
};

const updateNotificationSettings = async (req, res) => {
    const updatedSettings = await userService.updateNotificationSettings(req.user.id, req.body);
    res.json({
        success: true,
        message: 'Notification settings updated successfully',
        data: updatedSettings
    });
};

const deleteAccount = async (req, res) => {
    const { password, confirmation } = req.body;
    const result = await userService.deleteAccount(req.user.id, password, confirmation);
    res.json({
        success: true,
        message: result.message
    });
};

const exportUserData = async (req, res) => {
    const exportData = await userService.exportUserData(req.user.id);
    const filename = `user_data_${new Date().toISOString().split('T')[0]}.json`;
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.json({
        success: true,
        data: exportData
    });
};

module.exports = { 
    registerUser, 
    loginUser, 
    getUserProfile, 
    updateUserProfile,
    getPreferences,
    updatePreferences,
    updateNotificationSettings,
    deleteAccount,
    exportUserData
}