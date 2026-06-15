const express = require('express');
const yamlController = require('../controllers/yamlController');
const {
  validateContentRules,
  compareContentRules,
  convertJsonRules,
  validate,
} = require('../validators/yamlValidator');

const router = express.Router();

// YAML Operations
router.post('/validate', validateContentRules, validate, yamlController.validateYaml);
router.post('/lint', validateContentRules, validate, yamlController.lintYaml);
router.post('/format', validateContentRules, validate, yamlController.formatYaml);
router.post('/compare', compareContentRules, validate, yamlController.compareYaml);
router.post('/merge', compareContentRules, validate, yamlController.mergeYaml);
router.post('/convert/json', validateContentRules, validate, yamlController.toJson);
router.post('/convert/yaml', convertJsonRules, validate, yamlController.toYaml);

// YAML Templates
router.get('/templates', yamlController.getTemplates);
router.get('/templates/k8s', yamlController.getK8sTemplates);
router.get('/templates/docker', yamlController.getDockerTemplates);
router.get('/templates/github-actions', yamlController.getGATemplates);
router.get('/templates/gitlab-ci', yamlController.getGitLabTemplates);
router.get('/templates/jenkins', yamlController.getJenkinsTemplates);
router.get('/examples', yamlController.getExamples);
router.get('/best-practices', yamlController.getBestPractices);

module.exports = router;
