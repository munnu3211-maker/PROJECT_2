const express = require('express');
const { getTimeline } = require('../controllers/timelineController');
const router = express.Router();

router.get('/:userId', getTimeline);

module.exports = router;
