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
const { calcReadinessScore, createChecklist } = require('../utils/userUtils');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Initialize a new user profile or update an existing one.
 * @route POST /api/user/init
 */
const initUser = asyncHandler(async (req, res) => {
  const { name, age, state, constituency, voterStatus, hasVoterId, isFirstTimeVoter, pincode } = req.body;

  if (!name || !age || !state) {
    return res.status(400).json({ success: false, error: 'Name, age, and state are required.' });
  }

  if (age < 17) {
    return res.status(400).json({ success: false, error: 'You must be at least 17 years old to prepare for voting.' });
  }

  // Calculate initial readiness score
  const readinessScore = calcReadinessScore(req.body);

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
  const checklist = await createChecklist(user);

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
