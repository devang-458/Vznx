const User = require('../models/User');
const Task = require('../models/Task');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const debug = require('../config/debug')('userService');

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const registerUser = async (userData, adminInviteToken) => {
    const { name, email, password, profileImageUrl } = userData;

    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error('User already exists');
    }

    debug('Received adminInviteToken:', adminInviteToken);
    debug('process.env.ADMIN_INVITE_TOKEN:', process.env.ADMIN_INVITE_TOKEN);

    let role = 'member';
    if (adminInviteToken && adminInviteToken === process.env.ADMIN_INVITE_TOKEN) {
        role = 'admin';
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        profileImageUrl,
        role
    });

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImageUrl: user.profileImageUrl,
        token: generateToken(user._id)
    };
};

const loginUser = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid email or password');
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImageUrl: user.profileImageUrl,
        token: token
    };
};

const getUserProfile = async (userId) => {
    const user = await User.findById(userId).select('-password');
    if (!user) {
        throw new Error('User not found');
    }
    return user;
};

const updateUserProfile = async (userId, updateData) => {
    const { name, email, currentPassword, newPassword, profileImageUrl, preferences } = updateData;
    const user = await User.findById(userId);

    if (!user) {
        throw new Error('User not found');
    }

    if (newPassword) {
        if (!currentPassword) {
            throw new Error('Current password is required to change password');
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            throw new Error('Current password is incorrect');
        }
        if (newPassword.length < 6) {
            throw new Error('New password must be at least 6 characters');
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
    }

    if (name) user.name = name;
    if (email && email !== user.email) {
        const emailExists = await User.findOne({ email: email, _id: { $ne: user._id } });
        if (emailExists) {
            throw new Error('Email already in use');
        }
        user.email = email;
    }
    if (profileImageUrl) user.profileImageUrl = profileImageUrl;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    const updatedUser = await user.save();

    return {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profileImageUrl: updatedUser.profileImageUrl,
        preferences: updatedUser.preferences,
        notificationSettings: updatedUser.notificationSettings
    };
};

const getPreferences = async (userId) => {
    const user = await User.findById(userId).select('preferences notificationSettings');
    if (!user) {
        throw new Error('User not found');
    }
    return {
        preferences: user.preferences,
        notificationSettings: user.notificationSettings
    };
};

const updatePreferences = async (userId, preferencesData) => {
    const { preferences, notificationSettings } = preferencesData;
    const user = await User.findById(userId);

    if (!user) {
        throw new Error('User not found');
    }

    if (preferences) {
        user.preferences = { ...user.preferences, ...preferences };
    }
    if (notificationSettings) {
        user.notificationSettings = { ...user.notificationSettings, ...notificationSettings };
    }

    const updatedUser = await user.save();

    return {
        preferences: updatedUser.preferences,
        notificationSettings: updatedUser.notificationSettings
    };
};

const updateNotificationSettings = async (userId, notificationData) => {
    const { emailNotifications, pushNotifications, notificationSettings } = notificationData;
    const user = await User.findById(userId);

    if (!user) {
        throw new Error('User not found');
    }

    if (emailNotifications !== undefined) {
        user.preferences.emailNotifications = emailNotifications;
    }
    if (pushNotifications !== undefined) {
        user.preferences.pushNotifications = pushNotifications;
    }
    if (notificationSettings) {
        user.notificationSettings = { ...user.notificationSettings, ...notificationSettings };
    }

    const updatedUser = await user.save();

    return {
        preferences: updatedUser.preferences,
        notificationSettings: updatedUser.notificationSettings
    };
};

const deleteAccount = async (userId, password, confirmation) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Password is incorrect');
    }

    if (confirmation !== 'DELETE MY ACCOUNT') {
        throw new Error('Confirmation text does not match');
    }

    await Task.updateMany(
        { 'assignedTo._id': user._id },
        { $pull: { assignedTo: { _id: user._id } } }
    );

    const Activity = require('../models/Activity');
    if (Activity) {
        await Activity.deleteMany({ 'user': user._id });
    }

    await User.findByIdAndDelete(user._id);

    return { message: 'Account deleted successfully' };
};

const exportUserData = async (userId) => {
    const user = await User.findById(userId).select('-password');
    if (!user) {
        throw new Error('User not found');
    }

    const Activity = require('../models/Activity');

    const tasks = await Task.find({ 'assignedTo._id': user._id }).lean();
    const activities = Activity ? await Activity.find({ 'user': user._id }).lean() : [];

    const exportData = {
        profile: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImageUrl: user.profileImageUrl,
            accountCreatedAt: user.createdAt,
            lastLogin: user.lastLogin
        },
        preferences: user.preferences,
        notificationSettings: user.notificationSettings,
        tasks: tasks,
        activities: activities,
        exportedAt: new Date()
    };

    return exportData;
};

const getAllUsers = async () => {
    const users = await User.find().select("-password");
    const usersWithTaskCounts = await Promise.all(
        users.map(async (user) => {
            const pendingTask = await Task.countDocuments({
                assignedTo: user._id,
                status: 'Pending',
            });
            const inProgressTasks = await Task.countDocuments({
                assignedTo: user._id,
                status: "In Progress"
            });
            const completedTasks = await Task.countDocuments({
                assignedTo: user._id,
                status: "Completed"
            });

            return {
                ...user._doc,
                pendingTask,
                inProgressTasks,
                completedTasks
            };
        })
    );
    return usersWithTaskCounts;
};

const getUserById = async (id) => {
    const user = await User.findById(id).select("-password");
    if (!user) {
        throw new Error("User not found");
    }
    return user;
};

const createNewUser = async (userData) => {
    const { name, email, role, password } = userData;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role
    });

    await newUser.save();

    return {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
    };
};

const updateExistingUser = async (id, updateData) => {
    const { name, email, role, password } = updateData;

    const user = await User.findById(id);
    if (!user) {
        throw new Error("User not found");
    }

    if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error("Email already in use by another user");
        }
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (password) {
        user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
    };
};

const deleteUser = async (id) => {
    const user = await User.findById(id);
    if (!user) {
        throw new Error("User not found");
    }

    await User.findByIdAndDelete(id);
    await Task.deleteMany({ assignedTo: id });

    return { message: "User deleted successfully" };
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
    exportUserData,
    getAllUsers,
    getUserById,
    createNewUser,
    updateExistingUser,
    deleteUser
};
