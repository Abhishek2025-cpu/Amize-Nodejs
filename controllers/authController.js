// controllers/authController.js

const bcrypt = require('bcryptjs');
const { z } = require('zod');
const User = require('../models/User'); // Import the Mongoose model
const { sendWelcomeEmail } = require('../services/emailService'); // Import the email service

// Re-create the Zod validation schema from your frontend
// This ensures backend validation is always enforced
const registerSchema = z.object({
    username: z.string().min(3).max(30),
    email: z.string().email(),
    password: z.string().min(8), // Can add more complex regex later if needed
    confirmPassword: z.string(),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    dateOfBirth: z.string().transform(val => new Date(val)),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});


const register = async (req, res) => {
    try {
        // 1. Validate incoming data
        const validationResult = registerSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed.',
                errors: validationResult.error.flatten().fieldErrors,
            });
        }
        
        const { username, email, password, firstName, lastName, dateOfBirth } = validationResult.data;

        // 2. Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            const message = existingUser.email === email ? 'An account with this email already exists.' : 'This username is already taken.';
            return res.status(409).json({ success: false, message });
        }

        // 3. Hash the password
        const passwordHash = await bcrypt.hash(password, 10);

        // 4. Create a new user instance
        const newUser = new User({
            username,
            email,
            passwordHash,
            firstName,
            lastName,
            dateOfBirth,
            // You can set verification codes here if you're sending a verification email first
        });

        // The 'pre-save' hook in the model will calculate fullName and age
        const savedUser = await newUser.save();

        // 5. Send a welcome email (non-blocking)
        sendWelcomeEmail(savedUser.email, savedUser.firstName).catch(err => {
            // Log the error but don't fail the registration if the email fails
            console.error(`Failed to send welcome email to ${savedUser.email}`, err);
        });

        // 6. Respond to the client (DON'T send back the password hash)
        const userForResponse = {
            id: savedUser._id,
            username: savedUser.username,
            email: savedUser.email,
            firstName: savedUser.firstName,
            lastName: savedUser.lastName,
            createdAt: savedUser.createdAt,
        };

        return res.status(201).json({
            success: true,
            message: 'Registration successful! Welcome to Amize.',
            user: userForResponse,
        });

    } catch (error) {
        console.error('--- REGISTRATION ERROR ---:', error);
        res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
};

module.exports = {
    register,
    // You will add login, verifyEmail, etc. functions here later
};