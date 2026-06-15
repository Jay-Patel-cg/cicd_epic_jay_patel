const express = require('express');
const systemController = require('../controllers/systemController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { createAlertRules, validate } = require('../validators/systemValidator');

const router = express.Router();

// Public Monitoring Metrics Exporters (Scrapable by Prom/Grafana)
router.get('/prometheus', systemController.getPrometheus);
router.get('/grafana', systemController.getGrafana);
router.get('/alerts', systemController.getAlerts);
router.get('/uptime', systemController.getUptime);
router.get('/cpu', systemController.getMemory); // returns CPU/Memory aggregates
router.get('/memory', systemController.getMemory);
router.get('/network', systemController.getConnections);
router.get('/storage', systemController.getStorage);

// Administrative Alert Customizations
router.post('/alerts/create', protect, admin, createAlertRules, validate, systemController.createAlert);
router.delete('/alerts/:id', protect, admin, systemController.deleteAlert);

module.exports = router;
