const Joi = require('joi');

const registerSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    profileImageUrl: Joi.string().uri().allow(null, ''),
    adminInviteToken: Joi.string().allow(null, '')
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const updateProfileSchema = Joi.object({
    name: Joi.string().min(3).max(30),
    email: Joi.string().email(),
    currentPassword: Joi.string(),
    newPassword: Joi.string().min(6),
    profileImageUrl: Joi.string().uri().allow(null, ''),
    preferences: Joi.object() // More detailed schema can be added here if needed
});

const updatePreferencesSchema = Joi.object({
    preferences: Joi.object(), // Define more specific schema if needed
    notificationSettings: Joi.object({ // Define more specific schema if needed
        emailNotifications: Joi.boolean(),
        pushNotifications: Joi.boolean(),
        // Add other notification settings here
    })
});

const updateNotificationSettingsSchema = Joi.object({
    emailNotifications: Joi.boolean(),
    pushNotifications: Joi.boolean(),
    notificationSettings: Joi.object() // More detailed schema can be added here if needed
});

const deleteAccountSchema = Joi.object({
    password: Joi.string().required(),
    confirmation: Joi.string().valid('DELETE MY ACCOUNT').required()
});

module.exports = {
    registerSchema,
    loginSchema,
    updateProfileSchema,
    updatePreferencesSchema,
    updateNotificationSettingsSchema,
    deleteAccountSchema
};
