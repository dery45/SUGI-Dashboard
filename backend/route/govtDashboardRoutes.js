const express = require('express');
const router = express.Router();
const { authenticate, isGovernment } = require('../middleware/auth');
const { getGovernmentDashboard: getGovtDashboardV2 } = require('../controller/govtDashboardController');

// govt: isGovernment (README `/government` = superadmin, government)
router.get('/govt', authenticate, isGovernment, getGovtDashboardV2);

module.exports = router;