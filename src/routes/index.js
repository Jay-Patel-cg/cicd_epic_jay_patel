const express = require('express');

// Import Child Routers
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const workflowRoutes = require('./workflow.routes');
const infraRoutes = require('./infra.routes');
const searchRoutes = require('./search.routes');
const yamlRoutes = require('./yaml.routes');
const analyticsRoutes = require('./analytics.routes');
const debugRoutes = require('./debug.routes');
const adminRoutes = require('./admin.routes');
const monitoringRoutes = require('./monitoring.routes');
const notificationRoutes = require('./notification.routes');
const commentRoutes = require('./comment.routes');
const reviewRoutes = require('./review.routes');
const systemRoutes = require('./system.routes');
const knowledgeRoutes = require('./knowledgeRoutes');

const router = express.Router();

// Mount Router Modules
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/workflows', workflowRoutes);
router.use('/infra', infraRoutes);
router.use('/search', searchRoutes);
router.use('/yaml', yamlRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/debug', debugRoutes);
router.use('/admin', adminRoutes);
router.use('/monitoring', monitoringRoutes);
router.use('/notifications', notificationRoutes);
router.use('/comments', commentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/system', systemRoutes);
router.use('/knowledge', knowledgeRoutes);

module.exports = router;
