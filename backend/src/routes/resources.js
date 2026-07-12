const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { uploadResource: multerUpload } = require('../config/cloudinary');
const {
  getResources,
  getResourceById,
  downloadResource,
  uploadResource,
  getMyUploads,
  getBookmarks,
  toggleBookmark,
  getBookmarkStatus,
} = require('../controllers/resourceController');

// Public (still requires auth to track downloads)
router.get('/', authenticate, getResources);
router.get('/my-uploads', authenticate, getMyUploads);
router.get('/bookmarks', authenticate, getBookmarks);
router.get('/:id', authenticate, getResourceById);
router.get('/:id/download', authenticate, downloadResource);
router.get('/:id/bookmark-status', authenticate, getBookmarkStatus);

// Upload — multer handles file → Cloudinary before controller runs
router.post('/', authenticate, multerUpload.single('file'), uploadResource);

// Bookmark toggle
router.post('/:id/bookmark', authenticate, toggleBookmark);

module.exports = router;
