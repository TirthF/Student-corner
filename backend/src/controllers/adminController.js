const Resource = require('../models/Resource');
const User = require('../models/User');
const Download = require('../models/Download');
const Bookmark = require('../models/Bookmark');
const Notification = require('../models/Notification');
const admin = require('../config/firebase');

const ALLOWED_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || '@adit.ac.in';

/**
 * GET /api/admin/stats
 * Overview stats for Admin Dashboard.
 */
const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalResources, pendingApprovals] = await Promise.all([
      User.countDocuments({ isDeactivated: false }),
      Resource.countDocuments({ status: 'published' }),
      Resource.countDocuments({ status: 'pending' }),
    ]);

    // "Active today" = users who have downloaded something in the last 24h (approximate)
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeToday = await Download.distinct('user', { createdAt: { $gte: since } });

    res.json({ totalUsers, totalResources, pendingApprovals, activeToday: activeToday.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * GET /api/admin/pending
 * List pending resources. Faculty sees only their department; Admin sees all.
 */
const getPendingResources = async (req, res) => {
  try {
    const query = { status: 'pending' };

    // Faculty with a specific department only see that branch
    if (req.dbUser.role === 'faculty' && req.dbUser.department) {
      query.branch = req.dbUser.department;
    }

    const resources = await Resource.find(query)
      .populate('uploadedBy', 'name email enrollmentNo branch semester')
      .sort({ createdAt: 1 }); // oldest first (FIFO queue)

    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * PATCH /api/admin/resources/:id/approve
 */
const approveResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { status: 'published', approvedBy: req.dbUser._id, rejectionReason: '' },
      { new: true }
    ).populate('uploadedBy', 'name');

    if (!resource) return res.status(404).json({ message: 'Resource not found.' });

    // Notify the uploader
    await Notification.create({
      user: resource.uploadedBy._id,
      type: 'upload_approved',
      message: `Your upload "${resource.title}" has been approved and is now live.`,
      link: `/academic?sem=${resource.semester}&branch=${resource.branch}&type=${resource.type}`,
    });

    res.json({ message: 'Resource approved.', resource });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * PATCH /api/admin/resources/:id/reject
 */
const rejectResource = async (req, res) => {
  try {
    const { reason = '' } = req.body;

    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', rejectionReason: reason, approvedBy: null },
      { new: true }
    ).populate('uploadedBy', 'name');

    if (!resource) return res.status(404).json({ message: 'Resource not found.' });

    // Notify the uploader
    await Notification.create({
      user: resource.uploadedBy._id,
      type: 'upload_rejected',
      message: `Your upload "${resource.title}" was rejected.${reason ? ` Reason: ${reason}` : ''}`,
      link: '/profile?tab=uploads',
    });

    res.json({ message: 'Resource rejected.', resource });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── User Management ──────────────────────────────────────────────────────────

/**
 * GET /api/admin/users
 * Paginated user list for Admin.
 */
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { enrollmentNo: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);
    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * POST /api/admin/users
 * Admin creates a Faculty or Admin account (not self-registerable).
 */
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, branch, semester } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password, and role are required.' });
    }
    if (!['faculty', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'This endpoint only creates faculty or admin accounts.' });
    }

    // Create Firebase Auth user
    const firebaseUser = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Create MongoDB user
    const user = await User.create({
      firebaseUid: firebaseUser.uid,
      name,
      email: email.toLowerCase(),
      role,
      department: department || null,
      branch: branch || 'CE',
      semester: semester ? parseInt(semester) : 1,
    });

    res.status(201).json({ message: `${role} account created.`, user });
  } catch (error) {
    console.error('CreateUser error:', error);
    if (error.code === 'auth/email-already-exists') {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    res.status(500).json({ message: 'Server error during account creation.' });
  }
};

/**
 * PATCH /api/admin/users/:id/deactivate
 * Soft-deactivate a user account.
 */
const deactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isDeactivated: true }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Also disable Firebase account
    await admin.auth().updateUser(user.firebaseUid, { disabled: true });

    res.json({ message: 'User deactivated.', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * PATCH /api/admin/users/:id/reactivate
 */
const reactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isDeactivated: false }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    await admin.auth().updateUser(user.firebaseUid, { disabled: false });

    res.json({ message: 'User reactivated.', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── Notifications ────────────────────────────────────────────────────────────

/**
 * GET /api/admin/notifications
 * Returns the authenticated user's last 10 notifications.
 */
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.dbUser._id })
      .sort({ createdAt: -1 })
      .limit(10);
    const unreadCount = await Notification.countDocuments({ user: req.dbUser._id, isRead: false });
    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * PATCH /api/admin/notifications/mark-read
 * Marks all notifications as read for the current user.
 */
const markNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.dbUser._id, isRead: false }, { isRead: true });
    res.json({ message: 'Notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// ─── Dashboard Stats for Student ─────────────────────────────────────────────

/**
 * GET /api/admin/dashboard-stats
 * Returns stats for the currently logged-in student's dashboard.
 */
const getStudentDashboardStats = async (req, res) => {
  try {
    const userId = req.dbUser._id;
    const [downloads, uploads, bookmarks, pendingUploads] = await Promise.all([
      Download.countDocuments({ user: userId }),
      Resource.countDocuments({ uploadedBy: userId, status: 'published' }),
      Bookmark.countDocuments({ user: userId }),
      Resource.countDocuments({ uploadedBy: userId, status: 'pending' }),
    ]);
    res.json({ downloads, uploads, bookmarks, pendingUploads });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  getAdminStats,
  getPendingResources,
  approveResource,
  rejectResource,
  getUsers,
  createUser,
  deactivateUser,
  reactivateUser,
  getNotifications,
  markNotificationsRead,
  getStudentDashboardStats,
};
