const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getFilterOptions } = require('../controller/filterController');

router.get('/', authenticate, getFilterOptions);

module.exports = router;