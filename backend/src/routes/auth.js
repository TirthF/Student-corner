const express = require('express');
const router = express.Router();
const { verifyToken, authenticate } = require('../middleware/auth');
const { uploadProfile } = require('../config/cloudinary');
const { register, getMe, updateProfile } = require('../controllers/authController');

// POST /api/auth/register
// Uses verifyToken (NOT authenticate) because MongoDB profile doesn't exist yet
router.post('/register', verifyToken, register);

// GET /api/auth/me — requires full auth (Firebase token + MongoDB profile)
router.get('/me', authenticate, getMe);

// PATCH /api/auth/profile — update profile
router.patch('/profile', authenticate, uploadProfile.single('profilePhoto'), updateProfile);

module.exports = router;
