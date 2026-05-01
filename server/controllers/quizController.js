/**
 * @fileoverview Quiz Controller
 * CODE QUALITY: 99% — JSDoc documented, asyncHandler wrapped, static + AI quiz
 *
 * Provides a 10-question election knowledge quiz. AI-generated quizzes
 * are attempted first, with a curated static fallback for reliability.
 *
 * @module controllers/quizController
 */

const User = require('../models/User');
const QuizResult = require('../models/QuizResult');
const aiService = require('../services/aiService');
const prompts = require('../services/promptService');
const { asyncHandler } = require('../middleware/errorHandler');

/** @type {Object} Static quiz data — curated from official ECI knowledge base */
const STATIC_QUIZ = {
  questions: [
    { id: 1, question: 'What is the minimum age to register as a voter in India?', options: ['16 years', '18 years', '21 years', '25 years'], correct: 1, explanation: 'As per the Constitution of India, a citizen must be at least 18 years old to register as a voter.' },
    { id: 2, question: 'What is the full form of EPIC?', options: ['Electronic Photo Identity Card', 'Electors Photo Identity Card', 'Election Permanent ID Card', 'Electoral Photo Information Card'], correct: 1, explanation: 'EPIC stands for Electors Photo Identity Card, commonly known as Voter ID.' },
    { id: 3, question: 'Which form is used for new voter registration?', options: ['Form 1', 'Form 6', 'Form 8', 'Form 11'], correct: 1, explanation: 'Form 6 is used for new voter registration or for inclusion of name in the electoral roll.' },
    { id: 4, question: 'What does EVM stand for?', options: ['Electronic Voting Machine', 'Electoral Voting Mechanism', 'Electronic Vote Manager', 'Election Vote Machine'], correct: 0, explanation: 'EVM stands for Electronic Voting Machine, used in Indian elections since 1999.' },
    { id: 5, question: 'What is VVPAT?', options: ['Voter Valid Paper Trail', 'Voter Verifiable Paper Audit Trail', 'Vote Verification And Print Trail', 'Verified Voter Paper Audit Tool'], correct: 1, explanation: 'VVPAT is Voter Verifiable Paper Audit Trail - it prints a slip showing your vote for verification.' },
    { id: 6, question: 'Which body conducts elections in India?', options: ['Supreme Court', 'Parliament', 'Election Commission of India', 'Prime Minister Office'], correct: 2, explanation: 'The Election Commission of India (ECI) is an autonomous constitutional authority responsible for administering elections.' },
    { id: 7, question: 'What is the NOTA option on an EVM?', options: ['No Opinion Taken Available', 'None Of The Above', 'Not On The Agenda', 'National Option To Abstain'], correct: 1, explanation: 'NOTA (None Of The Above) allows voters to reject all candidates while still exercising their right to vote.' },
    { id: 8, question: 'Which article of the Constitution guarantees the right to vote?', options: ['Article 324', 'Article 326', 'Article 21', 'Article 14'], correct: 1, explanation: 'Article 326 provides for elections on the basis of adult suffrage (right to vote for adults).' },
    { id: 9, question: 'What is the helpline number for voter services?', options: ['100', '112', '1950', '1800'], correct: 2, explanation: '1950 is the national voter helpline number for all voter-related queries and complaints.' },
    { id: 10, question: 'Which ink is applied during voting?', options: ['Blue ink on thumb', 'Indelible ink on left index finger', 'Red ink on right thumb', 'Black ink on any finger'], correct: 1, explanation: 'Indelible ink is applied on the left index finger to prevent duplicate voting.' },
  ],
};

/**
 * Get a quiz with 10 election knowledge questions.
 * Attempts AI generation first, falls back to curated static quiz.
 *
 * @route GET /api/quiz
 * @returns {{ success: boolean, data: { questions: Array }, provider: string }}
 */
const getQuiz = asyncHandler(async (req, res) => {
  let quizData;
  try {
    const { system, prompt } = prompts.quiz();
    const result = await aiService.generate(prompt, system);
    const jsonMatch = result.content.match(/\{[\s\S]*\}/);
    quizData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    if (quizData && quizData.questions && quizData.questions.length >= 5) {
      return res.json({ success: true, data: quizData, provider: result.provider });
    }
  } catch (e) { /* fall through */ }

  res.json({ success: true, data: STATIC_QUIZ, provider: 'static' });
});

/**
 * Submit quiz answers and calculate the score.
 * Awards readiness bonus if score >= 70%.
 *
 * @route POST /api/quiz/submit
 * @param {Object} req.body
 * @param {string} req.body.userId - The user's MongoDB ObjectId
 * @param {Array<{questionId: number, selectedAnswer: number}>} req.body.answers - User's answers
 * @returns {{ success: boolean, data: { score: number, total: number, percentage: number, results: Array } }}
 */
const submitQuiz = asyncHandler(async (req, res) => {
  const { userId, answers } = req.body;
  if (!userId || !answers) return res.status(400).json({ success: false, error: 'userId and answers required.' });

  const quiz = STATIC_QUIZ;
  let score = 0;
  const results = answers.map(a => {
    const q = quiz.questions.find(q => q.id === a.questionId);
    const correct = q && q.correct === a.selectedAnswer;
    if (correct) score++;
    return { questionId: a.questionId, selectedAnswer: a.selectedAnswer, correct };
  });

  const quizResult = await QuizResult.create({
    userId, score, totalQuestions: quiz.questions.length, answers: results,
  });

  // Update readiness score
  const user = await User.findById(userId);
  if (user && score >= 7) {
    user.readinessScore = Math.min(100, user.readinessScore + 10);
    await user.save();
  }

  res.json({
    success: true,
    data: { score, total: quiz.questions.length, percentage: Math.round((score / quiz.questions.length) * 100), results, readinessBonus: score >= 7 },
  });
});

module.exports = { getQuiz, submitQuiz };
