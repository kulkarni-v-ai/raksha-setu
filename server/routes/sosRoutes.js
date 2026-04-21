const express = require('express');
const router = express.Router();
const sosController = require('../controllers/sosController');

// POST /api/sos
router.post('/', sosController.triggerSOS);

module.exports = router;
