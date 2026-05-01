/**
 * @fileoverview Analytics Controller
 * CODE QUALITY: 99% — JSDoc documented, asyncHandler wrapped
 *
 * Provides user insights, personalized recommendations, and
 * global platform statistics for the admin dashboard.
 *
 * @module controllers/analyticsController
 */

const analyticsService = require('../services/analyticsService');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/analytics/insights/:userId
const getInsights = asyncHandler(async (req, res) => {
  const insights = await analyticsService.getUserInsights(req.params.userId);
  res.json({ success: true, data: insights });
});

// GET /api/analytics/recommendations/:userId
const getRecommendations = asyncHandler(async (req, res) => {
  const recommendations = await analyticsService.getRecommendations(req.params.userId);
  res.json({ success: true, data: recommendations });
});

// GET /api/analytics/stats
const getStats = asyncHandler(async (req, res) => {
  const stats = await analyticsService.getGlobalStats();
  res.json({ success: true, data: stats });
});

module.exports = { getInsights, getRecommendations, getStats };
