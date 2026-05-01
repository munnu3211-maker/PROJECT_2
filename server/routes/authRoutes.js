const express = require('express');
const { register, login, googleAuth, completeProfile, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);

// Protected routes
router.get('/me', protect, getMe);
router.put('/complete-profile', protect, completeProfile);
router.put('/update-profile', protect, updateProfile);

module.exports = router;
