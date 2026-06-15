const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
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
    comment: {
      type: String,
      required: [true, 'Comment content cannot be empty'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexing for quick timeline retrieval of comments on a specific guide
CommentSchema.index({ knowledge: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', CommentSchema);
