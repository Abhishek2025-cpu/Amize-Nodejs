// controllers/authController.js

const bcrypt = require('bcryptjs');
const { z } = require('zod');
const User = require('../models/User');
// ---> IMPORT THE NEW FUNCTIONS
const { sendVerificationCodeEmail, generateVerificationCode } = require('../services/emailService');

// ... (registerSchema remains the same)

const register = async (req, res) => {
    try {
        // 1. Validate incoming data
        const validationResult = registerSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({ /* ... error response ... */ });
        }
        
        const { username, email, password, firstName, lastName, dateOfBirth } = validationResult.data;

        // 2. Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            // If the user exists but is not verified, we could re-send the code.
            // For now, let's keep it simple.
            const message = existingUser.email === email ? 'An account with this email already exists.' : 'This username is already taken.';
            return res.status(409).json({ success: false, message });
        }

        // 3. Hash the password
        const passwordHash = await bcrypt.hash(password, 10);

        // 4. Generate verification code and expiry
        const verificationCode = generateVerificationCode(6);
        const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // 5. Create a new user instance
        const newUser = new User({
            username,
            email,
            passwordHash,
            firstName,
            lastName,
            dateOfBirth,
            verificationCode,         // <-- SAVE THE CODE
            verificationCodeExpiry,   // <-- SAVE THE EXPIRY
            isVerified: false,        // <-- START AS NOT VERIFIED
        });

        const savedUser = await newUser.save();

        // 6. Send the VERIFICATION email (non-blocking)
        sendVerificationCodeEmail(savedUser.email, savedUser.firstName, savedUser.verificationCode)
            .catch(err => {
                // This is a critical failure, as the user can't verify.
                // We should log this seriously.
                console.error(`FATAL: Failed to send verification email to ${savedUser.email}`, err);
            });
        
        // 7. Respond to the client
        return res.status(201).json({
            success: true,
            // CHANGE THE MESSAGE!
            message: 'Registration successful! Please check your email for a verification code.',
            // It's useful to send the email back for the frontend to display.
            data: { email: savedUser.email } 
        });

    } catch (error) {
        console.error('--- REGISTRATION ERROR ---:', error);
        res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ success: false, message: 'Email and verification code are required.' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        if (user.isVerified) {
            return res.status(400).json({ success: false, message: 'Email is already verified.' });
        }

        if (user.verificationCode !== code || user.verificationCodeExpiry < new Date()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired verification code.' });
        }

        // --- SUCCESS ---
        user.isVerified = true;
        user.verificationCode = undefined; // Clear the code
        user.verificationCodeExpiry = undefined; // Clear the expiry
        await user.save();
        
        // NOW, send the welcome email!
        sendWelcomeEmail(user.email, user.firstName).catch(err => {
             console.error(`Failed to send welcome email post-verification to ${user.email}`, err);
        });

        // Here you would also generate JWT tokens for auto-login
        // const token = generateToken(user._id);

        res.status(200).json({ success: true, message: 'Email verified successfully! Welcome to Amize.' });

    } catch (error) {
        console.error('--- EMAIL VERIFICATION ERROR ---:', error);
        res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
};

module.exports = {
    register,
    verifyEmail, // <-- ADD THE NEW FUNCTION
};