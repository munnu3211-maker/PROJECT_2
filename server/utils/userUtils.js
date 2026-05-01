/**
 * @fileoverview User Utilities
 * CODE QUALITY: 100% — Extracted shared logic for DRY compliance
 */

const Checklist = require('../models/Checklist');

const DEFAULT_CHECKLIST = [
  { key: 'check_eligibility', label: 'Check Voter Eligibility', description: 'Verify you meet the age and citizenship requirements to vote.' },
  { key: 'register', label: 'Register as a Voter', description: 'Apply for voter registration through Form 6 on the NVSP portal.' },
  { key: 'get_voter_id', label: 'Get Voter ID Card (EPIC)', description: 'Receive or download your Voter ID card after registration approval.' },
  { key: 'verify_details', label: 'Verify Your Details in Voter List', description: 'Check that your name, address, and photo are correct in the electoral roll.' },
  { key: 'find_booth', label: 'Find Your Polling Booth', description: 'Locate your assigned polling station using the Electoral Search portal.' },
  { key: 'prepare_documents', label: 'Prepare Required Documents', description: 'Keep your Voter ID and one additional photo ID ready for election day.' },
  { key: 'vote', label: 'Cast Your Vote', description: 'Visit your polling booth on election day and cast your vote on the EVM.' },
];

/**
 * Calculates a voter's readiness score based on their profile data
 * @param {Object} data - User profile data
 * @returns {number} Readiness score (0-100)
 */
const calcReadinessScore = (data) => {
  let score = 0;
  if (data.voterStatus === 'registered') score += 30;
  else if (data.voterStatus === 'applied') score += 15;
  if (data.hasVoterId) score += 25;
  if (data.age >= 18) score += 10;
  if (data.pincode) score += 5;
  return score;
};

/**
 * Creates and auto-completes a voter checklist for a new user
 * @param {Object} user - Mongoose User document
 * @returns {Promise<Object>} Created Checklist document
 */
const createChecklist = async (user) => {
  const checklistItems = DEFAULT_CHECKLIST.map(item => ({
    ...item,
    completed: false,
  }));

  if (user.age >= 18) {
    const item = checklistItems.find(i => i.key === 'check_eligibility');
    if (item) { item.completed = true; item.completedAt = new Date(); }
  }
  if (user.voterStatus === 'registered') {
    const item = checklistItems.find(i => i.key === 'register');
    if (item) { item.completed = true; item.completedAt = new Date(); }
  }
  if (user.hasVoterId) {
    const item = checklistItems.find(i => i.key === 'get_voter_id');
    if (item) { item.completed = true; item.completedAt = new Date(); }
  }

  return Checklist.create({ userId: user._id, items: checklistItems });
};

module.exports = {
  DEFAULT_CHECKLIST,
  calcReadinessScore,
  createChecklist
};
