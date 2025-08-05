// models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        lowercase: true,
        minlength: 3,
        maxlength: 30,
        match: /^[a-zA-Z0-9_@.]+$/,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
    },
    passwordHash: {
        type: String,
        required: [true, 'Password is required'],
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
    },
    fullName: {
        type: String,
    },
    dateOfBirth: {
        type: Date,
        required: true,
    },
    age: {
        type: Number,
    },
    bio: {
        type: String,
        maxlength: 80,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    },
    profilePhotoUrl: {
        type: String,
        default: 'https://default-avatar-url.com/avatar.png', // Add a default avatar
    },
    isVerified: {
        type: Boolean,
        default: false, // Starts as false until user verifies email
    },
    verificationCode: String,
    verificationCodeExpiry: Date,
    // Add other fields from your Zod schema as needed
    // interests, pin, deviceId, etc.
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Middleware to automatically set fullName and age before saving
userSchema.pre('save', function(next) {
    if (this.isModified('firstName') || this.isModified('lastName')) {
        this.fullName = `${this.firstName} ${this.lastName}`;
    }
    if (this.isModified('dateOfBirth')) {
        const today = new Date();
        let age = today.getFullYear() - this.dateOfBirth.getFullYear();
        const m = today.getMonth() - this.dateOfBirth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < this.dateOfBirth.getDate())) {
            age--;
        }
        this.age = age;
    }
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;