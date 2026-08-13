const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getInsights, getFarmerInsights } = require('../controller/insightController');

// FLAG: legacy insightRoutes had NO auth guard; restrictive default applied (authenticate) per ambiguous-guard policy
router.use(authenticate);

router.get('/', getInsights);
router.get('/farmer', getFarmerInsights);

module.exports = router;