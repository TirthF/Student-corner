const admin = require('../config/firebase');
const User = require('../models/User');

const ALLOWED_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || '@adit.ac.in';

/**
 * POST /api/auth/register
 *
 * IDEMPOTENT: If a Firebase account already exists but the MongoDB profile
 * was never created (orphaned state), this endpoint will CREATE the profile
 * rather than failing with "email already in use".
 *
 * Flow:
 *  1. Client creates Firebase account (or Firebase account already exists)
 *  2. Client gets ID token and calls this endpoint
 *  3. We verify the token → get the Firebase UID
 *  4. Upsert the MongoDB profile (create if missing, return existing if found)
 */
const register = async (req, res) => {
  try {
    const { name, enrollmentNo, email, branch, semester } = req.body;

    // ── Server-side domain validation ──────────────────────────────────────────
    if (!email || !email.endsWith(ALLOWED_DOMAIN)) {
      return res.status(400).json({
        message: `Email must use the ${ALLOWED_DOMAIN} domain. Contact admin if you need access.`,
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required.' });
    }

    // firebaseUid comes from the verified token (attached by authenticate middleware)
    const firebaseUid = req.firebaseUser.uid;

    console.log(`[Register] Attempting profile creation for UID: ${firebaseUid} (${email})`);

    // ── IDEMPOTENT upsert ───────────────────────────────────────────────────────
    // findOneAndUpdate with upsert=true:
    //   - If profile EXISTS → returns it (no error, no duplicate)
    //   - If profile MISSING → creates it (fixes orphaned Firebase accounts)
    const user = await User.findOneAndUpdate(
      { firebaseUid },                    // find by Firebase UID
      {
        $setOnInsert: {                   // only set these on first creation
          firebaseUid,
          name: name.trim(),
          enrollmentNo: enrollmentNo?.trim() || '',
          email: email.toLowerCase(),
          branch: branch || 'CE',
          semester: semester ? parseInt(semester) : 1,
          role: 'student',
        },
      },
      {
        upsert: true,                     // create if not found
        new: true,                        // return the resulting document
        setDefaultsOnInsert: true,        // apply schema defaults on insert
      }
    );

    const isNewUser = !user.createdAt || (Date.now() - user.createdAt.getTime()) < 5000;
    console.log(`[Register] ${isNewUser ? '✅ Created new' : '⚠️ Returned existing'} profile for ${email}`);

    res.status(201).json({
      message: isNewUser ? 'Profile created successfully.' : 'Profile already existed — login to continue.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        semester: user.semester,
      },
    });
  } catch (error) {
    console.error('[Register] Error:', error);

    // Mongoose duplicate key on email field
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'An account with this email already exists. Please log in instead.',
      });
    }

    res.status(500).json({ message: 'Server error during registration. Please try again.' });
  }
};

/**
 * GET /api/auth/me
 * Returns the full profile of the authenticated user.
 */
const getMe = async (req, res) => {
  try {
    const user = req.dbUser;
    res.json({
      id: user._id,
      firebaseUid: user.firebaseUid,
      name: user.name,
      enrollmentNo: user.enrollmentNo,
      email: user.email,
      branch: user.branch,
      semester: user.semester,
      role: user.role,
      department: user.department,
      profilePhoto: user.profilePhoto,
      notificationPreferences: user.notificationPreferences,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('[GetMe] Error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * PATCH /api/auth/profile
 * Updates allowed profile fields.
 */
const updateProfile = async (req, res) => {
  try {
    const { name, semester, notificationPreferences } = req.body;
    const updates = {};

    if (name) updates.name = name.trim();
    if (semester) updates.semester = parseInt(semester);
    if (notificationPreferences) updates.notificationPreferences = notificationPreferences;

    if (req.file) {
      updates.profilePhoto = req.file.path; // Cloudinary URL
    }

    const user = await User.findByIdAndUpdate(req.dbUser._id, updates, { new: true });
    res.json({ message: 'Profile updated.', user });
  } catch (error) {
    console.error('[UpdateProfile] Error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { register, getMe, updateProfile };
