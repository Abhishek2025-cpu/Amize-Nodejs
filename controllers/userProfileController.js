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
    const authUser = req.user;
    const id = req.body.userId;

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
      bannerImage: bannerImageUrl,
      _count: { followers: 0, following: 0, videos: 0 }
    });

    await profile.save();

    let isFollowing = false;
    if (authUser) {
      const followRecord = await Follow.findOne({
        followerId: authUser.userId,
        followingId: id
      });
      isFollowing = !!followRecord;
    }

    const isOwnProfile = authUser?.userId?.toString() === id?.toString();

    res.status(201).json({
      success: true,
      user: profile,
      isOwnProfile,
      isFollowing
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




// Get Profile by User ID
exports.getProfileById = async (req, res) => {
  try {
    const authUser = req.user;
    const profileOwnerId = req.params.id;

    // Fetch the profile and populate username/email
    const profile = await UserProfile.findOne({ userId: profileOwnerId })
      .populate('userId', 'username email');

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    // Manually merge _count into userId object
    const profileObj = profile.toObject();
    if (profileObj.userId) {
      profileObj.userId._count = profileObj._count; // move _count inside userId
      delete profileObj._count; // remove from root if not needed
    }

    let isFollowing = false;
    if (authUser) {
      const followRecord = await Follow.findOne({
        followerId: authUser.userId,
        followingId: profileOwnerId
      });
      isFollowing = !!followRecord;
    }

    const isOwnProfile = authUser?.userId?.toString() === profileOwnerId?.toString();

    res.status(200).json({
      success: true,
      user: profileObj,
      isOwnProfile,
      isFollowing
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




