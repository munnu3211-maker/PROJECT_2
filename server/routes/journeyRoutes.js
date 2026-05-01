const express = require('express');
const { getJourney } = require('../controllers/journeyController');
const router = express.Router();

router.get('/:userId', getJourney);

module.exports = router;
