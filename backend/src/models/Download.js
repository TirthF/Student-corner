const mongoose = require('mongoose');

// Tracks every download event — powers dashboard stats and download_count
const downloadSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
    },
  },
  { timestamps: true }
);

downloadSchema.index({ user: 1, resource: 1 });

module.exports = mongoose.model('Download', downloadSchema);
