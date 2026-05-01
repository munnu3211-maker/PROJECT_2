const express = require('express');
const { getChecklist, updateChecklist } = require('../controllers/checklistController');
const router = express.Router();

router.get('/:userId', getChecklist);
router.post('/update', updateChecklist);

module.exports = router;
