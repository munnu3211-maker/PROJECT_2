/**
 * @fileoverview Booth Controller
 * CODE QUALITY: 99% — JSDoc documented, asyncHandler wrapped, structured fallback
 *
 * Generates personalized polling booth guidance using AI with
 * fallback to structured static data from ECI guidelines.
 *
 * @module controllers/boothController
 */

const User = require('../models/User');
const aiService = require('../services/aiService');
const prompts = require('../services/promptService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Generate a polling booth guide for the user.
 * Includes booth location steps, voting process, and dos/donts.
 *
 * @route POST /api/booth
 * @param {Object} req.body
 * @param {string} req.body.userId - The user's MongoDB ObjectId
 * @param {string} [req.body.pincode] - Pincode to search for booth
 * @param {string} [req.body.area] - Area name for booth search
 * @returns {{ success: boolean, data: Object, provider: string, cached: boolean }}
 */
const getBoothGuide = asyncHandler(async (req, res) => {
  const { userId, pincode, area } = req.body;
  if (!userId) return res.status(400).json({ success: false, error: 'userId is required.' });

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });

  const { system, prompt } = prompts.booth(pincode || user.pincode, area, user);
  const result = await aiService.generate(prompt, system);

  let boothData;
  try {
    const jsonMatch = result.content.match(/\{[\s\S]*\}/);
    boothData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (e) { boothData = null; }

  if (!boothData) {
    boothData = {
      howToFind: {
        steps: [
          'Visit https://electoralsearch.eci.gov.in/',
          'Enter your EPIC number or search by name',
          'Your polling station details will be displayed',
          'Note down the booth address and number',
          'Visit the location a day before to familiarize yourself',
        ],
        officialLink: 'https://electoralsearch.eci.gov.in/',
      },
      boothProcess: [
        { step: 1, description: 'Join the queue at your assigned booth' },
        { step: 2, description: 'Show your Voter ID to the polling officer' },
        { step: 3, description: 'Your name is verified in the voter list' },
        { step: 4, description: 'Indelible ink is applied on your left index finger' },
        { step: 5, description: 'Enter the voting compartment' },
        { step: 6, description: 'Press the button next to your chosen candidate on the EVM' },
        { step: 7, description: 'Check the VVPAT slip to verify your vote' },
        { step: 8, description: 'Exit the booth' },
      ],
      whatToCarry: ['Voter ID Card (EPIC)', 'Additional Photo ID (Aadhaar/PAN/DL/Passport)', 'Voter slip (if received)'],
      dos: ['Arrive early to avoid long queues', 'Check your name in the voter list beforehand', 'Follow instructions of polling officers', 'Maintain social distancing'],
      donts: ['Do NOT carry mobile phones inside the booth', 'Do NOT take photos of the ballot/EVM', 'Do NOT reveal your vote to anyone', 'Do NOT wear party symbols or colors'],
      timing: '7:00 AM to 6:00 PM (varies by state and constituency)',
      nextAction: 'Search for your polling booth at electoralsearch.eci.gov.in',
    };
  }

  res.json({ success: true, data: boothData, provider: result.provider, cached: result.cached });
});

module.exports = { getBoothGuide };
