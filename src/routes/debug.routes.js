const express = require('express');
const knowledgeController = require('../controllers/knowledgeController');

const router = express.Router();

// General Debug articles (Mapped directly to Full-Text Search)
router.get('/common-issues', (req, res, next) => {
  req.query.q = 'common issues troubleshoot';
  knowledgeController.search(req, res, next);
});

router.get('/logs', (req, res, next) => {
  req.query.q = 'logs troubleshoot debug';
  knowledgeController.search(req, res, next);
});

router.get('/connectivity', (req, res, next) => {
  req.query.q = 'connectivity troubleshoot debug';
  knowledgeController.search(req, res, next);
});

router.get('/errors', (req, res, next) => {
  req.query.q = 'error fixes debug';
  knowledgeController.search(req, res, next);
});

// Technology-Specific Debug Articles
router.get('/k8s', (req, res, next) => {
  req.query.q = 'kubernetes troubleshooting debug';
  knowledgeController.search(req, res, next);
});

router.get('/docker', (req, res, next) => {
  req.query.q = 'docker troubleshooting debug';
  knowledgeController.search(req, res, next);
});

router.get('/jenkins', (req, res, next) => {
  req.query.q = 'jenkins troubleshooting debug';
  knowledgeController.search(req, res, next);
});

router.get('/github-actions', (req, res, next) => {
  req.query.q = 'github actions troubleshooting debug';
  knowledgeController.search(req, res, next);
});

router.get('/gitlab-ci', (req, res, next) => {
  req.query.q = 'gitlab ci troubleshooting debug';
  knowledgeController.search(req, res, next);
});

router.get('/terraform', (req, res, next) => {
  req.query.q = 'terraform troubleshooting debug';
  knowledgeController.search(req, res, next);
});

router.get('/aws', (req, res, next) => {
  req.query.q = 'aws troubleshooting debug';
  knowledgeController.search(req, res, next);
});

router.get('/gcp', (req, res, next) => {
  req.query.q = 'gcp troubleshooting debug';
  knowledgeController.search(req, res, next);
});

router.get('/azure', (req, res, next) => {
  req.query.q = 'azure troubleshooting debug';
  knowledgeController.search(req, res, next);
});

router.get('/network', (req, res, next) => {
  req.query.q = 'network troubleshooting debug';
  knowledgeController.search(req, res, next);
});

router.get('/security', (req, res, next) => {
  req.query.q = 'security troubleshooting debug';
  knowledgeController.search(req, res, next);
});

module.exports = router;
