const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary v1
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for academic resources (PDFs)
const resourceStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'campusos/resources',
    resource_type: 'raw',   // required for PDFs
    allowed_formats: ['pdf'],
  },
});

// Storage for profile photos (images)
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'campusos/profiles',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill' }],
  },
});

const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10 MB

const uploadResource = multer({
  storage: resourceStorage,
  limits: { fileSize: FILE_SIZE_LIMIT },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed.'), false);
    }
  },
});

const uploadProfile = multer({
  storage: profileStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB for profile photos
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'), false);
    }
  },
});

module.exports = { cloudinary, uploadResource, uploadProfile };
