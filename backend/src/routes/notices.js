const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { getNotices, createNotice, deleteNotice } = require('../controllers/noticeController');

// GET /api/notices — all authenticated users can read notices
router.get('/', authenticate, getNotices);

// POST /api/notices — faculty and admin only
router.post('/', authenticate, requireRole('faculty', 'admin'), createNotice);

// DELETE /api/notices/:id — admin only
router.delete('/:id', authenticate, requireRole('admin'), deleteNotice);

module.exports = router;
