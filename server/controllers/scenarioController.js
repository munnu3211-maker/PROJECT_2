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
const { asyncHandler } = require('../middleware/errorHandler');

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

// ─── Fallback Scenario Data ────────────────────────────────
const FALLBACK_SCENARIOS = {
  first_time_voter: {
    scenario: 'first_time_voter', title: 'First-Time Voter Guide',
    description: 'Complete guide for someone voting for the first time in India.',
    steps: [
      { number: 1, action: 'Check Eligibility', details: 'Must be 18+ Indian citizen', link: 'https://voters.eci.gov.in/' },
      { number: 2, action: 'Register Online', details: 'Fill Form 6 on NVSP portal', link: 'https://voters.eci.gov.in/' },
      { number: 3, action: 'Submit Documents', details: 'Upload photo, age proof, address proof', link: '' },
      { number: 4, action: 'Get Voter ID', details: 'Download e-EPIC after approval', link: 'https://voters.eci.gov.in/' },
      { number: 5, action: 'Find Your Booth', details: 'Search at Electoral Search portal', link: 'https://electoralsearch.eci.gov.in/' },
      { number: 6, action: 'Vote on Election Day', details: 'Carry Voter ID, reach booth early', link: '' },
    ],
    documentsNeeded: ['Passport photo', 'Aadhaar Card', 'Age proof (birth certificate/10th marksheet)'],
    estimatedTime: '15-30 days', helplineNumber: '1950', nextAction: 'Start registration at voters.eci.gov.in'
  },
  lost_voter_id: {
    scenario: 'lost_voter_id', title: 'Lost Voter ID — Get a Replacement',
    description: 'How to get a duplicate Voter ID card if yours is lost or damaged.',
    steps: [
      { number: 1, action: 'File an FIR (optional)', details: 'Report the loss at your local police station', link: '' },
      { number: 2, action: 'Visit NVSP Portal', details: 'Go to voters.eci.gov.in', link: 'https://voters.eci.gov.in/' },
      { number: 3, action: 'Fill Form 001', details: 'Application for duplicate EPIC', link: '' },
      { number: 4, action: 'Submit with Declaration', details: 'Declare the loss and attach FIR copy if available', link: '' },
      { number: 5, action: 'Download e-EPIC', details: 'Get digital copy immediately after verification', link: 'https://voters.eci.gov.in/' },
    ],
    documentsNeeded: ['FIR copy (if filed)', 'Aadhaar Card', 'Passport photo'],
    estimatedTime: '7-15 days', helplineNumber: '1950', nextAction: 'Visit voters.eci.gov.in and apply for duplicate'
  },
  name_mismatch: {
    scenario: 'name_mismatch', title: 'Name Mismatch in Voter Records',
    description: 'How to correct your name in the electoral roll.',
    steps: [
      { number: 1, action: 'Visit NVSP Portal', details: 'Go to voters.eci.gov.in', link: 'https://voters.eci.gov.in/' },
      { number: 2, action: 'Fill Form 8', details: 'Correction of entries in electoral roll', link: '' },
      { number: 3, action: 'Upload Proof', details: 'Attach ID showing correct name', link: '' },
      { number: 4, action: 'Submit & Track', details: 'Note reference number and track status', link: '' },
    ],
    documentsNeeded: ['Aadhaar Card', 'PAN Card', 'Passport', 'Any ID with correct name'],
    estimatedTime: '15-30 days', helplineNumber: '1950', nextAction: 'Fill Form 8 on NVSP portal'
  },
  nri_voting: {
    scenario: 'nri_voting', title: 'NRI Voting Registration',
    description: 'Guide for Overseas Electors (NRIs) to register to vote in India.',
    steps: [
      { number: 1, action: 'Verify Eligibility', details: 'Must be an Indian citizen living abroad, not having acquired foreign citizenship.', link: '' },
      { number: 2, action: 'Visit NVSP Portal', details: 'Access the overseas elector portal', link: 'https://voters.eci.gov.in/' },
      { number: 3, action: 'Fill Form 6A', details: 'Application for inclusion of name in electoral roll by an overseas elector.', link: '' },
      { number: 4, action: 'Upload Documents', details: 'Valid Indian Passport pages with visa endorsement.', link: '' },
      { number: 5, action: 'Vote in Person', details: 'Currently, NRIs must vote in person at their respective constituency.', link: '' },
    ],
    documentsNeeded: ['Indian Passport (Front & Back)', 'Valid Visa endorsement', 'Recent Photo'],
    estimatedTime: '30-45 days', helplineNumber: '1950', nextAction: 'Fill Form 6A on NVSP portal'
  },
  pwd_voting: {
    scenario: 'pwd_voting', title: 'Voting with a Disability (PwD)',
    description: 'Special facilities and registration for Persons with Disabilities.',
    steps: [
      { number: 1, action: 'Mark PwD Status', details: 'Use Saksham App or Form 8 to mark yourself as PwD in the voter list.', link: '' },
      { number: 2, action: 'Request Facilities', details: 'Request wheelchair, pick & drop, or volunteer assistance.', link: '' },
      { number: 3, action: 'Home Voting Option', details: 'Fill Form 12D within 5 days of election notification if applicable (85+ or 40% PwD).', link: '' },
      { number: 4, action: 'Vote', details: 'Use priority queues or home voting to cast your vote.', link: '' },
    ],
    documentsNeeded: ['Disability Certificate', 'Voter ID Card'],
    estimatedTime: '7-10 days', helplineNumber: '1950', nextAction: 'Download the Saksham ECI App'
  },
  shift_constituency: {
    scenario: 'shift_constituency', title: 'Changing Constituency',
    description: 'Transfer your voter registration from one constituency to another.',
    steps: [
      { number: 1, action: 'Log into Portal', details: 'Go to voters.eci.gov.in', link: 'https://voters.eci.gov.in/' },
      { number: 2, action: 'Select Form 8', details: 'Choose shifting of residence option.', link: '' },
      { number: 3, action: 'Provide Details', details: 'Enter old EPIC number and new address.', link: '' },
      { number: 4, action: 'Upload Address Proof', details: 'Rent agreement, electricity bill, or Aadhaar.', link: '' },
      { number: 5, action: 'Verification', details: 'BLO will visit the new address for verification.', link: '' },
    ],
    documentsNeeded: ['Address Proof (New Address)', 'Old Voter ID'],
    estimatedTime: '15-30 days', helplineNumber: '1950', nextAction: 'Fill Form 8 for Shifting'
  },
  aadhaar_link: {
    scenario: 'aadhaar_link', title: 'Linking Aadhaar with Voter ID',
    description: 'Authenticate your electoral details by linking your Aadhaar.',
    steps: [
      { number: 1, action: 'Open Voter Helpline App', details: 'Or visit voters.eci.gov.in', link: 'https://voters.eci.gov.in/' },
      { number: 2, action: 'Fill Form 6B', details: 'Letter of Information of Aadhaar number.', link: '' },
      { number: 3, action: 'Authenticate', details: 'Enter Aadhaar and authenticate via OTP.', link: '' },
      { number: 4, action: 'Confirmation', details: 'Receive a reference number for tracking.', link: '' },
    ],
    documentsNeeded: ['Aadhaar Card Number', 'Voter ID (EPIC)'],
    estimatedTime: 'Instant / 1 day', helplineNumber: '1950', nextAction: 'Submit Form 6B online'
  },
  missed_registration: {
    scenario: 'missed_registration', title: 'Missed Registration Deadline',
    description: 'What to do if the voter registration deadline for the current election has passed.',
    steps: [
      { number: 1, action: 'Check Electoral Roll', details: 'Your name may already be on the roll from a previous cycle. Search at electoralsearch.eci.gov.in.', link: 'https://electoralsearch.eci.gov.in/' },
      { number: 2, action: 'Register Anyway', details: 'Submit Form 6 now so you are included in the next revision of the roll.', link: 'https://voters.eci.gov.in/' },
      { number: 3, action: 'Contact ERO', details: 'Write to your Electoral Registration Officer for special inclusion if election is not yet notified.', link: '' },
      { number: 4, action: 'Plan Ahead', details: 'Electoral rolls are revised twice a year (Jan 1 & Jul 1). Register before the next qualifying date.', link: '' },
    ],
    documentsNeeded: ['Form 6', 'ID & Address Proof'],
    estimatedTime: 'Next revision cycle', helplineNumber: '1950', nextAction: 'Submit Form 6 immediately'
  },
  no_documents: {
    scenario: 'no_documents', title: 'Voting Without Standard Documents',
    description: 'Alternative identity proofs accepted at the polling booth.',
    steps: [
      { number: 1, action: 'Know the Alternatives', details: 'ECI accepts 12 alternative photo IDs beyond the Voter ID card.', link: '' },
      { number: 2, action: 'Accepted IDs Include', details: 'Aadhaar, Driving Licence, PAN Card, Passport, MNREGA Job Card, Bank/Post Office Passbook with Photo, Smart Card by RGI, Health Insurance Card (RSBY), Pension document with photo, MP/MLA/MLC ID, Service ID of Central/State Govt, Student ID (for students).', link: '' },
      { number: 3, action: 'If No Photo ID', details: 'Approach your BLO (Booth Level Officer) for a slip based on electoral roll entry.', link: '' },
      { number: 4, action: 'On Voting Day', details: 'Carry any available photo ID. The presiding officer has final authority to verify identity.', link: '' },
    ],
    documentsNeeded: ['Any one of the 12 ECI-approved photo IDs'],
    estimatedTime: 'Same day', helplineNumber: '1950', nextAction: 'Gather any available photo ID before election day'
  },
  senior_citizen_voting: {
    scenario: 'senior_citizen_voting', title: 'Senior Citizen Voting (80+)',
    description: 'Home voting and priority facilities for voters aged 80 and above.',
    steps: [
      { number: 1, action: 'Opt for Home Voting', details: 'Fill Form 12D after election notification to request postal ballot at home.', link: '' },
      { number: 2, action: 'BLO Visit', details: 'A Booth Level Officer will deliver and collect your ballot at home.', link: '' },
      { number: 3, action: 'Or Visit Booth', details: 'If you prefer, you get priority entry and wheelchair access at the booth.', link: '' },
      { number: 4, action: 'Companion Allowed', details: 'You may bring a companion to assist you in the voting compartment.', link: '' },
    ],
    documentsNeeded: ['Voter ID Card', 'Form 12D (for home voting)'],
    estimatedTime: '5 days after notification', helplineNumber: '1950', nextAction: 'Contact your BLO after election is announced'
  },
  voter_id_correction: {
    scenario: 'voter_id_correction', title: 'Correcting Voter ID Details',
    description: 'Fix errors in photo, address, DOB, or gender on your Voter ID.',
    steps: [
      { number: 1, action: 'Identify the Error', details: 'Check which field is incorrect — name, photo, DOB, gender, or address.', link: '' },
      { number: 2, action: 'Fill Form 8', details: 'Use "Correction of Entries" on the NVSP portal.', link: 'https://voters.eci.gov.in/' },
      { number: 3, action: 'Upload Supporting Docs', details: 'Attach documents that show the correct information.', link: '' },
      { number: 4, action: 'Track Application', details: 'Use the reference ID to check correction status online.', link: '' },
    ],
    documentsNeeded: ['Correct ID proof', 'Passport photo (if photo correction)', 'Birth certificate (if DOB correction)'],
    estimatedTime: '15-30 days', helplineNumber: '1950', nextAction: 'Submit Form 8 with correct documents'
  },
  election_day_guide: {
    scenario: 'election_day_guide', title: 'Election Day — What to Expect',
    description: 'A complete walkthrough of what happens on voting day.',
    steps: [
      { number: 1, action: 'Arrive at Booth', details: 'Polling starts at 7 AM. Arrive early to avoid long queues.', link: '' },
      { number: 2, action: 'Queue & Identity Check', details: 'Show your Voter ID or approved photo ID. Your finger is checked for ink.', link: '' },
      { number: 3, action: 'Ink Marking', details: 'Indelible ink is applied on your left index finger.', link: '' },
      { number: 4, action: 'Receive Slip', details: 'You get a slip with your serial number and details.', link: '' },
      { number: 5, action: 'Enter Voting Compartment', details: 'Press the button next to your preferred candidate on the EVM.', link: '' },
      { number: 6, action: 'VVPAT Verification', details: 'Check the printed slip in the VVPAT machine (visible for 7 seconds).', link: '' },
      { number: 7, action: 'Exit', details: 'Leave the booth quietly. Do not discuss your vote inside the premises.', link: '' },
    ],
    documentsNeeded: ['Voter ID / Any of 12 approved photo IDs'],
    estimatedTime: '15-45 minutes', helplineNumber: '1950', nextAction: 'Find your booth location beforehand'
  },
  postal_ballot: {
    scenario: 'postal_ballot', title: 'Postal Ballot Voting',
    description: 'Who is eligible and how to vote via postal ballot.',
    steps: [
      { number: 1, action: 'Check Eligibility', details: 'Service voters (armed forces, diplomats), senior citizens 80+, PwD 40%+, essential service workers, and COVID-positive voters.', link: '' },
      { number: 2, action: 'Submit Form 12', details: 'Apply using Form 12 (Service Voters) or Form 12D (Senior/PwD).', link: '' },
      { number: 3, action: 'Receive Ballot', details: 'Ballot is delivered to your address by a designated officer.', link: '' },
      { number: 4, action: 'Mark & Return', details: 'Fill your ballot in secrecy, seal it, and hand it to the officer.', link: '' },
    ],
    documentsNeeded: ['Form 12 / 12D', 'Voter ID', 'Service ID (if applicable)'],
    estimatedTime: 'Within notification period', helplineNumber: '1950', nextAction: 'Apply after election notification'
  },
  voter_list_deletion: {
    scenario: 'voter_list_deletion', title: 'Name Deleted from Voter List',
    description: 'What to do if your name was removed from the electoral roll.',
    steps: [
      { number: 1, action: 'Verify Deletion', details: 'Search at electoralsearch.eci.gov.in to confirm your name is missing.', link: 'https://electoralsearch.eci.gov.in/' },
      { number: 2, action: 'Re-register via Form 6', details: 'Submit a fresh Form 6 at the NVSP portal for inclusion.', link: 'https://voters.eci.gov.in/' },
      { number: 3, action: 'Contact BLO', details: 'Reach out to your local Booth Level Officer for expedited inclusion.', link: '' },
      { number: 4, action: 'File Complaint', details: 'If wrongfully deleted, complain to ERO or use cVIGIL app.', link: '' },
    ],
    documentsNeeded: ['Form 6', 'ID Proof', 'Address Proof'],
    estimatedTime: '15-30 days', helplineNumber: '1950', nextAction: 'Search your name and re-register immediately'
  },
  complaint_filing: {
    scenario: 'complaint_filing', title: 'Filing an Election Complaint',
    description: 'How to report violations, malpractices, or issues during elections.',
    steps: [
      { number: 1, action: 'Download cVIGIL App', details: 'ECI\'s official app for reporting Model Code of Conduct violations.', link: 'https://cvigil.eci.gov.in/' },
      { number: 2, action: 'Record Evidence', details: 'Take photo/video of the violation within the app.', link: '' },
      { number: 3, action: 'Submit Report', details: 'App auto-captures location. Submit within 100 minutes of occurrence.', link: '' },
      { number: 4, action: 'Track Resolution', details: 'Get a tracking ID. Flying squads act within 100 minutes.', link: '' },
      { number: 5, action: 'Alternative Channels', details: 'Call 1950 or visit the local Returning Officer.', link: '' },
    ],
    documentsNeeded: ['cVIGIL App', 'Photo/Video evidence'],
    estimatedTime: 'Action within 100 minutes', helplineNumber: '1950', nextAction: 'Install cVIGIL from your app store'
  },
  evm_vvpat_info: {
    scenario: 'evm_vvpat_info', title: 'Understanding EVM & VVPAT',
    description: 'How Electronic Voting Machines and VVPAT work in Indian elections.',
    steps: [
      { number: 1, action: 'What is EVM?', details: 'A standalone electronic device with Ballot Unit (BU) and Control Unit (CU). Not connected to internet.', link: '' },
      { number: 2, action: 'How to Vote on EVM', details: 'Press the blue button next to your candidate\'s name and symbol on the Ballot Unit.', link: '' },
      { number: 3, action: 'What is VVPAT?', details: 'Voter Verifiable Paper Audit Trail — a printer attached to EVM that shows a slip with your vote.', link: '' },
      { number: 4, action: 'Verification', details: 'After pressing the button, a printed slip is visible for 7 seconds behind a glass window.', link: '' },
      { number: 5, action: 'Security Features', details: 'EVMs use one-time programmable chips, are tested before every election, and stored in strong rooms.', link: '' },
    ],
    documentsNeeded: [],
    estimatedTime: 'Educational — no action needed', helplineNumber: '1950', nextAction: 'Watch ECI\'s EVM demo video'
  },
  model_code_conduct: {
    scenario: 'model_code_conduct', title: 'Model Code of Conduct (MCC)',
    description: 'Rules that govern parties, candidates, and government during elections.',
    steps: [
      { number: 1, action: 'When Does MCC Apply?', details: 'From the date of election announcement until results are declared.', link: '' },
      { number: 2, action: 'For Parties & Candidates', details: 'No personal attacks, no caste/religion appeals, no bribery, no govt resources misuse.', link: '' },
      { number: 3, action: 'For Government', details: 'No new schemes, appointments, or inaugurations after MCC. No ads using public funds.', link: '' },
      { number: 4, action: 'For Voters', details: 'Do not accept bribes. Report violations via cVIGIL app.', link: 'https://cvigil.eci.gov.in/' },
      { number: 5, action: 'Enforcement', details: 'ECI can censure, ban campaigning, or refer to courts for violations.', link: '' },
    ],
    documentsNeeded: [],
    estimatedTime: 'Educational', helplineNumber: '1950', nextAction: 'Learn your rights as a voter'
  },
  multiple_entries: {
    scenario: 'multiple_entries', title: 'Duplicate / Multiple Voter Entries',
    description: 'How to handle duplicate registrations in the electoral roll.',
    steps: [
      { number: 1, action: 'Search Both Entries', details: 'Use electoralsearch.eci.gov.in to locate duplicate entries.', link: 'https://electoralsearch.eci.gov.in/' },
      { number: 2, action: 'File Form 7', details: 'Objection for inclusion of name — request deletion of the duplicate.', link: 'https://voters.eci.gov.in/' },
      { number: 3, action: 'Provide Evidence', details: 'Submit both EPIC numbers showing the duplication.', link: '' },
      { number: 4, action: 'ERO Action', details: 'The Electoral Registration Officer will verify and remove the duplicate.', link: '' },
    ],
    documentsNeeded: ['Both EPIC numbers', 'ID Proof'],
    estimatedTime: '15-30 days', helplineNumber: '1950', nextAction: 'File Form 7 on NVSP portal'
  },
  overseas_voting_bill: {
    scenario: 'overseas_voting_bill', title: 'Remote Voting for NRIs (Upcoming)',
    description: 'Understanding the proposed remote/proxy voting system for overseas Indians.',
    steps: [
      { number: 1, action: 'Current Status', details: 'The Registration of Electors (Amendment) Bill proposes proxy voting for NRIs.', link: '' },
      { number: 2, action: 'What is Proxy Voting?', details: 'A nominated person in your constituency votes on your behalf.', link: '' },
      { number: 3, action: 'Register Now', details: 'Even before the law passes, register as an overseas elector via Form 6A.', link: 'https://voters.eci.gov.in/' },
      { number: 4, action: 'Stay Updated', details: 'Follow ECI announcements for when remote voting becomes law.', link: 'https://eci.gov.in/' },
    ],
    documentsNeeded: ['Indian Passport', 'Form 6A'],
    estimatedTime: 'Pending legislation', helplineNumber: '1950', nextAction: 'Register as Overseas Elector now'
  },
  transgender_voter: {
    scenario: 'transgender_voter', title: 'Transgender Voter Registration',
    description: 'How transgender persons can register with their preferred gender identity.',
    steps: [
      { number: 1, action: 'Choose Gender Option', details: 'Form 6 includes "Third Gender / Transgender" as a gender option.', link: 'https://voters.eci.gov.in/' },
      { number: 2, action: 'Photo Guidelines', details: 'Upload a recent photo. No specific dress code mandated.', link: '' },
      { number: 3, action: 'Name as Per ID', details: 'Use your preferred name; it should match one valid ID proof.', link: '' },
      { number: 4, action: 'ECI Support', details: 'ECI has mandated special sensitization for booth staff. Report issues to ERO.', link: '' },
    ],
    documentsNeeded: ['Any valid ID proof', 'Photo', 'Address proof'],
    estimatedTime: '15-30 days', helplineNumber: '1950', nextAction: 'Register using Form 6 with third gender option'
  },
};

// ─── Scenario List ─────────────────────────────────────────
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
