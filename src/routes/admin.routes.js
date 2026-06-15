const express = require('express');
const adminController = require('../controllers/adminController');
const systemController = require('../controllers/systemController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { blockIpRules, validate } = require('../validators/systemValidator');

const router = express.Router();

// Apply auth and admin protections globally on the admin router
router.use(protect);
router.use(admin);

// Users Management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.patch('/users/:id/role', adminController.updateUserRole);
router.patch('/users/:id/block', adminController.blockUser);
router.patch('/users/:id/unblock', adminController.unblockUser);

// General Admin Analytics & Log files
router.get('/reports', adminController.getReports);
router.get('/logs', adminController.getLogs);

// System Management
router.get('/system/health', systemController.getHealth);
router.post('/system/restart', adminController.restartSystem);
router.delete('/cache/clear', adminController.clearCache);

// Security logs & blocking
router.get('/security/events', adminController.getSecurityEvents);
router.post('/security/block-ip', blockIpRules, validate, adminController.blockIp);

// Database Backups lifecycle
router.get('/backups', adminController.getBackups);
router.post('/backups/create', adminController.createBackup);
router.delete('/backups/:id', adminController.deleteBackup);

module.exports = router;
