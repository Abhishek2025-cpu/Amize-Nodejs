// routes/auth.js

const express = require('express');
const router = express.Router();
const { register } = require('../controllers/authController'); // Import the controller function

// Test route - good to keep for debugging
router.get('/test', (req, res) => {
    res.status(200).json({ message: "Auth route is working!" });
});

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', register);


// You will add other routes here later
// router.post('/login', login);
// router.post('/verify-email', verifyEmail);


module.exports = router;

