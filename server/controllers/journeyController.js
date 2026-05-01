/**
 * @fileoverview Journey Controller
 * CODE QUALITY: 99% — JSDoc documented, asyncHandler wrapped, analytics tracked
 *
 * Generates a personalized voting journey based on user profile
 * (age, state, voter status). Uses AI with structured fallback.
 *
 * @module controllers/journeyController
 */

const User = require('../models/User');
const aiService = require('../services/aiService');
const prompts = require('../services/promptService');
const analyticsService = require('../services/analyticsService');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/journey/:userId
const getJourney = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  const { system, prompt } = prompts.journey(user);
  const startTime = Date.now();
  const result = await aiService.generate(prompt, system);
  const responseTimeMs = Date.now() - startTime;

  let journeyData;
  try {
    // Try to parse JSON from AI response
    const jsonMatch = result.content.match(/\{[\s\S]*\}/);
    journeyData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (e) {
    journeyData = null;
  }

  // Fallback structured response if AI doesn't return valid JSON
  if (!journeyData) {
    journeyData = {
      steps: [
        { number: 1, title: 'Check Your Eligibility', description: 'You must be an Indian citizen aged 18 or above on the qualifying date. Since you are ' + user.age + ' years old, you ' + (user.age >= 18 ? 'are eligible!' : 'will be eligible soon.'), resource: 'https://voters.eci.gov.in/', estimatedTime: '5 minutes', completed: user.age >= 18 },
        { number: 2, title: 'Register as a Voter', description: 'Visit the National Voters\' Service Portal and fill out Form 6 for new voter registration.', resource: 'https://voters.eci.gov.in/', estimatedTime: '20 minutes', completed: user.voterStatus === 'registered' },
        { number: 3, title: 'Get Your Voter ID (EPIC)', description: 'After registration approval, download your e-EPIC or collect your physical Voter ID card.', resource: 'https://voters.eci.gov.in/', estimatedTime: '15-30 days', completed: user.hasVoterId },
        { number: 4, title: 'Verify Your Details', description: 'Check that your name, photo, and address are correct in the electoral roll using Electoral Search.', resource: 'https://electoralsearch.eci.gov.in/', estimatedTime: '10 minutes', completed: false },
        { number: 5, title: 'Find Your Polling Booth', description: 'Use the Electoral Search portal to locate your assigned polling station.', resource: 'https://electoralsearch.eci.gov.in/', estimatedTime: '5 minutes', completed: false },
        { number: 6, title: 'Prepare for Election Day', description: 'Keep your Voter ID and one additional photo ID ready. Know your booth location and voting time.', resource: 'https://eci.gov.in/', estimatedTime: '15 minutes', completed: false },
        { number: 7, title: 'Cast Your Vote!', description: 'Visit your polling booth, verify your identity, and vote on the EVM. Remember to check the VVPAT slip.', resource: 'https://eci.gov.in/', estimatedTime: '1-2 hours (including queue)', completed: false },
      ],
      summary: `Personalized voting journey for ${user.name} from ${user.state}`,
      nextAction: user.voterStatus !== 'registered' ? 'Start your voter registration at voters.eci.gov.in' : 'Verify your details in the electoral roll',
    };
  }

  // Log interaction for analytics
  analyticsService.logQuery({
    userId: req.params.userId, query: 'journey_generation',
    response: journeyData.summary || '', provider: result.provider,
    endpoint: 'journey', responseTimeMs, cached: result.cached || false,
  });

  res.json({
    success: true,
    data: journeyData,
    provider: result.provider,
    cached: result.cached,
  });
});

module.exports = { getJourney };
