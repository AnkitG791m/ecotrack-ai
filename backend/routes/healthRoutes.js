const express = require('express');
const router = express.Router();
const { getHealth, getDbHealth, getAiHealth } = require('../controllers/healthController');

router.get('/', getHealth);
router.get('/db', getDbHealth);
router.get('/ai', getAiHealth);

module.exports = router;
