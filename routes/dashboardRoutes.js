const express = require("express");
const router = express.Router();
const { getMe } = require("../controllers/dashboardController");

router.get("/auth/me", getMe);

module.exports = router;
