// routes/auth.js

const express = require('express');
const router = express.Router();

const { register, verifyEmail ,login} = require('../controllers/authController');

router.post('/register', register);

// @route   POST /api/auth/verify-email
// @desc    Verify user's email with a code
// @access  Public
router.post('/verify-email', verifyEmail);
router.post('/login', login);


module.exports = router;

