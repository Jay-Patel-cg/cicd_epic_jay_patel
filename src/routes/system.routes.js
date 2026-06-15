const express = require('express');
const systemController = require('../controllers/systemController');

const router = express.Router();

// System Stat Exporters
router.get('/info', systemController.getInfo);
router.get('/version', systemController.getVersion);
router.get('/uptime', systemController.getUptime);
router.get('/config', systemController.getConfig);
router.get('/status', systemController.getStatus);
router.get('/memory', systemController.getMemory);
router.get('/storage', systemController.getStorage);
router.get('/connections', systemController.getConnections);
router.get('/environment', systemController.getEnvironment);

module.exports = router;
