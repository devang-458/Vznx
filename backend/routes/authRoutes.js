const { Router } = require("express");
const { 
    registerUser, 
    loginUser, 
    getUserProfile, 
    updateUserProfile,
    getPreferences,
    updatePreferences,
    updateNotificationSettings,
    deleteAccount,
    exportUserData
} = require("../controller/authController.js");
const { protect } = require("../middleware/authMiddleware.js");
const validate = require('../middleware/validationMiddleware.js'); // Import validate middleware
const { 
    registerSchema, 
    loginSchema, 
    updateProfileSchema, 
    updatePreferencesSchema, 
    updateNotificationSettingsSchema, 
    deleteAccountSchema 
} = require('../validation/authValidation.js'); // Import Joi schemas
const upload = require("../middleware/uploadMiddleware.js")

const router = Router();

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, validate(updateProfileSchema), updateUserProfile);
router.get('/preferences', protect, getPreferences);
router.put('/preferences', protect, validate(updatePreferencesSchema), updatePreferences);
router.put('/notifications', protect, validate(updateNotificationSettingsSchema), updateNotificationSettings);
router.delete('/account', protect, validate(deleteAccountSchema), deleteAccount);
router.get('/export-data', protect, exportUserData);

router.post("/upload-image", upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            message: 'No file uploaded'
        })
    }
    const imageUrl = `${req.protocol}://${req.get('host')}/upload/${req.file.filename}`

    res.status(200).json({ imageUrl })
})

module.exports = router;