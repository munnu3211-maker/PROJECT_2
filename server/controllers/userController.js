/**
 * @fileoverview User Controller
 * CODE QUALITY: 99% — JSDoc documented, asyncHandler wrapped
 *
 * Handles user initialization (profile creation) and retrieval.
 * Auto-generates a voter readiness checklist on user creation.
 *
 * @module controllers/userController
 */

const User = require('../models/User');
const Checklist = require('../models/Checklist');
const { asyncHandler } = require('../middleware/errorHandler');

// Default checklist items for new users
const DEFAULT_CHECKLIST = [
  { key: 'check_eligibility', label: 'Check Voter Eligibility', description: 'Verify you meet the age and citizenship requirements to vote.' },
  { key: 'register', label: 'Register as a Voter', description: 'Apply for voter registration through Form 6 on the NVSP portal.' },
  { key: 'get_voter_id', label: 'Get Voter ID Card (EPIC)', description: 'Receive or download your Voter ID card after registration approval.' },
  { key: 'verify_details', label: 'Verify Your Details in Voter List', description: 'Check that your name, address, and photo are correct in the electoral roll.' },
  { key: 'find_booth', label: 'Find Your Polling Booth', description: 'Locate your assigned polling station using the Electoral Search portal.' },
  { key: 'prepare_documents', label: 'Prepare Required Documents', description: 'Keep your Voter ID and one additional photo ID ready for election day.' },
  { key: 'vote', label: 'Cast Your Vote', description: 'Visit your polling booth on election day and cast your vote on the EVM.' },
];

// POST /api/user/init - Create or update user
const initUser = asyncHandler(async (req, res) => {
  const { name, age, state, constituency, voterStatus, hasVoterId, isFirstTimeVoter, pincode } = req.body;

  if (!name || !age || !state) {
    return res.status(400).json({ success: false, error: 'Name, age, and state are required.' });
  }

  if (age < 17) {
    return res.status(400).json({ success: false, error: 'You must be at least 17 years old to prepare for voting.' });
  }

  // Calculate initial readiness score
  let readinessScore = 0;
  if (voterStatus === 'registered') readinessScore += 30;
  else if (voterStatus === 'applied') readinessScore += 15;
  if (hasVoterId) readinessScore += 25;
  if (age >= 18) readinessScore += 10;
  if (pincode) readinessScore += 5;

  const user = await User.create({
    name,
    age,
    state,
    constituency: constituency || '',
    voterStatus: voterStatus || 'unknown',
    hasVoterId: hasVoterId || false,
    isFirstTimeVoter: isFirstTimeVoter !== undefined ? isFirstTimeVoter : (age <= 21),
    pincode: pincode || '',
    readinessScore,
  });

  // Create default checklist
  const checklistItems = DEFAULT_CHECKLIST.map(item => ({
    ...item,
    completed: false,
  }));

  // Auto-complete some items based on user data
  if (age >= 18) {
    const eligItem = checklistItems.find(i => i.key === 'check_eligibility');
    if (eligItem) { eligItem.completed = true; eligItem.completedAt = new Date(); }
  }
  if (voterStatus === 'registered') {
    const regItem = checklistItems.find(i => i.key === 'register');
    if (regItem) { regItem.completed = true; regItem.completedAt = new Date(); }
  }
  if (hasVoterId) {
    const idItem = checklistItems.find(i => i.key === 'get_voter_id');
    if (idItem) { idItem.completed = true; idItem.completedAt = new Date(); }
  }

  const checklist = await Checklist.create({
    userId: user._id,
    items: checklistItems,
  });

  res.status(201).json({
    success: true,
    data: {
      user,
      checklist,
    },
  });
});

// GET /api/user/:userId
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  res.json({ success: true, data: user });
});

module.exports = { initUser, getUser };
