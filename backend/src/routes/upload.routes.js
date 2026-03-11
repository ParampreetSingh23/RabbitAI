const express = require('express');
const multer = require('multer');
const rateLimiter = require('../middleware/rateLimiter');
const fileValidator = require('../middleware/fileValidator');
const uploadController = require('../controllers/upload.controller');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

router.post(
  '/upload',
  rateLimiter,
  upload.single('file'),
  fileValidator,
  uploadController.handleUpload
);

module.exports = router;
