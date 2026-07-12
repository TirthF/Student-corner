/**
 * CampusOS — Seed Script
 * ─────────────────────────────────────────────────────────────────────────────
 * Creates the initial Admin, a test Faculty, and a test Student account.
 * Run ONCE after setting up your .env file:
 *
 *   node seed.js
 *
 * You can re-run it safely — it skips accounts that already exist.
 * ─────────────────────────────────────────────────────────────────────────────
 */

require('dotenv').config();
const mongoose = require('mongoose');
const admin = require('./src/config/firebase');
const User = require('./src/models/User');
const Notice = require('./src/models/Notice');
const Resource = require('./src/models/Resource');

const ALLOWED_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || '@adit.ac.in';

const accounts = [
  {
    email: process.env.SEED_ADMIN_EMAIL || `admin${ALLOWED_DOMAIN}`,
    password: process.env.SEED_ADMIN_PASSWORD || 'Admin@123456',
    name: 'Campus Admin',
    role: 'admin',
    branch: 'CE',
    semester: 1,
    department: null,
  },
  {
    email: process.env.SEED_FACULTY_EMAIL || `faculty${ALLOWED_DOMAIN}`,
    password: process.env.SEED_FACULTY_PASSWORD || 'Faculty@123456',
    name: 'Dr. Test Faculty',
    role: 'faculty',
    branch: 'CE',
    semester: 1,
    department: 'CE',
  },
  {
    email: process.env.SEED_STUDENT_EMAIL || `student${ALLOWED_DOMAIN}`,
    password: process.env.SEED_STUDENT_PASSWORD || 'Student@123456',
    name: 'Test Student',
    role: 'student',
    branch: 'CE',
    semester: 3,
    enrollmentNo: 'ADIT21CE001',
    department: null,
  },
];

async function seedAccount(account) {
  const { email, password, name, role, branch, semester, department, enrollmentNo } = account;

  // Check if already exists in MongoDB
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`  ⏭  ${role} (${email}) — already exists, skipping.`);
    return existing;
  }

  // Create Firebase auth user
  let firebaseUser;
  try {
    firebaseUser = await admin.auth().createUser({ email, password, displayName: name });
    console.log(`  ✅ Firebase user created: ${email}`);
  } catch (err) {
    if (err.code === 'auth/email-already-exists') {
      // Firebase user exists but MongoDB doc doesn't — fetch the Firebase user
      firebaseUser = await admin.auth().getUserByEmail(email);
      console.log(`  ♻️  Firebase user fetched (already existed): ${email}`);
    } else {
      throw err;
    }
  }

  // Create MongoDB document
  const user = await User.create({
    firebaseUid: firebaseUser.uid,
    name,
    email: email.toLowerCase(),
    role,
    branch,
    semester,
    department: department || null,
    enrollmentNo: enrollmentNo || '',
  });

  console.log(`  ✅ MongoDB profile created: ${name} (${role})`);
  return user;
}

async function seedSampleNotices(adminUser) {
  const count = await Notice.countDocuments();
  if (count > 0) {
    console.log(`  ⏭  Notices — already seeded, skipping.`);
    return;
  }

  const sampleNotices = [
    {
      title: 'Welcome to CampusOS!',
      body: 'CampusOS is your one-stop platform for academic resources, placement preparation, and campus updates. Upload notes, download study material, and stay updated with college notices — all in one place.',
      category: 'General',
      postedBy: adminUser._id,
    },
    {
      title: 'Mid-Semester Examination Schedule — Semester 3 & 5',
      body: 'Mid-semester examinations for Semester 3 and Semester 5 students are scheduled from August 5–10, 2025. Students are advised to check their timetables on the notice board. All exams will be conducted in the Main Examination Hall.',
      category: 'Dept',
      postedBy: adminUser._id,
    },
    {
      title: 'Placement Drive — TCS NQT Registration Open',
      body: 'TCS National Qualifier Test (NQT) registration is now open for all eligible final-year students (CGPA ≥ 6.0, no active backlogs). Register at tcs.com/careers before July 25, 2025. Placement Cell will conduct a preparation session on July 20.',
      category: 'Placement',
      postedBy: adminUser._id,
    },
    {
      title: 'Tech Fest 2025 — Call for Participants',
      body: 'ADIT Tech Fest 2025 is here! Events include Hackathon, Paper Presentation, Project Exhibition, and Quiz. Registration deadline: August 1, 2025. Visit the Student Activity Cell office or email techfest@adit.ac.in.',
      category: 'Event',
      postedBy: adminUser._id,
    },
  ];

  await Notice.insertMany(sampleNotices);
  console.log(`  ✅ ${sampleNotices.length} sample notices created.`);
}

async function main() {
  console.log('\n🌱 CampusOS Seed Script Starting...\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected.\n');

    console.log('📋 Seeding accounts...');
    const createdUsers = {};
    for (const account of accounts) {
      const user = await seedAccount(account);
      createdUsers[account.role] = user;
    }

    console.log('\n📢 Seeding sample notices...');
    await seedSampleNotices(createdUsers['admin']);

    console.log('\n─────────────────────────────────────────');
    console.log('✅ Seed complete! Test credentials:\n');
    console.log(`  Admin:   ${process.env.SEED_ADMIN_EMAIL}  /  ${process.env.SEED_ADMIN_PASSWORD}`);
    console.log(`  Faculty: ${process.env.SEED_FACULTY_EMAIL}  /  ${process.env.SEED_FACULTY_PASSWORD}`);
    console.log(`  Student: ${process.env.SEED_STUDENT_EMAIL}  /  ${process.env.SEED_STUDENT_PASSWORD}`);
    console.log('─────────────────────────────────────────\n');

  } catch (error) {
    console.error('❌ Seed script failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
