const express = require('express');
const router = express.Router();
const { getInsights, getFarmerInsights } = require('../controllers/insightController');

router.get('/', getInsights);
router.get('/farmer', getFarmerInsights);

module.exports = router;
