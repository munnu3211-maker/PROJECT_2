const express = require('express');
const { getQuiz, submitQuiz } = require('../controllers/quizController');
const router = express.Router();

router.get('/', getQuiz);
router.post('/submit', submitQuiz);

module.exports = router;
