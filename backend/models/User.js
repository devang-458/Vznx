const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImageUrl: { type: String, default: null },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    
    // Preferences
    preferences: {
        theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
        language: { type: String, enum: ['en', 'es', 'fr', 'de', 'hi'], default: 'en' },
        timezone: { type: String, default: 'UTC' },
        dateFormat: { type: String, enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'], default: 'MM/DD/YYYY' },
        emailNotifications: { type: Boolean, default: true },
        pushNotifications: { type: Boolean, default: true },
        weekStartsOn: { type: String, enum: ['sunday', 'monday'], default: 'monday' }
    },
    
    // Notification Settings
    notificationSettings: {
        taskAssigned: { type: Boolean, default: true },
        taskDueSoon: { type: Boolean, default: true },
        taskCompleted: { type: Boolean, default: false },
        mentionedInComment: { type: Boolean, default: true },
        dailyDigest: { type: Boolean, default: true },
        weeklyReport: { type: Boolean, default: false }
    },
    
    // Account tracking
    lastLogin: { type: Date, default: null },
    accountCreatedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
},
    { timestamps: true }
)

module.exports = mongoose.model('User', UserSchema);