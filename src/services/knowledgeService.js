const Knowledge = require('../models/Knowledge');
const Bookmark = require('../models/Bookmark');
const Comment = require('../models/Comment');
const Review = require('../models/Review');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/appError');

/**
 * Create a new DevOps knowledge record (Admin operation)
 */
const createKnowledgeRecord = async (data) => {
  return await Knowledge.create({
    instruction: data.instruction,
    output: data.output,
    topic: data.topic.toLowerCase().trim(),
    difficulty: data.difficulty.toLowerCase().trim(),
  });
};

/**
 * Fetch a single Knowledge record by ID
 */
const getKnowledgeRecordById = async (id) => {
  const record = await Knowledge.findById(id);
  if (!record) {
    throw new NotFoundError('DevOps Knowledge guide not found');
  }

  // Non-blocking write views logger
  Knowledge.findByIdAndUpdate(id, { $inc: { views: 1 } })
    .exec()
    .catch((err) => {
      console.error(`Async views update failure for guide ${id}:`, err.message);
    });

  record.views += 1;
  return record;
};

/**
 * Update a Knowledge record by ID (Admin operation)
 */
const updateKnowledgeRecord = async (id, updateData) => {
  const normalizedData = { ...updateData };
  if (normalizedData.topic) normalizedData.topic = normalizedData.topic.toLowerCase().trim();
  if (normalizedData.difficulty) normalizedData.difficulty = normalizedData.difficulty.toLowerCase().trim();

  const record = await Knowledge.findByIdAndUpdate(id, normalizedData, {
    new: true,
    runValidators: true,
  });

  if (!record) {
    throw new NotFoundError('DevOps Knowledge guide not found');
  }

  return record;
};

/**
 * Delete a Knowledge record by ID (Admin operation)
 */
const deleteKnowledgeRecord = async (id) => {
  const record = await Knowledge.findByIdAndDelete(id);
  if (!record) {
    throw new NotFoundError('DevOps Knowledge guide not found');
  }
  return record;
};

/**
 * Standard retrieval filter logic
 */
const getKnowledgeRecords = async ({ topic, difficulty, page = 1, limit = 20, sort }) => {
  const queryObj = {};
  if (topic) queryObj.topic = topic.toLowerCase().trim();
  if (difficulty) queryObj.difficulty = difficulty.toLowerCase().trim();

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
  const skipNum = (pageNum - 1) * limitNum;

  let sortObj = { createdAt: -1 };
  if (sort === 'popular') sortObj = { views: -1, likes: -1 };
  else if (sort === 'latest') sortObj = { createdAt: -1 };

  const total = await Knowledge.countDocuments(queryObj);
  const records = await Knowledge.find(queryObj)
    .sort(sortObj)
    .skip(skipNum)
    .limit(limitNum);

  return {
    records,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  };
};

/**
 * Search guides by relevance or filters
 */
const searchKnowledge = async ({ q, topic, difficulty, page = 1, limit = 20, sort }) => {
  const queryObj = {};
  if (q) queryObj.$text = { $search: q };
  if (topic) queryObj.topic = topic.toLowerCase().trim();
  if (difficulty) queryObj.difficulty = difficulty.toLowerCase().trim();

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
  const skipNum = (pageNum - 1) * limitNum;

  let sortObj = {};
  const projection = q ? { score: { $meta: 'textScore' } } : {};

  if (sort === 'popular') sortObj = { views: -1, likes: -1 };
  else if (sort === 'latest') sortObj = { createdAt: -1 };
  else {
    if (q) sortObj = { score: { $meta: 'textScore' } };
    else sortObj = { createdAt: -1 };
  }

  const total = await Knowledge.countDocuments(queryObj);
  const records = await Knowledge.find(queryObj, projection)
    .sort(sortObj)
    .skip(skipNum)
    .limit(limitNum);

  return {
    records,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  };
};

/**
 * Extract active DevOps tags counts
 */
const getTags = async () => {
  // Aggregate tags by unique topics
  const tagsList = await Knowledge.aggregate([
    { $group: { _id: '$topic', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  return tagsList.map((tag) => ({ name: tag._id, count: tag.count }));
};

/**
 * Autocomplete prefix matching regex lookup
 */
const autocomplete = async (q) => {
  if (!q) return [];
  const cleanQ = q.trim();
  const matches = await Knowledge.find({
    instruction: { $regex: `^${cleanQ}`, $options: 'i' },
  })
    .select('instruction topic')
    .limit(10);
  return matches;
};

/**
 * Fuzzy search matches using partial query splits
 */
const fuzzySearch = async (q) => {
  if (!q) return [];
  const cleanQ = q.trim().replace(/\s+/g, '|'); // simple OR regex splits
  const matches = await Knowledge.find({
    $or: [
      { instruction: { $regex: cleanQ, $options: 'i' } },
      { output: { $regex: cleanQ, $options: 'i' } },
    ],
  }).limit(15);
  return matches;
};

/**
 * Exact matches match search
 */
const exactSearch = async (q) => {
  if (!q) return [];
  const cleanQ = q.trim();
  const matches = await Knowledge.find({
    $or: [
      { instruction: cleanQ },
      { topic: cleanQ.toLowerCase() },
    ],
  });
  return matches;
};

/**
 * Search suggestions queries builder
 */
const getSuggestions = async (q) => {
  if (!q) return [];
  const regex = new RegExp(q.trim(), 'i');
  const suggestions = await Knowledge.find({ instruction: regex })
    .select('instruction')
    .limit(5);
  return suggestions.map((s) => s.instruction);
};

/* ==========================================
   COLLABORATIVE DISCUSSION FORUMS (COMMENTS)
   ========================================== */

/**
 * Add Comment
 */
const addComment = async (userId, knowledgeId, commentText) => {
  // Validate resource existence
  const target = await Knowledge.findById(knowledgeId);
  if (!target) {
    throw new NotFoundError('Target resource not found to add comment');
  }

  const comment = await Comment.create({
    user: userId,
    knowledge: knowledgeId,
    comment: commentText,
  });

  return await comment.populate('user', 'name email');
};

/**
 * Fetch Comments
 */
const getComments = async (knowledgeId) => {
  return await Comment.find({ knowledge: knowledgeId })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
};

/**
 * Update Comment
 */
const updateComment = async (userId, commentId, commentText) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new NotFoundError('Comment not found');
  }

  if (comment.user.toString() !== userId.toString()) {
    throw new ForbiddenError('You are not authorized to edit this comment');
  }

  comment.comment = commentText;
  await comment.save();
  return comment;
};

/**
 * Delete Comment
 */
const deleteComment = async (userId, commentId) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new NotFoundError('Comment not found');
  }

  // Allow comment owner or admin to delete
  if (comment.user.toString() !== userId.toString()) {
    throw new ForbiddenError('You are not authorized to delete this comment');
  }

  await Comment.findByIdAndDelete(commentId);
  return true;
};

/* ==========================================
   COLLABORATIVE RATINGS SYSTEM (REVIEWS)
   ========================================== */

/**
 * Submit Rating Review
 */
const addReview = async (userId, knowledgeId, rating, reviewText) => {
  const target = await Knowledge.findById(knowledgeId);
  if (!target) {
    throw new NotFoundError('Target resource not found to review');
  }

  // Check if review already exists (one review per user per guide)
  const existing = await Review.findOne({ user: userId, knowledge: knowledgeId });
  if (existing) {
    throw new BadRequestError('You have already submitted a review for this guide. Please edit your existing review.');
  }

  const review = await Review.create({
    user: userId,
    knowledge: knowledgeId,
    rating,
    review: reviewText,
  });

  // Calculate new rating count inside Knowledge guide asynchronously
  const allReviews = await Review.find({ knowledge: knowledgeId });
  const likesCount = allReviews.filter((r) => r.rating >= 4).length;
  Knowledge.findByIdAndUpdate(knowledgeId, { likes: likesCount }).exec().catch((e) => {
    console.error(`Failed to update guide likes count asynchronously:`, e.message);
  });

  return await review.populate('user', 'name email');
};

/**
 * Fetch Reviews
 */
const getReviews = async (knowledgeId) => {
  return await Review.find({ knowledge: knowledgeId })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
};

/* ==========================================
   EXPLICIT BOOKMARK TABLE WORKFLOWS
   ========================================== */

/**
 * Toggle bookmark state
 */
const toggleBookmark = async (userId, knowledgeId) => {
  const target = await Knowledge.findById(knowledgeId);
  if (!target) {
    throw new NotFoundError('Target resource not found to bookmark');
  }

  const existing = await Bookmark.findOne({ user: userId, knowledge: knowledgeId });
  let isBookmarked = false;

  if (existing) {
    await Bookmark.findByIdAndDelete(existing._id);
  } else {
    await Bookmark.create({ user: userId, knowledge: knowledgeId });
    isBookmarked = true;
  }

  // Sync back array inside User model asynchronously to keep redundant schemas aligned
  const allUserBookmarks = await Bookmark.find({ user: userId });
  const ids = allUserBookmarks.map((b) => b.knowledge);
  const mongoose = require('mongoose');
  const User = mongoose.model('User');
  User.findByIdAndUpdate(userId, { bookmarks: ids }).exec().catch((e) => {
    console.error(`Failed to sync User bookmarks array asynchronously:`, e.message);
  });

  return {
    isBookmarked,
    bookmarksCount: ids.length,
  };
};

module.exports = {
  createKnowledgeRecord,
  getKnowledgeRecordById,
  updateKnowledgeRecord,
  deleteKnowledgeRecord,
  getKnowledgeRecords,
  searchKnowledge,
  getTags,
  autocomplete,
  fuzzySearch,
  exactSearch,
  getSuggestions,
  addComment,
  getComments,
  updateComment,
  deleteComment,
  addReview,
  getReviews,
  toggleBookmark,
};
