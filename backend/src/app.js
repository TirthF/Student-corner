// ─── Fix DNS resolution BEFORE anything else ──────────────────────────────────
// Required on some Windows/ISP setups where MongoDB SRV lookup fails
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

require('dotenv').config();

// ─── Validate required env vars immediately ────────────────────────────────────
const REQUIRED_ENV = ['MONGODB_URI', 'FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error('❌ Missing required environment variables:', missing.join(', '));
  console.error('   Check your backend/.env file.');
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// ─── Initialize DB ────────────────────────────────────────────────────────────
connectDB();

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/notices',   require('./routes/notices'));
app.use('/api/admin',     require('./routes/admin'));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      mongoConnected: require('mongoose').connection.readyState === 1,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      allowedDomain: process.env.ALLOWED_EMAIL_DOMAIN,
    },
  });
});

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err.stack);
  if (err.message && err.message.includes('Only PDF')) {
    return res.status(400).json({ message: err.message });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File exceeds 10 MB size limit.' });
  }
  res.status(500).json({ message: 'Internal server error.' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 CampusOS backend running on port ${PORT}`);
  console.log(`   Allowed email domain: ${process.env.ALLOWED_EMAIL_DOMAIN || '@adit.ac.in'}`);
  console.log(`   Firebase project: ${process.env.FIREBASE_PROJECT_ID}`);
});

module.exports = app;
