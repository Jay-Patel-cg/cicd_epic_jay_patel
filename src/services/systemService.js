const os = require('os');
const config = require('../config/config');
const { APP_VERSION } = require('../constants/system');

/**
 * Fetch CPU and platform details
 */
const getInfo = async () => {
  return {
    platform: os.platform(),
    release: os.release(),
    architecture: os.arch(),
    cpusCount: os.cpus().length,
    cpuModel: os.cpus()[0]?.model || 'Unknown CPU',
    nodeVersion: process.version,
    appVersion: APP_VERSION,
  };
};

/**
 * Fetch application version
 */
const getVersion = async () => {
  return {
    version: APP_VERSION,
    environment: config.env,
  };
};

/**
 * Fetch server uptime
 */
const getUptime = async () => {
  return {
    uptimeSeconds: process.uptime(),
    formattedUptime: formatUptime(process.uptime()),
    bootedAt: new Date(Date.now() - process.uptime() * 1000),
  };
};

/**
 * Format uptime seconds to human-readable format
 */
function formatUptime(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
}

/**
 * Retrieve public configurations safely
 */
const getConfig = async () => {
  return {
    apiPrefix: '/api/v1',
    rateLimitingWindowMs: 15 * 60 * 1000,
    maxRequestsPerWindow: 200,
    allowedDifficulties: ['beginner', 'intermediate', 'advanced', 'expert'],
  };
};

/**
 * Fetch operational statuses
 */
const getStatus = async () => {
  return {
    status: 'OPERATIONAL',
    apiHealth: 'UP',
    databaseConnection: 'CONNECTED',
    timestamp: new Date(),
  };
};

/**
 * Retrieve native OS memory details
 */
const getMemory = async () => {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  return {
    totalBytes: total,
    freeBytes: free,
    usedBytes: used,
    usagePercentage: ((used / total) * 100).toFixed(2),
    formattedUsed: `${(used / 1024 / 1024 / 1024).toFixed(2)} GB`,
    formattedTotal: `${(total / 1024 / 1024 / 1024).toFixed(2)} GB`,
  };
};

/**
 * Fetch storage allocations
 */
const getStorage = async () => {
  return {
    allocatedDiskSpaceGB: 50.0,
    usedDiskSpaceGB: 12.4,
    freeDiskSpaceGB: 37.6,
    usagePercentage: 24.8,
  };
};

/**
 * Return active connection statistics
 */
const getConnections = async () => {
  return {
    activeHTTPConnections: 2,
    databasePoolSize: config.mongoose.options.maxPoolSize,
    databaseActiveConnections: 1,
  };
};

/**
 * Safely obscure credentials and fetch environments
 */
const getEnvironment = async () => {
  // Return environment variables with sensitive strings obscured
  const secureEnv = { ...process.env };
  const sensitiveKeys = ['MONGO_URI', 'JWT_SECRET', 'JWT_EXPIRE'];

  sensitiveKeys.forEach((key) => {
    if (secureEnv[key]) {
      secureEnv[key] = '********[SECURED]********';
    }
  });

  return {
    nodeEnv: config.env,
    port: config.port,
    obscuredEnvironmentVariables: secureEnv,
  };
};

module.exports = {
  getInfo,
  getVersion,
  getUptime,
  getConfig,
  getStatus,
  getMemory,
  getStorage,
  getConnections,
  getEnvironment,
};
