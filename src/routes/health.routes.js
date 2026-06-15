const express = require('express');
const systemController = require('../controllers/systemController');

const router = express.Router();

// Health Check Route
router.get('/', systemController.getHealth);

module.exports = router;
