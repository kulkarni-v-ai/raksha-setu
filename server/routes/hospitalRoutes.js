const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospitalController');

router.get('/', hospitalController.getAllHospitals);
router.get('/nearby', hospitalController.getNearby);
router.post('/', hospitalController.createHospital); // Simplified without strictly enforcing admin auth middleware for this demo

module.exports = router;
