const User = require("../models/User.js");
const bcrypt = require("bcryptjs");

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { name, email, currentPassword, newPassword, profileImageUrl, preferences } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // If changing email, check uniqueness
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    // If changing password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password required' });
      }
      
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // Update basic fields
    if (name) user.name = name;
    if (profileImageUrl) user.profileImageUrl = profileImageUrl;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          profileImageUrl: user.profileImageUrl,
          role: user.role,
          preferences: user.preferences,
          notificationSettings: user.notificationSettings
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user preferences
const getPreferences = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      success: true,
      data: {
        preferences: user.preferences,
        notificationSettings: user.notificationSettings,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update preferences
const updatePreferences = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { preferences, notificationSettings } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    if (notificationSettings) {
      user.notificationSettings = { 
        ...user.notificationSettings, 
        ...notificationSettings 
      };
    }

    await user.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences: user.preferences,
        notificationSettings: user.notificationSettings,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { password, confirmation } = req.body;

    if (!password || !confirmation) {
      return res.status(400).json({ 
        message: 'Password and confirmation required' 
      });
    }

    if (confirmation !== 'DELETE MY ACCOUNT') {
      return res.status(400).json({ 
        message: 'Confirmation text does not match' 
      });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Password is incorrect' });
    }

    // Anonymize tasks assigned to this user
    const Task = require("../models/Task.js");
    if (Task) {
      await Task.updateMany(
        { 'assignedTo._id': user._id },
        { $pull: { assignedTo: { _id: user._id } } }
      );
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Export user data (GDPR compliance)
const exportUserData = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const Task = require("../models/Task.js");
    const tasks = await Task.find({ 
      $or: [
        { 'assignedTo._id': user._id },
        { createdBy: user._id }
      ]
    }).lean();

    const exportData = {
      profile: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
      preferences: user.preferences,
      notificationSettings: user.notificationSettings,
      tasks: tasks || [],
      exportedAt: new Date(),
    };

    const filename = `user_data_${new Date().toISOString().split('T')[0]}.json`;
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.json({
      success: true,
      data: exportData
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  updateProfile,
  getPreferences,
  updatePreferences,
  deleteAccount,
  exportUserData,
};
