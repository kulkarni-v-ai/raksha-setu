const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Public route for searching medicines
router.get('/search', searchController.searchMedicines);

module.exports = router;
