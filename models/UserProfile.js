const mongoose = require('mongoose');

const UserProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Link to existing User

  // Creator/Admin/General fields
  role: { type: String, default: 'USER' },
  creatorVerified: { type: Boolean, default: false },
  creatorCategory: { type: String },
  monetizationEnabled: { type: Boolean, default: false },
  adminPermissions: { type: String },

  forgotPasswordToken: { type: String },
  forgotPasswordExpiry: { type: Date },
  verificationCode: { type: String },
  verificationCodeExpiry: { type: Date },
  verified: { type: Boolean, default: false },
  pin: { type: String },

  // Media fields
  profileImage: { type: String },
  bannerImage: { type: String },

  // Interests stored as strings
  interests: [String],

  // Count fields instead of storing arrays
  _count: {
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
    videos: { type: Number, default: 0 }
  },

  isOnline: { type: Boolean, default: false },
  lastSeenAt: { type: Date },
  isEligibleForCreator: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date },
  deactivatedAt: { type: Date }
});

module.exports = mongoose.model('UserProfile', UserProfileSchema);
