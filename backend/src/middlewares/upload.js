const multer = require("multer");

const storage = multer.memoryStorage(); // 👈 important for ImageKit

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

module.exports = upload;
