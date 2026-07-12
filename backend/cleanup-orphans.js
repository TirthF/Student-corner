/**
 * cleanup-orphans.js
 * 
 * Finds Firebase accounts that have NO matching MongoDB profile
 * (orphaned accounts created when registration partially failed).
 * 
 * Usage:
 *   node cleanup-orphans.js          → lists orphaned accounts
 *   node cleanup-orphans.js --delete → deletes them from Firebase
 */

const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
const mongoose = require('mongoose');
const admin = require('./src/config/firebase');

const DELETE_MODE = process.argv.includes('--delete');

async function main() {
  console.log('🔍 CampusOS Orphan Account Finder');
  console.log('   Mode:', DELETE_MODE ? '🗑️  DELETE orphans' : '📋 LIST only (run with --delete to remove)');
  console.log('');

  // Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected\n');

  const User = require('./src/models/User');

  // Get all MongoDB profiles
  const mongoUsers = await User.find({}, 'firebaseUid email name role');
  const mongoUids = new Set(mongoUsers.map(u => u.firebaseUid));

  console.log(`📊 MongoDB profiles: ${mongoUsers.length}`);

  // List all Firebase users (handles pagination)
  const firebaseUsers = [];
  let nextPageToken;

  do {
    const result = await admin.auth().listUsers(1000, nextPageToken);
    firebaseUsers.push(...result.users);
    nextPageToken = result.pageToken;
  } while (nextPageToken);

  console.log(`📊 Firebase accounts: ${firebaseUsers.length}\n`);

  // Find orphans (in Firebase but NOT in MongoDB)
  const orphans = firebaseUsers.filter(fu => !mongoUids.has(fu.uid));

  if (orphans.length === 0) {
    console.log('✅ No orphaned accounts found! Everything is in sync.');
  } else {
    console.log(`⚠️  Found ${orphans.length} orphaned Firebase account(s):\n`);
    orphans.forEach((u, i) => {
      console.log(`  ${i + 1}. UID   : ${u.uid}`);
      console.log(`     Email : ${u.email || '(no email)'}`);
      console.log(`     Created: ${u.metadata.creationTime}`);
      console.log('');
    });

    if (DELETE_MODE) {
      console.log('🗑️  Deleting orphaned Firebase accounts...\n');
      for (const orphan of orphans) {
        try {
          await admin.auth().deleteUser(orphan.uid);
          console.log(`  ✅ Deleted: ${orphan.email} (${orphan.uid})`);
        } catch (err) {
          console.error(`  ❌ Failed to delete ${orphan.uid}:`, err.message);
        }
      }
      console.log('\n🎉 Cleanup complete!');
    } else {
      console.log('ℹ️  Run with --delete flag to remove these accounts:');
      console.log('   node cleanup-orphans.js --delete\n');
      console.log('   Or manually delete them in Firebase Console:');
      console.log('   Firebase Console → Authentication → Users → find by email → Delete');
    }
  }

  // Also show MongoDB users with NO matching Firebase account
  const firebaseUids = new Set(firebaseUsers.map(u => u.uid));
  const mongoOrphans = mongoUsers.filter(u => !firebaseUids.has(u.firebaseUid));

  if (mongoOrphans.length > 0) {
    console.log(`\n⚠️  Found ${mongoOrphans.length} MongoDB profile(s) with no Firebase account:`);
    mongoOrphans.forEach(u => {
      console.log(`  - ${u.email} (${u.role}) — UID: ${u.firebaseUid}`);
    });
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('Script error:', err.message);
  process.exit(1);
});
