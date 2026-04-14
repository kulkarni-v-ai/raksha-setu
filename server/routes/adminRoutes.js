const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// In a real app, you would add an auth middleware checking for role === 'admin' here.
router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.get('/sos', adminController.getSosAlerts);

module.exports = router;
