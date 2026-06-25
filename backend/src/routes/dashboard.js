const express = require('express');
const { protect } = require('../middleware/auth');
const { getStats, getRoadmap } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/stats', protect, getStats);
router.get('/roadmap', protect, getRoadmap);

module.exports = router;
