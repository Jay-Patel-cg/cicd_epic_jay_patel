const Knowledge = require('../models/Knowledge');
const Bookmark = require('../models/Bookmark');
const { NotFoundError, BadRequestError } = require('../utils/appError');
const { DUMMY_WORKFLOW_LOGS, DUMMY_WORKFLOW_METRICS } = require('../constants/system');

/**
 * Fetch all workflows (Knowledge documents tagged with CI/CD topics)
 */
const getAllWorkflows = async (pagination) => {
  const query = {
    topic: { $in: ['github-actions', 'gitlab-ci', 'jenkins', 'cicd'] },
  };

  const page = parseInt(pagination.page, 10) || 1;
  const limit = parseInt(pagination.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const total = await Knowledge.countDocuments(query);
  const records = await Knowledge.find(query).skip(skip).limit(limit);

  return {
    records,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Fetch detail guide by ID
 */
const getWorkflowById = async (id) => {
  const record = await Knowledge.findById(id);
  if (!record) {
    throw new NotFoundError('CI/CD Workflow template not found');
  }
  return record;
};

/**
 * Fetch random workflow guide
 */
const getRandomWorkflow = async () => {
  const count = await Knowledge.countDocuments({
    topic: { $in: ['github-actions', 'gitlab-ci', 'jenkins', 'cicd'] },
  });
  if (count === 0) return null;
  const rand = Math.floor(Math.random() * count);
  const randomDocs = await Knowledge.find({
    topic: { $in: ['github-actions', 'gitlab-ci', 'jenkins', 'cicd'] },
  })
    .skip(rand)
    .limit(1);
  return randomDocs[0];
};

/**
 * Fetch recommended workflows based on User bookmarked topics
 */
const getRecommendedWorkflows = async (userId) => {
  // Extract user bookmarks
  const userBookmarks = await Bookmark.find({ user: userId }).populate('knowledge');
  if (userBookmarks.length === 0) {
    // If no bookmarks, default to standard trending guides
    return await Knowledge.find({
      topic: { $in: ['github-actions', 'gitlab-ci', 'jenkins', 'cicd'] },
    })
      .sort({ views: -1 })
      .limit(5);
  }

  // Get active topics user has bookmarked
  const bookmarkedTopics = [...new Set(userBookmarks.map((b) => b.knowledge.topic))];

  // Return guides matching those topics
  return await Knowledge.find({
    topic: { $in: bookmarkedTopics },
  })
    .sort({ views: -1 })
    .limit(5);
};

/**
 * Trigger workflow dry run
 */
const triggerWorkflowRun = async (id) => {
  const workflow = await Knowledge.findById(id);
  if (!workflow) {
    throw new NotFoundError('Workflow not found to execute');
  }

  const runId = require('crypto').randomBytes(8).toString('hex');
  return {
    runId,
    workflowId: id,
    status: 'TRIGGERED',
    message: `Dry-run pipeline initiated for: "${workflow.instruction}"`,
    startedAt: new Date(),
  };
};

/**
 * Cancel running pipeline
 */
const cancelWorkflowRun = async (id) => {
  const workflow = await Knowledge.findById(id);
  if (!workflow) {
    throw new NotFoundError('Workflow not found');
  }
  return {
    workflowId: id,
    status: 'CANCELLED',
    message: 'Pipeline run aborted successfully.',
    cancelledAt: new Date(),
  };
};

/**
 * Retrieve logs compilation
 */
const getWorkflowLogs = async (id) => {
  const workflow = await Knowledge.findById(id);
  if (!workflow) {
    throw new NotFoundError('Workflow not found');
  }
  return {
    workflowId: id,
    logs: DUMMY_WORKFLOW_LOGS,
  };
};

/**
 * Retrieve execution metrics
 */
const getWorkflowMetrics = async (id) => {
  const workflow = await Knowledge.findById(id);
  if (!workflow) {
    throw new NotFoundError('Workflow not found');
  }
  return {
    workflowId: id,
    metrics: DUMMY_WORKFLOW_METRICS,
  };
};

/**
 * Clone template
 */
const cloneWorkflow = async (id) => {
  const source = await Knowledge.findById(id);
  if (!source) {
    throw new NotFoundError('Source workflow template not found to clone');
  }

  const clone = await Knowledge.create({
    instruction: `${source.instruction} (Cloned)`,
    output: source.output,
    topic: source.topic,
    difficulty: source.difficulty,
  });

  return clone;
};

/**
 * Fetch mock versions
 */
const getWorkflowVersions = async (id) => {
  const workflow = await Knowledge.findById(id);
  if (!workflow) {
    throw new NotFoundError('Workflow not found');
  }
  return [
    { version: '1.0.0', author: 'admin@devops.com', createdAt: workflow.createdAt },
    { version: '1.0.1', author: 'system@devops.com', createdAt: new Date() },
  ];
};

module.exports = {
  getAllWorkflows,
  getWorkflowById,
  getRandomWorkflow,
  getRecommendedWorkflows,
  triggerWorkflowRun,
  cancelWorkflowRun,
  getWorkflowLogs,
  getWorkflowMetrics,
  cloneWorkflow,
  getWorkflowVersions,
};
