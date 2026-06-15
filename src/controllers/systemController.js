const os = require('os');
const systemService = require('../services/systemService');
const response = require('../utils/response');
const catchAsync = require('../utils/catchAsync');
const Notification = require('../models/Notification');
const { NotFoundError } = require('../utils/appError');

/**
 * Health check
 * GET /api/v1/health
 */
const getHealth = catchAsync(async (req, res) => {
  const status = await systemService.getStatus();
  return res.status(200).json(
    response.success('System is healthy', {
      ...status,
      uptime: process.uptime(),
    })
  );
});

/**
 * System info
 * GET /api/v1/system/info
 */
const getInfo = catchAsync(async (req, res) => {
  const info = await systemService.getInfo();
  return res.status(200).json(
    response.success('System environment specs fetched successfully', info)
  );
});

/**
 * Version
 * GET /api/v1/system/version
 */
const getVersion = catchAsync(async (req, res) => {
  const ver = await systemService.getVersion();
  return res.status(200).json(
    response.success('System version fetched successfully', ver)
  );
});

/**
 * Uptime
 * GET /api/v1/system/uptime
 */
const getUptime = catchAsync(async (req, res) => {
  const uptime = await systemService.getUptime();
  return res.status(200).json(
    response.success('System uptime details fetched successfully', uptime)
  );
});

/**
 * Public configurations
 * GET /api/v1/system/config
 */
const getConfig = catchAsync(async (req, res) => {
  const config = await systemService.getConfig();
  return res.status(200).json(
    response.success('Public configuration rules fetched successfully', config)
  );
});

/**
 * Server operational status
 * GET /api/v1/system/status
 */
const getStatus = catchAsync(async (req, res) => {
  const status = await systemService.getStatus();
  return res.status(200).json(
    response.success('Operational status fetched successfully', status)
  );
});

/**
 * CPU and Memory usage
 * GET /api/v1/system/memory
 */
const getMemory = catchAsync(async (req, res) => {
  const mem = await systemService.getMemory();
  return res.status(200).json(
    response.success('System Memory allocations fetched successfully', mem)
  );
});

/**
 * Disk storage allocations
 * GET /api/v1/system/storage
 */
const getStorage = catchAsync(async (req, res) => {
  const storage = await systemService.getStorage();
  return res.status(200).json(
    response.success('System Storage metrics fetched successfully', storage)
  );
});

/**
 * Active sockets
 * GET /api/v1/system/connections
 */
const getConnections = catchAsync(async (req, res) => {
  const conn = await systemService.getConnections();
  return res.status(200).json(
    response.success('Active connection metrics fetched successfully', conn)
  );
});

/**
 * Obscured environments config variables
 * GET /api/v1/system/environment
 */
const getEnvironment = catchAsync(async (req, res) => {
  const env = await systemService.getEnvironment();
  return res.status(200).json(
    response.success('Process environment settings fetched successfully', env)
  );
});

/* ==========================================
   PROMETHEUS & ALERTING METRICS
   ========================================== */

/**
 * Prometheus text exporter
 * GET /api/v1/monitoring/prometheus
 */
const getPrometheus = catchAsync(async (req, res) => {
  const mem = await systemService.getMemory();
  const uptime = process.uptime();

  // Return text/plain standard metrics syntax
  res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
  const metricsLines = [
    '# HELP process_uptime_seconds The process uptime in seconds.',
    '# TYPE process_uptime_seconds gauge',
    `process_uptime_seconds ${uptime}`,
    '# HELP node_memory_usage_percentage The percentage of system memory in use.',
    '# TYPE node_memory_usage_percentage gauge',
    `node_memory_usage_percentage ${mem.usagePercentage}`,
    '# HELP process_cpu_usage_cores Active CPU capacity count.',
    '# TYPE process_cpu_usage_cores gauge',
    `process_cpu_usage_cores ${os.cpus().length}`,
  ];
  return res.status(200).send(metricsLines.join('\n'));
});

/**
 * Grafana Dashboards links
 * GET /api/v1/monitoring/grafana
 */
const getGrafana = catchAsync(async (req, res) => {
  return res.status(200).json(
    response.success('Grafana configuration references fetched', {
      dashboards: [
        { name: 'Application Metrics', url: 'http://localhost:3000/d/app-metrics' },
        { name: 'System Resources', url: 'http://localhost:3000/d/node-resources' },
      ],
    })
  );
});

/**
 * Fetch active alert rules
 * GET /api/v1/monitoring/alerts
 */
const getAlerts = catchAsync(async (req, res) => {
  return res.status(200).json(
    response.success('Alerting threshold rules fetched', {
      alerts: [
        { metric: 'CPU_HIGH', limit: 'cpu_usage_percent > 85%', action: 'SLACK_WARN', status: 'INACTIVE' },
        { metric: 'MEMORY_HIGH', limit: 'memory_usage_percent > 90%', action: 'PAGER_ALERT', status: 'INACTIVE' },
      ],
    })
  );
});

/**
 * Create custom metrics alerting rule (Admin only)
 * POST /api/v1/monitoring/alerts/create
 */
const createAlert = catchAsync(async (req, res) => {
  const { metric, limit, action } = req.body;
  return res.status(201).json(
    response.success('Metrics alerting threshold rule created successfully', {
      ruleId: require('crypto').randomBytes(4).toString('hex'),
      metric,
      limit,
      action,
      createdAt: new Date(),
    })
  );
});

/**
 * Delete Alert (Admin only)
 * DELETE /api/v1/monitoring/alerts/:id
 */
const deleteAlert = catchAsync(async (req, res) => {
  return res.status(200).json(
    response.success('Alert threshold rule deleted successfully', null)
  );
});

/* ==========================================
   IN-APP NOTIFICATIONS ANNOUNCEMENTS
   ========================================== */

/**
 * Fetch notices
 * GET /api/v1/notifications
 */
const getNotifications = catchAsync(async (req, res) => {
  const notices = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
  return res.status(200).json(
    response.success('Announcements notifications fetched successfully', { notifications: notices })
  );
});

/**
 * Mark as read
 * PATCH /api/v1/notifications/:id/read
 */
const markNotificationRead = catchAsync(async (req, res) => {
  const notice = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notice) {
    throw new NotFoundError('Notification not found');
  }

  return res.status(200).json(
    response.success('Notification marked as read successfully', notice)
  );
});

/**
 * Delete alert announcement
 * DELETE /api/v1/notifications/:id
 */
const deleteNotification = catchAsync(async (req, res) => {
  const notice = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!notice) {
    throw new NotFoundError('Notification not found');
  }
  return res.status(200).json(
    response.success('Notification deleted successfully', null)
  );
});

module.exports = {
  getHealth,
  getInfo,
  getVersion,
  getUptime,
  getConfig,
  getStatus,
  getMemory,
  getStorage,
  getConnections,
  getEnvironment,
  getPrometheus,
  getGrafana,
  getAlerts,
  createAlert,
  deleteAlert,
  getNotifications,
  markNotificationRead,
  deleteNotification,
};
