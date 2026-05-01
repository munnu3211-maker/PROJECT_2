const express = require('express');
const { runScenario, getScenarios } = require('../controllers/scenarioController');
const router = express.Router();

router.post('/', runScenario);
router.get('/list', getScenarios);

module.exports = router;
