const express = require('express');
const { chat, getChatHistory } = require('../controllers/chatController');
const router = express.Router();

router.post('/', chat);
router.get('/:userId/history', getChatHistory);

module.exports = router;
