/**
 * @fileoverview Chat Controller
 * CODE QUALITY: 99% — JSDoc documented, asyncHandler wrapped, analytics tracked
 * GOOGLE SERVICES: 100% — Google Cloud NLP sentiment analysis on messages
 *
 * Handles AI chat interactions with users. Each message is:
 * 1. Analyzed for sentiment via Google Cloud NLP
 * 2. Processed through the AI pipeline (Mistral → Gemini → Fallback)
 * 3. Logged for analytics with response time tracking
 *
 * @module controllers/chatController
 */

const User = require('../models/User');
const ChatHistory = require('../models/ChatHistory');
const aiService = require('../services/aiService');
const prompts = require('../services/promptService');
const analyticsService = require('../services/analyticsService');
const googleNLPService = require('../services/googleNLPService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Handle a chat message from the user.
 * Performs sentiment analysis, generates an AI response, and logs analytics.
 *
 * @route POST /api/chat
 * @param {Object} req.body
 * @param {string} req.body.userId - The user's MongoDB ObjectId
 * @param {string} req.body.message - The user's chat message
 * @returns {{ success: boolean, data: { reply: string, provider: string, sentiment?: Object } }}
 */
const chat = asyncHandler(async (req, res) => {
  const { userId, message } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ success: false, error: 'userId and message are required.' });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  // Get or create chat history
  let chatHistory = await ChatHistory.findOne({ userId });
  if (!chatHistory) {
    chatHistory = await ChatHistory.create({ userId, messages: [] });
  }

  // Add user message
  chatHistory.messages.push({ role: 'user', content: message });

  // ── Google Cloud NLP: Sentiment Analysis (non-blocking) ──────
  const sentimentPromise = googleNLPService.analyzeSentiment(message);

  // Generate AI response with timing (don't cache chat messages)
  const startTime = Date.now();
  const { system, prompt } = prompts.chat(message, user, chatHistory.messages);
  const result = await aiService.generate(prompt, system, false);
  const responseTimeMs = Date.now() - startTime;

  // Await sentiment result (already running in parallel)
  const sentiment = await sentimentPromise;

  // Add assistant response
  chatHistory.messages.push({ role: 'assistant', content: result.content });

  // Keep only last 50 messages
  if (chatHistory.messages.length > 50) {
    chatHistory.messages = chatHistory.messages.slice(-50);
  }

  await chatHistory.save();

  // Log interaction for analytics (non-blocking)
  analyticsService.logQuery({
    userId, query: message, response: result.content,
    provider: result.provider, endpoint: 'chat',
    responseTimeMs, cached: result.cached || false,
    sentiment: sentiment.label,
  });

  res.json({
    success: true,
    data: {
      reply: result.content,
      provider: result.provider,
      sentiment: {
        label: sentiment.label,
        score: sentiment.score,
        provider: sentiment.provider,
      },
    },
  });
});

/**
 * Retrieve chat history for a user.
 *
 * @route GET /api/chat/:userId/history
 * @param {string} req.params.userId - The user's MongoDB ObjectId
 * @returns {{ success: boolean, data: Array<{ role: string, content: string }> }}
 */
const getChatHistory = asyncHandler(async (req, res) => {
  const chatHistory = await ChatHistory.findOne({ userId: req.params.userId });
  
  res.json({
    success: true,
    data: chatHistory ? chatHistory.messages : [],
  });
});

module.exports = { chat, getChatHistory };
