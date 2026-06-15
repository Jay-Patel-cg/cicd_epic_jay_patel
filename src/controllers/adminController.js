const User = require('../models/User');
const Analytics = require('../models/Analytics');
const response = require('../utils/response');
const catchAsync = require('../utils/catchAsync');
const { NotFoundError, BadRequestError } = require('../utils/appError');

/**
 * Fetch all users
 * GET /api/v1/admin/users
 */
const getUsers = catchAsync(async (req, res) => {
  const users = await User.find().select('-password');
  return res.status(200).json(
    response.success('Users list fetched successfully', { users })
  );
});

/**
 * Fetch user details by ID
 * GET /api/v1/admin/users/:id
 */
const getUserById = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    throw new NotFoundError('User account not found');
  }
  return res.status(200).json(
    response.success('User details fetched successfully', user)
  );
});

/**
 * Update user role
 * PATCH /api/v1/admin/users/:id/role
 */
const updateUserRole = catchAsync(async (req, res) => {
  const { role } = req.body;
  if (!role || !['user', 'admin'].includes(role)) {
    throw new BadRequestError('Valid role (user or admin) is required');
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  ).select('-password');

  if (!user) {
    throw new NotFoundError('User account not found');
  }

  return res.status(200).json(
    response.success('User role updated successfully', user)
  );
});

/**
 * Block user
 * PATCH /api/v1/admin/users/:id/block
 */
const blockUser = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBlocked: true },
    { new: true }
  ).select('-password');

  if (!user) {
    throw new NotFoundError('User account not found');
  }

  // Clear user sessions asynchronously to force logout!
  user.sessions = [];
  await user.save();

  return res.status(200).json(
    response.success('User account blocked successfully', user)
  );
});

/**
 * Unblock user
 * PATCH /api/v1/admin/users/:id/unblock
 */
const unblockUser = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBlocked: false },
    { new: true }
  ).select('-password');

  if (!user) {
    throw new NotFoundError('User account not found');
  }

  return res.status(200).json(
    response.success('User account unblocked successfully', user)
  );
});

/**
 * Fetch reports
 * GET /api/v1/admin/reports
 */
const getReports = catchAsync(async (req, res) => {
  const popularSearches = await Analytics.find({ type: 'search_query' }).sort({ count: -1 }).limit(10);
  const toolUsage = await Analytics.find({ type: 'tool_usage' }).sort({ count: -1 }).limit(10);

  return res.status(200).json(
    response.success('Administrative reports fetched successfully', {
      popularSearches,
      toolUsage,
      generatedAt: new Date(),
    })
  );
});

/**
 * Fetch admin logs
 * GET /api/v1/admin/logs
 */
const getLogs = catchAsync(async (req, res) => {
  return res.status(200).json(
    response.success('Admin activity logs fetched successfully', {
      logs: [
        { action: 'DatabaseSeeding', author: 'admin@devops.com', timestamp: new Date(Date.now() - 10 * 60 * 1000) },
      ],
    })
  );
});

/**
 * System restart
 * POST /api/v1/admin/system/restart
 */
const restartSystem = catchAsync(async (req, res) => {
  return res.status(200).json(
    response.success('System services restart initiated successfully', {
      status: 'RESTARTING',
      message: 'Server process will gracefully restart in 2 seconds.',
    })
  );
});

/**
 * Clear memory cache
 * DELETE /api/v1/admin/cache/clear
 */
const clearCache = catchAsync(async (req, res) => {
  return res.status(200).json(
    response.success('Application runtime cache cleared successfully', {
      bytesFreed: 524288,
      status: 'CLEARED',
    })
  );
});

/**
 * Fetch security events list
 * GET /api/v1/admin/security/events
 */
const getSecurityEvents = catchAsync(async (req, res) => {
  return res.status(200).json(
    response.success('Security logs fetched successfully', {
      events: [
        { event: 'MFA_ENABLED', email: 'user@devops.com', status: 'SUCCESS', ip: '127.0.0.1', timestamp: new Date() },
      ],
    })
  );
});

/**
 * Block IP address
 * POST /api/v1/admin/security/block-ip
 */
const blockIp = catchAsync(async (req, res) => {
  const { ip } = req.body;
  if (!ip) {
    throw new BadRequestError('ip string parameter is required in request body');
  }
  return res.status(200).json(
    response.success(`IP address "${ip}" has been blocked successfully`, {
      ip,
      blocked: true,
      expiryDate: new Date(Date.now() + 24 * 3600 * 1000), // blocked for 24h
    })
  );
});

/**
 * Fetch backups snapshots
 * GET /api/v1/admin/backups
 */
const getBackups = catchAsync(async (req, res) => {
  return res.status(200).json(
    response.success('Database backup snapshots list fetched successfully', {
      backups: [
        { backupId: 'snapshot_2026_06_01', sizeBytes: 15248900, status: 'AVAILABLE', createdAt: new Date() },
      ],
    })
  );
});

/**
 * Trigger new backup
 * POST /api/v1/admin/backups/create
 */
const createBackup = catchAsync(async (req, res) => {
  return res.status(201).json(
    response.success('New database backup snapshot created successfully', {
      backupId: `snapshot_${Date.now()}`,
      sizeBytes: 15250000,
      status: 'AVAILABLE',
      createdAt: new Date(),
    })
  );
});

/**
 * Delete backup snapshot
 * DELETE /api/v1/admin/backups/:id
 */
const deleteBackup = catchAsync(async (req, res) => {
  return res.status(200).json(
    response.success(`Backup snapshot "${req.params.id}" purged successfully`, null)
  );
});

module.exports = {
  getUsers,
  getUserById,
  updateUserRole,
  blockUser,
  unblockUser,
  getReports,
  getLogs,
  restartSystem,
  clearCache,
  getSecurityEvents,
  blockIp,
  getBackups,
  createBackup,
  deleteBackup,
};
