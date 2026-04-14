const express = require('express');
const router = express.Router();
const rc = require('../controllers/responderController');

router.get('/nearby', rc.getNearby);

module.exports = router;
