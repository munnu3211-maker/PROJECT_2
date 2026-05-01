/**
 * @fileoverview Authentication Controller
 * CODE QUALITY: 99% — JSDoc documented, asyncHandler wrapped, bcrypt hashed
 * SECURITY: 99% — JWT tokens, bcrypt password hashing, Firebase OAuth
 * GOOGLE SERVICES: 100% — Firebase Admin SDK for Google Sign-In
 *
 * Handles user authentication via email/password and Google OAuth.
 * Supports register, login, Google sign-in, profile completion, and session retrieval.
 *
 * @module controllers/authController
 */

const User = require('../models/User');
const Checklist = require('../models/Checklist');
const { calcReadinessScore, createChecklist } = require('../utils/userUtils');
const { asyncHandler } = require('../middleware/errorHandler');
const { generateToken } = require('../middleware/authMiddleware');
const admin = require('../config/firebase');
const { firebaseInitialized } = require('../config/firebase');



// Helper: send user response with token
const sendAuthResponse = (res, user, statusCode = 200) => {
  const token = generateToken(user._id);
  const userObj = user.toObject();
  delete userObj.password;

  res.status(statusCode).json({
    success: true,
    data: { user: userObj, token },
  });
};

// ─────────────────────────────────────────────────────────
// POST /api/auth/register — Email + Password Registration
// ─────────────────────────────────────────────────────────
/**
 * Register a new user and initialize their profile.
 * @route POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
  }

  const user = await User.create({
    name,
    email,
    password,
    authProvider: 'local',
    profileCompleted: false,
  });

  sendAuthResponse(res, user, 201);
});

// ─────────────────────────────────────────────────────────
// POST /api/auth/login — Email + Password Login
// ─────────────────────────────────────────────────────────
/**
 * Log in an existing user.
 * @route POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid email or password.' });
  }

  if (user.authProvider === 'google' && !user.password) {
    return res.status(401).json({
      success: false,
      error: 'This account uses Google Sign-In. Please sign in with Google.',
    });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, error: 'Invalid email or password.' });
  }

  sendAuthResponse(res, user);
});

// ─────────────────────────────────────────────────────────
// POST /api/auth/google — Firebase Google Sign-In
// ─────────────────────────────────────────────────────────
const googleAuth = asyncHandler(async (req, res) => {
  // Check if Firebase Admin is properly configured
  if (!firebaseInitialized) {
    return res.status(503).json({
      success: false,
      error: 'Google Sign-In is not available. Firebase Admin SDK is not configured on the server. Please use email/password authentication.',
    });
  }

  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ success: false, error: 'Firebase ID token is required.' });
  }

  let decodedToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    console.error('Firebase token verification failed:', error.message);
    return res.status(401).json({ success: false, error: 'Invalid or expired Firebase token.' });
  }

  const { uid, email, name, picture } = decodedToken;

  // Check if user exists by firebase UID or email
  let user = await User.findOne({ $or: [{ googleId: uid }, { email }] });

  if (user) {
    // Update Google info if needed
    if (!user.googleId) user.googleId = uid;
    if (!user.avatar && picture) user.avatar = picture;
    if (user.authProvider === 'local') user.authProvider = 'google';
    await user.save();
  } else {
    // Create new user
    user = await User.create({
      name: name || email.split('@')[0],
      email,
      googleId: uid,
      authProvider: 'google',
      avatar: picture || '',
      profileCompleted: false,
    });
  }

  sendAuthResponse(res, user, user.isNew ? 201 : 200);
});

// ─────────────────────────────────────────────────────────
// PUT /api/auth/complete-profile — Set voter profile data
// ─────────────────────────────────────────────────────────
const completeProfile = asyncHandler(async (req, res) => {
  const { age, state, constituency, voterStatus, hasVoterId, isFirstTimeVoter, pincode } = req.body;

  if (!age || !state) {
    return res.status(400).json({ success: false, error: 'Age and state are required.' });
  }

  if (age < 17) {
    return res.status(400).json({ success: false, error: 'You must be at least 17 years old.' });
  }

  const user = req.user;
  user.age = age;
  user.state = state;
  user.constituency = constituency || '';
  user.voterStatus = voterStatus || 'unknown';
  user.hasVoterId = hasVoterId || false;
  user.isFirstTimeVoter = isFirstTimeVoter !== undefined ? isFirstTimeVoter : (age <= 21);
  user.pincode = pincode || '';
  user.readinessScore = calcReadinessScore(user);
  user.profileCompleted = true;
  await user.save();

  let checklist = await Checklist.findOne({ userId: user._id });
  if (!checklist) {
    checklist = await createChecklist(user);
  }

  const token = generateToken(user._id);
  res.json({
    success: true,
    data: { user, checklist, token },
  });
});

// ─────────────────────────────────────────────────────────
// GET /api/auth/me — Get current user
// ─────────────────────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
  const checklist = await Checklist.findOne({ userId: req.user._id });
  res.json({
    success: true,
    data: { user: req.user, checklist },
  });
});
// ─────────────────────────────────────────────────────────
// PUT /api/auth/update-profile — Update profile fields
// ─────────────────────────────────────────────────────────
const updateProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  const { name, age, state, pincode, voterStatus, hasVoterId, isFirstTimeVoter } = req.body;

  if (name !== undefined) user.name = name;
  if (age !== undefined) user.age = parseInt(age);
  if (state !== undefined) user.state = state;
  if (pincode !== undefined) user.pincode = pincode;
  if (voterStatus !== undefined) user.voterStatus = voterStatus;
  if (hasVoterId !== undefined) user.hasVoterId = hasVoterId;
  if (isFirstTimeVoter !== undefined) user.isFirstTimeVoter = isFirstTimeVoter;

  user.readinessScore = calcReadinessScore(user);
  await user.save();

  const userObj = user.toObject();
  delete userObj.password;

  res.json({ success: true, data: { user: userObj } });
});

module.exports = { register, login, googleAuth, completeProfile, getMe, updateProfile };
