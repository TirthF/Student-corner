const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    subjectCode: {
      type: String,
      trim: true,
      default: '',
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    branch: {
      type: String,
      required: true,
      enum: ['CE', 'IT', 'EC', 'ME', 'Civil', 'OTHER'],
    },
    type: {
      type: String,
      required: true,
      enum: ['note', 'pyq', 'ppt', 'labmanual', 'project'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    fileUrl: {
      type: String,
      required: true,
    },
    cloudinaryId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'published', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Text index for search (P1 — doesn't hurt to have it now)
resourceSchema.index({ title: 'text', subject: 'text', description: 'text' });

module.exports = mongoose.model('Resource', resourceSchema);
