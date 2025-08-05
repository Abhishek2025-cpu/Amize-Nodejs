// routes/auth.js

const express = require('express');
const router = express.Router();

const { register, verifyEmail } = require('../controllers/authController');

router.post('/register', register);

// @route   POST /api/auth/verify-email
// @desc    Verify user's email with a code
// @access  Public
router.post('/verify-email', verifyEmail);


module.exports = router;

