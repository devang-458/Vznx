
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

const registerUser = async (req, res) => {
    try {
        const { name, email, password, profileImageUrl, adminInviteToken } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                message: "User already exists"
            })
        }

        // determinr user role: admin if correct token is provided, otherwise Member
        let role = 'member';
        if (adminInviteToken && adminInviteToken == process.env.ADMIN_INVITE_TOKEN) {
            role = "admin"
        }

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // create new user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            profileImageUrl,
            role
        })

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImageUrl: user.profileImageUrl,
            token: generateToken(user._id)
        })

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message })
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invaild email or password' });
        }

        console.log("heee")

        // compare password 
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invaild email or password' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImageUrl: user.profileImageUrl,
            token: token
        })
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "server error", error: error.message })
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const { name, email, currentPassword, newPassword, profileImageUrl, preferences } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        // If updating password, verify current password
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({
                    message: 'Current password is required to change password'
                });
            }

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(401).json({
                    message: 'Current password is incorrect'
                });
            }

            // Validate new password length
            if (newPassword.length < 6) {
                return res.status(400).json({
                    message: 'New password must be at least 6 characters'
                });
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        // Update profile fields
        if (name) user.name = name;
        if (email) {
            // Check email uniqueness
            const emailExists = await User.findOne({ email: email, _id: { $ne: user._id } });
            if (emailExists) {
                return res.status(400).json({
                    message: 'Email already in use'
                });
            }
            user.email = email;
        }
        if (profileImageUrl) user.profileImageUrl = profileImageUrl;
        if (preferences) user.preferences = { ...user.preferences, ...preferences };

        const updatedUser = await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                profileImageUrl: updatedUser.profileImageUrl,
                preferences: updatedUser.preferences,
                notificationSettings: updatedUser.notificationSettings
            }
        })
    } catch (error) {
        res.status(500).json({ message: "server error", error: error.message })
    }
};

const getPreferences = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('preferences notificationSettings');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            success: true,
            data: {
                preferences: user.preferences,
                notificationSettings: user.notificationSettings
            }
        });
    } catch (error) {
        res.status(500).json({ message: "server error", error: error.message })
    }
};

const updatePreferences = async (req, res) => {
    try {
        const { preferences, notificationSettings } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (preferences) {
            user.preferences = { ...user.preferences, ...preferences };
        }
        if (notificationSettings) {
            user.notificationSettings = { ...user.notificationSettings, ...notificationSettings };
        }

        const updatedUser = await user.save();

        res.json({
            success: true,
            message: 'Preferences updated successfully',
            data: {
                preferences: updatedUser.preferences,
                notificationSettings: updatedUser.notificationSettings
            }
        });
    } catch (error) {
        res.status(500).json({ message: "server error", error: error.message })
    }
};

const updateNotificationSettings = async (req, res) => {
    try {
        const { emailNotifications, pushNotifications, notificationSettings } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
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

        res.json({
            success: true,
            message: 'Notification settings updated successfully',
            data: {
                preferences: updatedUser.preferences,
                notificationSettings: updatedUser.notificationSettings
            }
        });
    } catch (error) {
        res.status(500).json({ message: "server error", error: error.message })
    }
};

const deleteAccount = async (req, res) => {
    try {
        const { password, confirmation } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: 'Password is incorrect'
            });
        }

        // Verify confirmation text
        if (confirmation !== 'DELETE MY ACCOUNT') {
            return res.status(400).json({
                message: 'Confirmation text does not match'
            });
        }

        // Anonymize user data in tasks
        const Task = require('../models/Task.js');
        await Task.updateMany(
            { 'assignedTo._id': user._id },
            { $pull: { assignedTo: { _id: user._id } } }
        );

        // Log activity (optional)
        const Activity = require('../models/Activity.js');
        if (Activity) {
            await Activity.deleteMany({ 'user': user._id });
        }

        // Delete user
        await User.findByIdAndDelete(user._id);

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ message: "server error", error: error.message })
    }
};

const exportUserData = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const Task = require('../models/Task.js');
        const Activity = require('../models/Activity.js');

        // Get all user's tasks and activities
        const tasks = await Task.find({ 'assignedTo._id': user._id }).lean();
        const activities = Activity ? await Activity.find({ 'user': user._id }).lean() : [];

        const exportData = {
            profile: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImageUrl: user.profileImageUrl,
                accountCreatedAt: user.accountCreatedAt,
                lastLogin: user.lastLogin
            },
            preferences: user.preferences,
            notificationSettings: user.notificationSettings,
            tasks: tasks,
            activities: activities,
            exportedAt: new Date()
        };

        // Send as JSON response
        res.json({
            success: true,
            data: exportData
        });
    } catch (error) {
        res.status(500).json({ message: "server error", error: error.message })
    }
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