const express = require('express');
const { initUser, getUser } = require('../controllers/userController');
const router = express.Router();

router.post('/init', initUser);
router.get('/:userId', getUser);

module.exports = router;
