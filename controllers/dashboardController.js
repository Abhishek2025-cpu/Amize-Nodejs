const User = require("../models/User"); // Adjust path to your User model

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private (custom token = user _id)
const getMe = async (req, res) => {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "No authentication header found"
            });
        }

        // Expecting format: Bearer <_id>
        const tokenParts = authHeader.split(" ");
        if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
            return res.status(400).json({
                success: false,
                message: "Invalid authorization format"
            });
        }

        const userId = tokenParts[1];

        // Find user by _id
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error("getMe error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = { getMe };
