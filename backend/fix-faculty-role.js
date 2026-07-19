/**
 * fix-faculty-role.js
 * One-time script: sets role='faculty' for faculty@adit.ac.in in MongoDB.
 * Run with: node fix-faculty-role.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const FACULTY_EMAIL = process.env.SEED_FACULTY_EMAIL || 'faculty@adit.ac.in';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const User = require('./src/models/User');

  const result = await User.findOneAndUpdate(
    { email: FACULTY_EMAIL },
    { $set: { role: 'faculty' } },
    { new: true }
  );

  if (!result) {
    console.error(`❌ No user found with email: ${FACULTY_EMAIL}`);
  } else {
    console.log(`✅ Updated role for ${result.email} → role: ${result.role}`);
  }

  await mongoose.disconnect();
  console.log('Disconnected. Done.');
}

main().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});
