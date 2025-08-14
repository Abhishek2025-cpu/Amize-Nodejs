const UserProfile = require('../models/UserProfile');
const cloudinary = require('../config/cloudinary');

// Helper: upload to Cloudinary
const uploadToCloudinary = async (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

// Create Profile
exports.createProfile = async (req, res) => {
  try {
    let profileImageUrl = null;
    let bannerImageUrl = null;

    if (req.files?.profileImage) {
      profileImageUrl = await uploadToCloudinary(req.files.profileImage[0].buffer, 'profiles');
    }

    if (req.files?.bannerImage) {
      bannerImageUrl = await uploadToCloudinary(req.files.bannerImage[0].buffer, 'profiles');
    }

    const profile = new UserProfile({
      ...req.body,
      profileImage: profileImageUrl,
      bannerImage: bannerImageUrl
    });

    await profile.save();
    res.status(201).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get Profile by User ID
exports.getProfileById = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ userId: req.params.id })
      .populate('userId', 'username email')
      .populate('interests');

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

