const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['upload_approved', 'upload_rejected', 'new_notice', 'new_resource'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      // Optional: relative frontend route to navigate to on click
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
