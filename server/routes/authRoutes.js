const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Define specific routing strings orchestrating exact JSON payloads reliably
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
