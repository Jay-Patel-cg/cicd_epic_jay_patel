const yamlService = require('../services/yamlService');
const response = require('../utils/response');
const catchAsync = require('../utils/catchAsync');
const { BadRequestError } = require('../utils/appError');
const Knowledge = require('../models/Knowledge');

/**
 * Validate YAML syntax
 * POST /api/v1/yaml/validate
 */
const validateYaml = catchAsync(async (req, res) => {
  const { content } = req.body;
  if (!content) {
    throw new BadRequestError('content is required in request body');
  }

  const result = yamlService.validate(content);
  return res.status(200).json(
    response.success('Validation complete', result)
  );
});

/**
 * Lint YAML styling rules
 * POST /api/v1/yaml/lint
 */
const lintYaml = catchAsync(async (req, res) => {
  const { content } = req.body;
  if (!content) {
    throw new BadRequestError('content is required in request body');
  }

  const result = yamlService.lint(content);
  return res.status(200).json(
    response.success('Linting complete', result)
  );
});

/**
 * Format YAML indentation
 * POST /api/v1/yaml/format
 */
const formatYaml = catchAsync(async (req, res) => {
  const { content } = req.body;
  if (!content) {
    throw new BadRequestError('content is required in request body');
  }

  const formatted = yamlService.format(content);
  return res.status(200).json(
    response.success('Formatting complete', { formatted })
  );
});

/**
 * Compare two configs
 * POST /api/v1/yaml/compare
 */
const compareYaml = catchAsync(async (req, res) => {
  const { contentA, contentB } = req.body;
  if (!contentA || !contentB) {
    throw new BadRequestError('Both contentA and contentB are required in request body');
  }

  const comparison = yamlService.compare(contentA, contentB);
  return res.status(200).json(
    response.success('Comparison complete', comparison)
  );
});

/**
 * Merge two configs
 * POST /api/v1/yaml/merge
 */
const mergeYaml = catchAsync(async (req, res) => {
  const { contentA, contentB } = req.body;
  if (!contentA || !contentB) {
    throw new BadRequestError('Both contentA and contentB are required in request body');
  }

  const merged = yamlService.merge(contentA, contentB);
  return res.status(200).json(
    response.success('Merging complete', { merged })
  );
});

/**
 * Convert YAML to JSON
 * POST /api/v1/yaml/convert/json
 */
const toJson = catchAsync(async (req, res) => {
  const { content } = req.body;
  if (!content) {
    throw new BadRequestError('content is required in request body');
  }

  const json = yamlService.convert(content, 'json');
  return res.status(200).json(
    response.success('Conversion to JSON complete', { json })
  );
});

/**
 * Convert JSON to YAML
 * POST /api/v1/yaml/convert/yaml
 */
const toYaml = catchAsync(async (req, res) => {
  const { json } = req.body;
  if (!json) {
    throw new BadRequestError('json object is required in request body');
  }

  const yaml = yamlService.convert(json, 'yaml');
  return res.status(200).json(
    response.success('Conversion to YAML complete', { yaml })
  );
});

/**
 * Browse YAML Templates
 * GET /api/v1/yaml/templates
 */
const getTemplates = catchAsync(async (req, res) => {
  const templates = await Knowledge.find({
    $or: [
      { instruction: /template/i },
      { output: /apiVersion/i },
      { output: /kind:/i },
    ],
  }).limit(10);

  return res.status(200).json(
    response.success('YAML templates fetched successfully', { templates })
  );
});

/**
 * Kubernetes templates filter
 * GET /api/v1/yaml/templates/k8s
 */
const getK8sTemplates = catchAsync(async (req, res) => {
  const templates = await Knowledge.find({
    topic: 'kubernetes',
    $or: [{ instruction: /template/i }, { output: /kind:/i }],
  }).limit(5);

  return res.status(200).json(
    response.success('Kubernetes YAML templates fetched successfully', { templates })
  );
});

/**
 * Docker templates filter
 * GET /api/v1/yaml/templates/docker
 */
const getDockerTemplates = catchAsync(async (req, res) => {
  const templates = await Knowledge.find({
    topic: 'docker',
    output: /FROM|WORKDIR|COPY|RUN/i,
  }).limit(5);

  return res.status(200).json(
    response.success('Docker compose templates fetched successfully', { templates })
  );
});

/**
 * GitHub Actions templates filter
 * GET /api/v1/yaml/templates/github-actions
 */
const getGATemplates = catchAsync(async (req, res) => {
  const templates = await Knowledge.find({
    topic: 'github-actions',
  }).limit(5);

  return res.status(200).json(
    response.success('GitHub Actions templates fetched successfully', { templates })
  );
});

/**
 * GitLab CI templates filter
 * GET /api/v1/yaml/templates/gitlab-ci
 */
const getGitLabTemplates = catchAsync(async (req, res) => {
  const templates = await Knowledge.find({
    topic: 'gitlab-ci',
  }).limit(5);

  return res.status(200).json(
    response.success('GitLab CI templates fetched successfully', { templates })
  );
});

/**
 * Jenkins templates filter
 * GET /api/v1/yaml/templates/jenkins
 */
const getJenkinsTemplates = catchAsync(async (req, res) => {
  const templates = await Knowledge.find({
    topic: 'jenkins',
  }).limit(5);

  return res.status(200).json(
    response.success('Jenkins pipeline templates fetched successfully', { templates })
  );
});

/**
 * Browse YAML Examples
 * GET /api/v1/yaml/examples
 */
const getExamples = catchAsync(async (req, res) => {
  const examples = await Knowledge.find({
    output: /example|demo|sample/i,
  }).limit(10);

  return res.status(200).json(
    response.success('YAML examples fetched successfully', { examples })
  );
});

/**
 * YAML Best Practices
 * GET /api/v1/yaml/best-practices
 */
const getBestPractices = catchAsync(async (req, res) => {
  const practices = await Knowledge.find({
    instruction: /best practice|standards/i,
  }).limit(5);

  return res.status(200).json(
    response.success('YAML best practices fetched successfully', { practices })
  );
});

module.exports = {
  validateYaml,
  lintYaml,
  formatYaml,
  compareYaml,
  mergeYaml,
  toJson,
  toYaml,
  getTemplates,
  getK8sTemplates,
  getDockerTemplates,
  getGATemplates,
  getGitLabTemplates,
  getJenkinsTemplates,
  getExamples,
  getBestPractices,
};
