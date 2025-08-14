const multer = require('multer');
const storage = multer.memoryStorage(); // Store file in memory before upload
module.exports = multer({ storage });
