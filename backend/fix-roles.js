/**
 * fix-roles.js
 *
 * Fixes accounts that were registered through the public Register page
 * (which always creates "student") but should be faculty or admin.
 *
 * Usage:
 *   node fix-roles.js
 *
 * It reads SEED_FACULTY_EMAIL and SEED_ADMIN_EMAIL from .env and
 * updates their roles in MongoDB.
 */

const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
  console.log('🔧 CampusOS Role Fixer\n');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected\n');

  const User = require('./src/models/User');

  const fixes = [
    {
      email: process.env.SEED_ADMIN_EMAIL || 'admin@adit.ac.in',
      role: 'admin',
      name: 'Admin',
    },
    {
      email: process.env.SEED_FACULTY_EMAIL || 'faculty@adit.ac.in',
      role: 'faculty',
      name: 'Faculty',
    },
  ];

  for (const fix of fixes) {
    const user = await User.findOne({ email: fix.email.toLowerCase() });

    if (!user) {
      console.log(`⚠️  Not found in MongoDB: ${fix.email}`);
      console.log(`   → Register this account first, then re-run this script.\n`);
      continue;
    }

    if (user.role === fix.role) {
      console.log(`✅ ${fix.email} already has role "${fix.role}" — no change needed.`);
      continue;
    }

    const oldRole = user.role;
    user.role = fix.role;
    await user.save();

    console.log(`✅ Fixed: ${fix.email}`);
    console.log(`   Role changed: "${oldRole}" → "${fix.role}"\n`);
  }

  // Show all users summary
  console.log('\n📋 All users in database:');
  const allUsers = await User.find({}, 'email role name').sort({ role: 1 });
  allUsers.forEach(u => {
    const icon = u.role === 'admin' ? '🔴' : u.role === 'faculty' ? '🟡' : '🟢';
    console.log(`  ${icon} ${u.email.padEnd(35)} [${u.role}] — ${u.name}`);
  });

  await mongoose.disconnect();
  console.log('\n✅ Done! Restart your backend server for changes to take effect.');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Script error:', err.message);
  process.exit(1);
});
