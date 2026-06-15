const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    knowledge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Knowledge',
      required: [true, 'Knowledge target reference is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating score is required'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
    },
    review: {
      type: String,
      required: [true, 'Review comment content cannot be empty'],
      trim: true,
      maxlength: [2000, 'Review text cannot exceed 2000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Enforce single review constraint per user per resource guide
ReviewSchema.index({ user: 1, knowledge: 1 }, { unique: true });
ReviewSchema.index({ knowledge: 1 });

module.exports = mongoose.model('Review', ReviewSchema);
