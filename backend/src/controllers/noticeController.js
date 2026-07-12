const Notice = require('../models/Notice');
const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * GET /api/notices
 * Paginated, newest-first. Optional category filter.
 */
const getNotices = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const query = { isActive: true };
    if (category && category !== 'All') query.category = category;

    const notices = await Notice.find(query)
      .populate('postedBy', 'name role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Notice.countDocuments(query);

    res.json({ notices, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('GetNotices error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * POST /api/notices
 * Faculty or Admin can post notices.
 */
const createNotice = async (req, res) => {
  try {
    const { title, body, category = 'General' } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required.' });
    }

    const notice = await Notice.create({
      title,
      body,
      category,
      postedBy: req.dbUser._id,
    });

    // Notify all active students (fire-and-forget — don't block response)
    User.find({ role: 'student', isDeactivated: false }, '_id').then((students) => {
      const notifications = students.map((s) => ({
        user: s._id,
        type: 'new_notice',
        message: `New notice: ${title}`,
        link: '/notices',
      }));
      Notification.insertMany(notifications).catch(console.error);
    });

    res.status(201).json({ message: 'Notice posted.', notice });
  } catch (error) {
    console.error('CreateNotice error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * DELETE /api/notices/:id
 * Admin can soft-delete (deactivate) notices.
 */
const deleteNotice = async (req, res) => {
  try {
    await Notice.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Notice removed.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getNotices, createNotice, deleteNotice };
