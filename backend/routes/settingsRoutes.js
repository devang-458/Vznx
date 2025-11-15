const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  updateProfile,
  getPreferences,
  updatePreferences,
  deleteAccount,
  exportUserData
} = require('../controller/settingsController');

const router = express.Router();

// All settings endpoints require authentication
router.put('/profile', protect, updateProfile);
router.get('/preferences', protect, getPreferences);
router.put('/preferences', protect, updatePreferences);
router.delete('/account', protect, deleteAccount);
router.get('/export-data', protect, exportUserData);

module.exports = router;
