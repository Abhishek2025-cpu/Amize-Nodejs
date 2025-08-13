// controllers/authController.js

const bcrypt = require('bcryptjs');
const { z } = require('zod');
const User = require('../models/User');
// ---> IMPORT THE EMAIL SERVICE FUNCTIONS
const { sendWelcomeEmail, sendVerificationCodeEmail, generateVerificationCode } = require('../services/emailService');


// =========================================================
//                  CORRECTED SECTION
// =========================================================
// Define the Zod validation schema for registration
const registerSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters.").max(30),
    email: z.string().email("Invalid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
    firstName: z.string().min(2, "First name is required."),
    lastName: z.string().min(2, "Last name is required."),
    dateOfBirth: z.string().transform((val) => new Date(val)),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Point the error to the confirmPassword field
});
// =========================================================


const register = async (req, res) => {
    try {
        // 1. Validate incoming data
        const validationResult = registerSchema.safeParse(req.body);
        if (!validationResult.success) {
            // Send back the validation errors
            return res.status(400).json({
                success: false,
                message: 'Validation failed.',
                errors: validationResult.error.flatten().fieldErrors,
            });
        }
        
        const { username, email, password, firstName, lastName, dateOfBirth } = validationResult.data;

        // 2. Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] });
        if (existingUser) {
            const message = existingUser.email === email.toLowerCase() ? 'An account with this email already exists.' : 'This username is already taken.';
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
            verificationCode,
            verificationCodeExpiry,
            isVerified: false,
        });

        const savedUser = await newUser.save();

        // 6. Send the VERIFICATION email
        sendVerificationCodeEmail(savedUser.email, savedUser.firstName, savedUser.verificationCode)
            .catch(err => {
                console.error(`FATAL: Failed to send verification email to ${savedUser.email}`, err);
            });
        
        // 7. Respond to the client
        return res.status(201).json({
            success: true,
            message: 'Registration successful! Please check your email for a verification code.',
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
        user.verificationCode = undefined;
        user.verificationCodeExpiry = undefined;
        await user.save();
        


// send the welcome email and WAIT for the result.
await sendWelcomeEmail(user.email, user.firstName);

// This line will only be reached if the email sends successfully.
res.status(200).json({ success: true, message: 'Email verified successfully! Welcome to Amize.' });

    } catch (error) {
        console.error('--- EMAIL VERIFICATION ERROR ---:', error);
        res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
};


// This is the login function that goes inside controllers/authController.js
const login = async (req, res) => {
    try {
        console.log("📥 Request body:", req.body);

        const { email, password } = req.body;

        // Basic required field checks
        if (!email) {
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: "Email is required."
            });
        }

        if (!password) {
            return res.status(400).json({
                statusCode: 400,
                success: false,
                message: "Password is required."
            });
        }

        console.log("🔍 Searching for user:", email.toLowerCase());

        const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

        if (!user) {
            return res.status(401).json({
                statusCode: 401,
                success: false,
                message: 'Invalid credentials.'
            });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);

        if (!isMatch) {
            return res.status(401).json({
                statusCode: 401,
                success: false,
                message: 'Invalid credentials.'
            });
        }

        return res.status(200).json({
            statusCode: 200,
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isVerified: !!user.email // ✅ true if verified
            }
        });

    } catch (error) {
        console.error("❌ LOGIN ERROR:", error);
        return res.status(500).json({
            statusCode: 500,
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};









module.exports = {
    register,
    verifyEmail,
      login, 
};