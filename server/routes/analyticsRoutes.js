const express = require('express');
const { getInsights, getRecommendations, getStats } = require('../controllers/analyticsController');
const router = express.Router();

router.get('/insights/:userId', getInsights);
router.get('/recommendations/:userId', getRecommendations);
router.get('/stats', getStats);

module.exports = router;
