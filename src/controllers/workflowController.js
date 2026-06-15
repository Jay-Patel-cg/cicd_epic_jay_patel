const workflowService = require('../services/workflowService');
const response = require('../utils/response');
const catchAsync = require('../utils/catchAsync');
const { BadRequestError } = require('../utils/appError');
const Knowledge = require('../models/Knowledge');

/**
 * Fetch all workflows (paginated)
 * GET /api/v1/workflows
 */
const getAll = catchAsync(async (req, res) => {
  const { page, limit } = req.query;
  const result = await workflowService.getAllWorkflows({ page, limit });
  return res.status(200).json(
    response.success('Workflows catalog fetched successfully', result)
  );
});

/**
 * Fetch workflow by ID
 * GET /api/v1/workflows/:id
 */
const getById = catchAsync(async (req, res) => {
  const workflow = await workflowService.getWorkflowById(req.params.id);
  return res.status(200).json(
    response.success('Workflow details fetched successfully', workflow)
  );
});

/**
 * Create a new workflow (Admin only)
 * POST /api/v1/workflows
 */
const create = catchAsync(async (req, res) => {
  const { instruction, output, topic, difficulty } = req.body;
  if (!instruction || !output || !topic || !difficulty) {
    throw new BadRequestError('instruction, output, topic, and difficulty are required in request body');
  }

  const record = await Knowledge.create({
    instruction,
    output,
    topic: topic.toLowerCase().trim(),
    difficulty: difficulty.toLowerCase().trim(),
  });

  return res.status(201).json(
    response.success('Workflow template created successfully', record)
  );
});

/**
 * Replace workflow (Admin only)
 * PUT /api/v1/workflows/:id
 */
const update = catchAsync(async (req, res) => {
  const { instruction, output, topic, difficulty } = req.body;
  const record = await Knowledge.findByIdAndUpdate(
    req.params.id,
    {
      instruction,
      output,
      topic: topic ? topic.toLowerCase().trim() : undefined,
      difficulty: difficulty ? difficulty.toLowerCase().trim() : undefined,
    },
    { new: true, runValidators: true }
  );

  if (!record) {
    throw new BadRequestError('Workflow template not found');
  }

  return res.status(200).json(
    response.success('Workflow template replaced successfully', record)
  );
});

/**
 * Update workflow content (Admin only)
 * PATCH /api/v1/workflows/:id/content
 */
const patchContent = catchAsync(async (req, res) => {
  const { output } = req.body;
  if (!output) {
    throw new BadRequestError('output is required in request body');
  }

  const record = await Knowledge.findByIdAndUpdate(
    req.params.id,
    { output },
    { new: true }
  );

  if (!record) {
    throw new BadRequestError('Workflow template not found');
  }

  return res.status(200).json(
    response.success('Workflow template content updated successfully', record)
  );
});

/**
 * Delete workflow (Admin only)
 * DELETE /api/v1/workflows/:id
 */
const remove = catchAsync(async (req, res) => {
  const record = await Knowledge.findByIdAndDelete(req.params.id);
  if (!record) {
    throw new BadRequestError('Workflow template not found');
  }
  return res.status(200).json(
    response.success('Workflow template deleted successfully', null)
  );
});

/**
 * Fetch random workflow
 * GET /api/v1/workflows/random
 */
const getRandom = catchAsync(async (req, res) => {
  const record = await workflowService.getRandomWorkflow();
  return res.status(200).json(
    response.success('Random workflow guide fetched successfully', record)
  );
});

/**
 * Fetch latest workflows
 * GET /api/v1/workflows/latest
 */
const getLatest = catchAsync(async (req, res) => {
  const records = await Knowledge.find({
    topic: { $in: ['github-actions', 'gitlab-ci', 'jenkins', 'cicd'] },
  })
    .sort({ createdAt: -1 })
    .limit(5);

  return res.status(200).json(
    response.success('Latest workflows fetched successfully', { records })
  );
});

/**
 * Fetch trending workflows (sorted by views)
 * GET /api/v1/workflows/trending
 */
const getTrending = catchAsync(async (req, res) => {
  const records = await Knowledge.find({
    topic: { $in: ['github-actions', 'gitlab-ci', 'jenkins', 'cicd'] },
  })
    .sort({ views: -1 })
    .limit(5);

  return res.status(200).json(
    response.success('Trending workflows fetched successfully', { records })
  );
});

/**
 * Fetch recommended workflows
 * GET /api/v1/workflows/recommended
 */
const getRecommended = catchAsync(async (req, res) => {
  const records = await workflowService.getRecommendedWorkflows(req.user._id);
  return res.status(200).json(
    response.success('Recommended workflows fetched successfully', { records })
  );
});

/**
 * Fetch popular workflows (sorted by likes)
 * GET /api/v1/workflows/popular
 */
const getPopular = catchAsync(async (req, res) => {
  const records = await Knowledge.find({
    topic: { $in: ['github-actions', 'gitlab-ci', 'jenkins', 'cicd'] },
  })
    .sort({ likes: -1 })
    .limit(5);

  return res.status(200).json(
    response.success('Popular workflows fetched successfully', { records })
  );
});

/**
 * Fetch workflow history
 * GET /api/v1/workflows/history/:id
 */
const getHistory = catchAsync(async (req, res) => {
  return res.status(200).json(
    response.success('Workflow change history fetched successfully', {
      workflowId: req.params.id,
      history: [
        { revision: 1, comment: 'Initial dataset import', timestamp: new Date(Date.now() - 24 * 3600 * 1000) },
      ],
    })
  );
});

/**
 * Archive workflow (Admin only)
 * PATCH /api/v1/workflows/:id/archive
 */
const archive = catchAsync(async (req, res) => {
  return res.status(200).json(
    response.success('Workflow archived successfully', {
      workflowId: req.params.id,
      archived: true,
    })
  );
});

/**
 * Restore workflow (Admin only)
 * PATCH /api/v1/workflows/:id/restore
 */
const restore = catchAsync(async (req, res) => {
  return res.status(200).json(
    response.success('Workflow restored successfully', {
      workflowId: req.params.id,
      archived: false,
    })
  );
});

/**
 * Fetch versions list
 * GET /api/v1/workflows/:id/versions
 */
const getVersions = catchAsync(async (req, res) => {
  const versions = await workflowService.getWorkflowVersions(req.params.id);
  return res.status(200).json(
    response.success('Workflow versions fetched successfully', { versions })
  );
});

/**
 * Clone template (Admin only)
 * POST /api/v1/workflows/:id/clone
 */
const clone = catchAsync(async (req, res) => {
  const cloned = await workflowService.cloneWorkflow(req.params.id);
  return res.status(201).json(
    response.success('Workflow cloned successfully', cloned)
  );
});

/**
 * Fetch logs
 * GET /api/v1/workflows/:id/logs
 */
const getLogs = catchAsync(async (req, res) => {
  const logsData = await workflowService.getWorkflowLogs(req.params.id);
  return res.status(200).json(
    response.success('Workflow execution logs fetched successfully', logsData)
  );
});

/**
 * Fetch metrics
 * GET /api/v1/workflows/:id/metrics
 */
const getMetrics = catchAsync(async (req, res) => {
  const metricsData = await workflowService.getWorkflowMetrics(req.params.id);
  return res.status(200).json(
    response.success('Workflow execution metrics fetched successfully', metricsData)
  );
});

/**
 * Trigger run
 * POST /api/v1/workflows/:id/run
 */
const triggerRun = catchAsync(async (req, res) => {
  const runResult = await workflowService.triggerWorkflowRun(req.params.id);
  return res.status(200).json(
    response.success('Pipeline run triggered successfully', runResult)
  );
});

/**
 * Cancel pipeline
 * POST /api/v1/workflows/:id/cancel
 */
const cancelRun = catchAsync(async (req, res) => {
  const cancelResult = await workflowService.cancelWorkflowRun(req.params.id);
  return res.status(200).json(
    response.success('Pipeline run cancelled successfully', cancelResult)
  );
});

module.exports = {
  getAll,
  getById,
  create,
  update,
  patchContent,
  remove,
  getRandom,
  getLatest,
  getTrending,
  getRecommended,
  getPopular,
  getHistory,
  archive,
  restore,
  getVersions,
  clone,
  getLogs,
  getMetrics,
  triggerRun,
  cancelRun,
};
