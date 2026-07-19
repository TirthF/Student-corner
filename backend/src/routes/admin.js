const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const {
  getAdminStats,
  getPendingResources,
  approveResource,
  rejectResource,
  getUsers,
  createUser,
  deactivateUser,
  reactivateUser,
  updateUserRole,
  getNotifications,
  markNotificationsRead,
  getStudentDashboardStats,
} = require('../controllers/adminController');

// ─── Available to ALL authenticated users ────────────────────────────────────
router.get('/notifications', authenticate, getNotifications);
router.patch('/notifications/mark-read', authenticate, markNotificationsRead);
router.get('/dashboard-stats', authenticate, getStudentDashboardStats);

// ─── Faculty + Admin: approval queue ─────────────────────────────────────────
router.get('/pending', authenticate, requireRole('faculty', 'admin'), getPendingResources);
router.patch('/resources/:id/approve', authenticate, requireRole('faculty', 'admin'), approveResource);
router.patch('/resources/:id/reject', authenticate, requireRole('faculty', 'admin'), rejectResource);

// ─── Admin only ───────────────────────────────────────────────────────────────
router.get('/stats', authenticate, requireRole('admin'), getAdminStats);
router.get('/users', authenticate, requireRole('admin'), getUsers);
router.post('/users', authenticate, requireRole('admin'), createUser);
router.patch('/users/:id/role', authenticate, requireRole('admin'), updateUserRole);
router.patch('/users/:id/deactivate', authenticate, requireRole('admin'), deactivateUser);
router.patch('/users/:id/reactivate', authenticate, requireRole('admin'), reactivateUser);

module.exports = router;
