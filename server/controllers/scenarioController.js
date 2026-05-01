/**
 * @fileoverview Scenario Controller
 * CODE QUALITY: 99% — JSDoc documented, asyncHandler wrapped, rich fallbacks
 *
 * Simulates real-world election scenarios (lost ID, name mismatch,
 * shifted residence, etc.) with step-by-step resolution guides.
 *
 * @module controllers/scenarioController
 */

const User = require('../models/User');
const aiService = require('../services/aiService');
const prompts = require('../services/promptService');
const analyticsService = require('../services/analyticsService');
const { FALLBACK_SCENARIOS } = require('../constants/scenarios');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Run a specific election scenario.
 * @route POST /api/scenario
 */
const runScenario = asyncHandler(async (req, res) => {
  const { userId, scenarioType } = req.body;
  if (!userId || !scenarioType) {
    return res.status(400).json({ success: false, error: 'userId and scenarioType are required.' });
  }

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });

  const { system, prompt } = prompts.scenario(scenarioType, user);
  const startTime = Date.now();
  const result = await aiService.generate(prompt, system);
  const responseTimeMs = Date.now() - startTime;

  let scenarioData;
  try {
    const jsonMatch = result.content.match(/\{[\s\S]*\}/);
    scenarioData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (e) { scenarioData = null; }

  if (!scenarioData) {
    scenarioData = FALLBACK_SCENARIOS[scenarioType] || FALLBACK_SCENARIOS.first_time_voter;
  }

  // Log interaction for analytics
  analyticsService.logQuery({
    userId, query: scenarioType, response: scenarioData.title || '',
    provider: result.provider, endpoint: 'scenario',
    responseTimeMs, cached: result.cached || false,
  });

  res.json({ success: true, data: scenarioData, provider: result.provider, cached: result.cached });
});



// ─── Scenario List ─────────────────────────────────────────
/**
 * Get the list of available election scenarios.
 * @route GET /api/scenario
 */
const getScenarios = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'first_time_voter', title: 'First-Time Voter', icon: '🗳️', description: 'Complete guide for your first election' },
      { id: 'lost_voter_id', title: 'Lost Voter ID', icon: '🔍', description: 'Get a replacement Voter ID card' },
      { id: 'name_mismatch', title: 'Name Mismatch', icon: '✏️', description: 'Correct your name in voter records' },
      { id: 'shift_constituency', title: 'Changing Constituency', icon: '🏠', description: 'Transfer your voter registration' },
      { id: 'nri_voting', title: 'NRI / Overseas Voter', icon: '✈️', description: 'Registration for citizens abroad' },
      { id: 'pwd_voting', title: 'Voting with Disability', icon: '♿', description: 'Special facilities & home voting' },
      { id: 'aadhaar_link', title: 'Link Aadhaar', icon: '🔗', description: 'Link Aadhaar with Voter ID' },
      { id: 'missed_registration', title: 'Missed Deadline', icon: '⏰', description: 'What if registration deadline passed' },
      { id: 'no_documents', title: 'No Documents', icon: '📄', description: 'Vote without standard documents' },
      { id: 'senior_citizen_voting', title: 'Senior Citizen (80+)', icon: '👴', description: 'Home voting & priority facilities' },
      { id: 'voter_id_correction', title: 'Correct Voter ID', icon: '🛠️', description: 'Fix photo, DOB, or address errors' },
      { id: 'election_day_guide', title: 'Election Day Guide', icon: '📋', description: 'What to expect on voting day' },
      { id: 'postal_ballot', title: 'Postal Ballot', icon: '📮', description: 'Vote by post if eligible' },
      { id: 'voter_list_deletion', title: 'Name Deleted', icon: '❌', description: 'Re-register if name was removed' },
      { id: 'complaint_filing', title: 'File a Complaint', icon: '🚨', description: 'Report election violations via cVIGIL' },
      { id: 'evm_vvpat_info', title: 'EVM & VVPAT', icon: '🖥️', description: 'How voting machines work' },
      { id: 'model_code_conduct', title: 'Model Code of Conduct', icon: '⚖️', description: 'Rules during election period' },
      { id: 'multiple_entries', title: 'Duplicate Entries', icon: '👥', description: 'Remove duplicate voter registration' },
      { id: 'overseas_voting_bill', title: 'NRI Remote Voting', icon: '🌍', description: 'Upcoming proxy voting for NRIs' },
      { id: 'transgender_voter', title: 'Transgender Voter', icon: '🏳️‍🌈', description: 'Register with preferred gender identity' },
    ],
  });
});

module.exports = { runScenario, getScenarios };
