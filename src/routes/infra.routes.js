const express = require('express');
const knowledgeController = require('../controllers/knowledgeController');

const router = express.Router();

// Specific Technology Scopes (Indexed Topic Queries)
router.get('/k8s', (req, res, next) => {
  req.query.topic = 'kubernetes';
  knowledgeController.getAll(req, res, next);
});

router.get('/docker', (req, res, next) => {
  req.query.topic = 'docker';
  knowledgeController.getAll(req, res, next);
});

router.get('/helm', (req, res, next) => {
  req.query.topic = 'helm';
  knowledgeController.getAll(req, res, next);
});

router.get('/terraform', (req, res, next) => {
  req.query.topic = 'terraform';
  knowledgeController.getAll(req, res, next);
});

router.get('/aws', (req, res, next) => {
  req.query.topic = 'aws';
  knowledgeController.getAll(req, res, next);
});

router.get('/gcp', (req, res, next) => {
  req.query.topic = 'gcp';
  knowledgeController.getAll(req, res, next);
});

router.get('/azure', (req, res, next) => {
  req.query.topic = 'azure';
  knowledgeController.getAll(req, res, next);
});

// Resource Terms Scopes (Indexed Compound Text Search Queries)
router.get('/pods', (req, res, next) => {
  req.query.q = 'pods';
  knowledgeController.search(req, res, next);
});

router.get('/services', (req, res, next) => {
  req.query.q = 'services';
  knowledgeController.search(req, res, next);
});

router.get('/deployments', (req, res, next) => {
  req.query.q = 'deployments';
  knowledgeController.search(req, res, next);
});

router.get('/ingress', (req, res, next) => {
  req.query.q = 'ingress';
  knowledgeController.search(req, res, next);
});

router.get('/configmaps', (req, res, next) => {
  req.query.q = 'configmaps';
  knowledgeController.search(req, res, next);
});

router.get('/secrets', (req, res, next) => {
  req.query.q = 'secrets';
  knowledgeController.search(req, res, next);
});

router.get('/volumes', (req, res, next) => {
  req.query.q = 'volumes';
  knowledgeController.search(req, res, next);
});

router.get('/networking', (req, res, next) => {
  req.query.q = 'networking';
  knowledgeController.search(req, res, next);
});

router.get('/autoscaling', (req, res, next) => {
  req.query.q = 'autoscaling';
  knowledgeController.search(req, res, next);
});

router.get('/security', (req, res, next) => {
  req.query.q = 'security';
  knowledgeController.search(req, res, next);
});

router.get('/monitoring', (req, res, next) => {
  req.query.q = 'monitoring';
  knowledgeController.search(req, res, next);
});

router.get('/logging', (req, res, next) => {
  req.query.q = 'logging';
  knowledgeController.search(req, res, next);
});

router.get('/templates', (req, res, next) => {
  req.query.q = 'template';
  knowledgeController.search(req, res, next);
});

module.exports = router;
