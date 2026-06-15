const knowledgeService = require('../services/knowledgeService');
const response = require('../utils/response');
const catchAsync = require('../utils/catchAsync');
const { BadRequestError } = require('../utils/appError');

/**
 * Fetch all DevOps knowledge guides (paginated, with filtering and sorting)
 * GET /api/v1/knowledge
 */
const getAll = catchAsync(async (req, res) => {
  const { topic, difficulty, page, limit, sort } = req.query;
  const result = await knowledgeService.getKnowledgeRecords({
    topic,
    difficulty,
    page,
    limit,
    sort,
  });

  return res.status(200).json(
    response.success('DevOps Knowledge records fetched successfully', result)
  );
});

/**
 * Fetch a single DevOps knowledge guide by ID
 * GET /api/v1/knowledge/:id
 */
const getById = catchAsync(async (req, res) => {
  const record = await knowledgeService.getKnowledgeRecordById(req.params.id);

  return res.status(200).json(
    response.success('DevOps Knowledge record details fetched successfully', record)
  );
});

/**
 * Create a new DevOps knowledge guide (Admin only)
 * POST /api/v1/knowledge
 */
const create = catchAsync(async (req, res) => {
  const record = await knowledgeService.createKnowledgeRecord(req.body);

  return res.status(201).json(
    response.success('DevOps Knowledge record created successfully', record)
  );
});

/**
 * Update/Replace a DevOps knowledge guide by ID (Admin only)
 * PUT /api/v1/knowledge/:id
 */
const update = catchAsync(async (req, res) => {
  const record = await knowledgeService.updateKnowledgeRecord(req.params.id, req.body);

  return res.status(200).json(
    response.success('DevOps Knowledge record updated successfully', record)
  );
});

/**
 * Delete a DevOps knowledge guide by ID (Admin only)
 * DELETE /api/v1/knowledge/:id
 */
const remove = catchAsync(async (req, res) => {
  await knowledgeService.deleteKnowledgeRecord(req.params.id);

  return res.status(200).json(
    response.success('DevOps Knowledge record deleted successfully', null)
  );
});

/**
 * Perform relevance-based full text search on DevOps knowledge guides
 * GET /api/v1/search
 */
const search = catchAsync(async (req, res) => {
  const { q, topic, difficulty, page, limit, sort } = req.query;
  const result = await knowledgeService.searchKnowledge({
    q,
    topic,
    difficulty,
    page,
    limit,
    sort,
  });

  return res.status(200).json(
    response.success('Full text search executed successfully', result)
  );
});

/**
 * Retrieve unique topic tags counts
 * GET /api/v1/search/tags
 */
const getTags = catchAsync(async (req, res) => {
  const tags = await knowledgeService.getTags();
  return res.status(200).json(
    response.success('Unique topic tags fetched successfully', { tags })
  );
});

/**
 * Autocomplete prefix matching lookup
 * GET /api/v1/search/autocomplete
 */
const autocomplete = catchAsync(async (req, res) => {
  const { q } = req.query;
  const results = await knowledgeService.autocomplete(q);
  return res.status(200).json(
    response.success('Autocomplete prefix matching complete', { results })
  );
});

/**
 * Fuzzy search lookups
 * GET /api/v1/search/fuzzy
 */
const fuzzySearch = catchAsync(async (req, res) => {
  const { q } = req.query;
  const results = await knowledgeService.fuzzySearch(q);
  return res.status(200).json(
    response.success('Fuzzy search executed successfully', { results })
  );
});

/**
 * Exact matches search
 * GET /api/v1/search/exact
 */
const exactSearch = catchAsync(async (req, res) => {
  const { q } = req.query;
  const results = await knowledgeService.exactSearch(q);
  return res.status(200).json(
    response.success('Exact match search executed successfully', { results })
  );
});

/**
 * Search suggestions queries
 * GET /api/v1/search/suggestions
 */
const getSuggestions = catchAsync(async (req, res) => {
  const { q } = req.query;
  const suggestions = await knowledgeService.getSuggestions(q);
  return res.status(200).json(
    response.success('Query suggestions compiled successfully', { suggestions })
  );
});

/* ==========================================
   COLLABORATIVE FORUMS (COMMENTS)
   ========================================== */

/**
 * Add Comment
 * POST /api/v1/comments/:workflowId
 */
const addComment = catchAsync(async (req, res) => {
  const { comment } = req.body;
  if (!comment) {
    throw new BadRequestError('comment content body is required');
  }

  const commentRecord = await knowledgeService.addComment(req.user._id, req.params.workflowId, comment);
  return res.status(201).json(
    response.success('Comment submitted successfully', commentRecord)
  );
});

/**
 * Retrieve Comments list
 * GET /api/v1/comments/:workflowId
 */
const getComments = catchAsync(async (req, res) => {
  const comments = await knowledgeService.getComments(req.params.workflowId);
  return res.status(200).json(
    response.success('Comments fetched successfully', { comments })
  );
});

/**
 * Update Comment
 * PATCH /api/v1/comments/:commentId
 */
const updateComment = catchAsync(async (req, res) => {
  const { comment } = req.body;
  if (!comment) {
    throw new BadRequestError('comment content is required');
  }

  const updated = await knowledgeService.updateComment(req.user._id, req.params.commentId, comment);
  return res.status(200).json(
    response.success('Comment updated successfully', updated)
  );
});

/**
 * Delete Comment
 * DELETE /api/v1/comments/:commentId
 */
const deleteComment = catchAsync(async (req, res) => {
  await knowledgeService.deleteComment(req.user._id, req.params.commentId);
  return res.status(200).json(
    response.success('Comment deleted successfully', null)
  );
});

/* ==========================================
   COLLABORATIVE RATING (REVIEWS)
   ========================================== */

/**
 * Submit rating review
 * POST /api/v1/reviews/:workflowId
 */
const addReview = catchAsync(async (req, res) => {
  const { rating, review } = req.body;
  if (!rating || !review) {
    throw new BadRequestError('rating and review strings are required in request body');
  }

  const reviewRecord = await knowledgeService.addReview(req.user._id, req.params.workflowId, rating, review);
  return res.status(201).json(
    response.success('Review submitted successfully', reviewRecord)
  );
});

/**
 * Fetch reviews list
 * GET /api/v1/reviews/:workflowId
 */
const getReviews = catchAsync(async (req, res) => {
  const reviews = await knowledgeService.getReviews(req.params.workflowId);
  return res.status(200).json(
    response.success('Reviews fetched successfully', { reviews })
  );
});

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  search,
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
};
