const express = require('express');
const router = express.Router();
const mc = require('../controllers/medicineController');

router.get('/search', mc.search);

module.exports = router;
