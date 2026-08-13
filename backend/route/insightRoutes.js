const express = require('express');
const router = express.Router();
const { authenticate, isGovernment } = require('../middleware/auth');
const { getInsights, getFarmerInsights } = require('../controller/insightController');

// /insights (policy recommendations) feeds the government dashboard (README:
// "Government Insights: Policy recommendations" + /government role). isGovernment.
// /insights/farmer (market intelligence, 10 items) feeds the all-authenticated
// farmer dashboard (README /farmer = All authenticated). authenticate only.
router.use(authenticate);

router.get('/', isGovernment, getInsights);
router.get('/farmer', getFarmerInsights);

module.exports = router;