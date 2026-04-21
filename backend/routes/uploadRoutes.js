const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { upload: cloudinaryUpload } = require('../config/cloudinary');

// Configure local storage fallback
const localStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
}

const localUpload = multer({
  storage: localStorage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// @desc    Upload image
// @route   POST /api/upload
// @access  Public
router.post('/', (req, res) => {
  const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY;
  
  const uploadHandler = useCloudinary 
    ? cloudinaryUpload.single('image') 
    : localUpload.single('image');

  uploadHandler(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).send({ message: err.message || err });
    }
    
    if (!req.file) {
      console.warn('Upload attempt with no file');
      return res.status(400).send({ message: 'No file uploaded' });
    }

    const imageUrl = useCloudinary ? req.file.path : `/${req.file.path.replace(/\\/g, '/')}`;
    console.log('Image Uploaded successfully:', imageUrl);

    res.send({
      message: 'Image Uploaded',
      imageUrl: imageUrl,
    });
  });
});

module.exports = router;

