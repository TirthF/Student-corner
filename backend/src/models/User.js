const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    enrollmentNo: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    branch: {
      type: String,
      enum: ['CE', 'IT', 'EC', 'ME', 'Civil', 'OTHER'],
      default: 'CE',
    },
    semester: {
      type: Number,
      min: 1,
      max: 8,
      default: 1,
    },
    role: {
      type: String,
      enum: ['student', 'faculty', 'admin'],
      default: 'student',
    },
    department: {
      // For faculty: which dept they moderate (optional, null = all)
      type: String,
      enum: ['CE', 'IT', 'EC', 'ME', 'Civil', null],
      default: null,
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    isDeactivated: {
      type: Boolean,
      default: false,
    },
    notificationPreferences: {
      newResource: { type: Boolean, default: true },
      uploadDecision: { type: Boolean, default: true },
      notices: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
