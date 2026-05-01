const express = require('express');
const { getBoothGuide } = require('../controllers/boothController');
const router = express.Router();

router.post('/', getBoothGuide);

module.exports = router;
