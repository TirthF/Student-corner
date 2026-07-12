const Resource = require('../models/Resource');
const Download = require('../models/Download');
const Bookmark = require('../models/Bookmark');
const Notification = require('../models/Notification');
const { cloudinary } = require('../config/cloudinary');

/**
 * GET /api/resources
 * Public query: filter by semester, branch, type, status (defaults to 'published')
 */
const getResources = async (req, res) => {
  try {
    const { semester, branch, type, status = 'published', page = 1, limit = 20 } = req.query;
    const query = { status };

    if (semester) query.semester = parseInt(semester);
    if (branch) query.branch = branch;
    if (type) query.type = type;

    const resources = await Resource.find(query)
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Resource.countDocuments(query);

    res.json({ resources, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('GetResources error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * GET /api/resources/:id
 * Get a single resource by ID.
 */
const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('uploadedBy', 'name email')
      .populate('approvedBy', 'name');

    if (!resource) return res.status(404).json({ message: 'Resource not found.' });
    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * GET /api/resources/:id/download
 * Increments download count, logs download, returns the file URL.
 */
const downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource || resource.status !== 'published') {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    // Increment counter
    await Resource.findByIdAndUpdate(req.params.id, { $inc: { downloadCount: 1 } });

    // Log download event
    await Download.create({ user: req.dbUser._id, resource: resource._id });

    // Return the Cloudinary URL (frontend will open it in a new tab)
    res.json({ fileUrl: resource.fileUrl, title: resource.title });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * POST /api/resources
 * Upload a new resource (file goes via multer → Cloudinary before this runs).
 */
const uploadResource = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'PDF file is required.' });
    }

    const { title, subject, subjectCode, semester, branch, type, description } = req.body;

    if (!title || !subject || !semester || !branch || !type) {
      return res.status(400).json({ message: 'title, subject, semester, branch, and type are required.' });
    }

    // Faculty uploads are auto-published; student uploads are pending
    const status = req.dbUser.role === 'student' ? 'pending' : 'published';
    const approvedBy = req.dbUser.role !== 'student' ? req.dbUser._id : null;

    const resource = await Resource.create({
      title,
      subject,
      subjectCode: subjectCode || '',
      semester: parseInt(semester),
      branch,
      type,
      description: description || '',
      fileUrl: req.file.path,        // Cloudinary URL
      cloudinaryId: req.file.filename, // Cloudinary public_id
      uploadedBy: req.dbUser._id,
      status,
      approvedBy,
    });

    res.status(201).json({
      message:
        status === 'pending'
          ? 'Resource uploaded successfully. Pending faculty approval.'
          : 'Resource published.',
      resource,
    });
  } catch (error) {
    console.error('UploadResource error:', error);
    res.status(500).json({ message: 'Server error during upload.' });
  }
};

/**
 * GET /api/resources/my-uploads
 * Returns all resources uploaded by the authenticated user.
 */
const getMyUploads = async (req, res) => {
  try {
    const resources = await Resource.find({ uploadedBy: req.dbUser._id })
      .sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * GET /api/resources/bookmarks
 * Returns bookmarked resources for the authenticated user.
 */
const getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.dbUser._id })
      .populate({
        path: 'resource',
        populate: { path: 'uploadedBy', select: 'name' },
      })
      .sort({ createdAt: -1 });

    const resources = bookmarks.map((b) => b.resource).filter(Boolean);
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * POST /api/resources/:id/bookmark
 * Toggle bookmark on a resource.
 */
const toggleBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.dbUser._id;

    const existing = await Bookmark.findOne({ user: userId, resource: id });
    if (existing) {
      await Bookmark.deleteOne({ _id: existing._id });
      return res.json({ bookmarked: false });
    } else {
      await Bookmark.create({ user: userId, resource: id });
      return res.json({ bookmarked: true });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * GET /api/resources/bookmark-status/:id
 * Returns whether the current user has bookmarked a resource.
 */
const getBookmarkStatus = async (req, res) => {
  try {
    const bm = await Bookmark.findOne({ user: req.dbUser._id, resource: req.params.id });
    res.json({ bookmarked: !!bm });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  getResources,
  getResourceById,
  downloadResource,
  uploadResource,
  getMyUploads,
  getBookmarks,
  toggleBookmark,
  getBookmarkStatus,
};
