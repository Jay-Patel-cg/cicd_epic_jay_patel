const mongoose = require('mongoose');

const KnowledgeSchema = new mongoose.Schema(
  {
    instruction: {
      type: String,
      required: [true, 'Instruction is required'],
      trim: true,
    },
    output: {
      type: String,
      required: [true, 'Output is required'],
      trim: true,
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
      lowercase: true,
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: {
        values: ['beginner', 'intermediate', 'advanced', 'expert'],
        message: '{VALUE} is not a valid difficulty level',
      },
      lowercase: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound text index for full-text search
KnowledgeSchema.index(
  {
    instruction: 'text',
    output: 'text',
  },
  {
    weights: {
      instruction: 10,
      output: 5,
    },
    name: 'KnowledgeTextIndex',
  }
);

// Explicitly define requested indexes
KnowledgeSchema.index({ topic: 1 });
KnowledgeSchema.index({ difficulty: 1 });

module.exports = mongoose.model('Knowledge', KnowledgeSchema);
