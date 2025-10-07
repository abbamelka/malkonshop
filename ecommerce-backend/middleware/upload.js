const multer = require('multer');
const path = require('path');
const { AppError } = require('../utils/errors');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/';
    
    if (file.fieldname === 'avatar') {
      folder += 'users/';
    } else if (file.fieldname === 'productImages') {
      folder += 'products/';
    } else if (file.fieldname === 'categoryImage') {
      folder += 'categories/';
    } else {
      folder += 'temp/';
    }
    
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed', 400), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Specific upload configurations
const uploadUserAvatar = upload.single('avatar');
const uploadProductImages = upload.array('productImages', 5); // max 5 images
const uploadCategoryImage = upload.single('categoryImage');

module.exports = {
  upload,
  uploadUserAvatar,
  uploadProductImages,
  uploadCategoryImage
};