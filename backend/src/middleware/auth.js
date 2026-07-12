const admin = require('../config/firebase');
const User = require('../models/User');

/**
 * verifyToken — Only verifies the Firebase ID token.
 * Does NOT require a MongoDB profile to exist.
 * Use this for the /register route where profile doesn't exist yet.
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No authorization token provided.' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      req.firebaseUser = decodedToken;
      next();
    } catch (firebaseErr) {
      console.error('[verifyToken] Firebase error:');
      console.error('  Code   :', firebaseErr.code);
      console.error('  Message:', firebaseErr.message);

      if (firebaseErr.code === 'auth/id-token-expired') {
        return res.status(401).json({ message: 'Session expired. Please log in again.' });
      }
      if (firebaseErr.code?.includes('credential')) {
        console.error('[verifyToken] ⚠️  Firebase Admin SDK credential misconfiguration!');
        console.error('   → Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env');
        return res.status(500).json({ message: 'Server authentication configuration error.' });
      }
      return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
    }
  } catch (error) {
    console.error('[verifyToken] Unexpected error:', error);
    return res.status(500).json({ message: 'Authentication service error.' });
  }
};

/**
 * authenticate — Verifies Firebase token AND requires a matching MongoDB profile.
 * Use this for all protected routes AFTER registration.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No authorization token provided.' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (firebaseErr) {
      console.error('[Auth] Firebase token verification FAILED:');
      console.error('  Code   :', firebaseErr.code);
      console.error('  Message:', firebaseErr.message);

      if (firebaseErr.code === 'auth/id-token-expired') {
        return res.status(401).json({ message: 'Session expired. Please log in again.' });
      }
      if (firebaseErr.code === 'auth/argument-error') {
        return res.status(401).json({ message: 'Malformed token. Please log in again.' });
      }
      if (firebaseErr.code?.includes('credential')) {
        console.error('[Auth] ⚠️  Firebase Admin SDK credential misconfiguration!');
        console.error('   → Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env');
        return res.status(500).json({ message: 'Server authentication configuration error. Contact admin.' });
      }
      return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
    }

    req.firebaseUser = decodedToken;

    // Fetch MongoDB profile
    const dbUser = await User.findOne({ firebaseUid: decodedToken.uid });
    if (!dbUser) {
      console.warn(`[Auth] Orphaned account — Firebase UID: ${decodedToken.uid} (${decodedToken.email}) has no MongoDB profile.`);
      return res.status(401).json({
        message: 'User profile not found.',
        code: 'PROFILE_MISSING',
      });
    }

    if (dbUser.isDeactivated) {
      return res.status(403).json({ message: 'Your account has been deactivated. Contact admin.' });
    }

    req.dbUser = dbUser;
    next();
  } catch (error) {
    console.error('[Auth] Unexpected middleware error:', error);
    return res.status(500).json({ message: 'Authentication service error.' });
  }
};

/**
 * requireRole — Role-based access control.
 * Usage: requireRole('admin') or requireRole('faculty', 'admin')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.dbUser) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }
    if (!roles.includes(req.dbUser.role)) {
      console.warn(`[Auth] Role denied: ${req.dbUser.email} (${req.dbUser.role}) tried route requiring [${roles.join('|')}]`);
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

module.exports = { verifyToken, authenticate, requireRole };
