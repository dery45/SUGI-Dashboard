const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const { getFilterOptions } = require('../controllers/filterController');

router.get('/', authenticate, getFilterOptions);

module.exports = router;
