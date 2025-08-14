const express = require('express');
const router = express.Router();
const { createProfile, getProfileById } = require('../controllers/userProfileController');
const upload = require('../middleware/upload');

router.post('/add', upload.fields([{ name: 'profileImage' }, { name: 'bannerImage' }]), createProfile);
router.get('/:id', getProfileById);

module.exports = router;
