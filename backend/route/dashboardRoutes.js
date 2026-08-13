const express = require('express');
const router = express.Router();
const { authenticate, isGovernment } = require('../middleware/auth');
const { getGovernmentDashboard: getGovtDashboardV2 } = require('../controller/govtDashboardController');
const { getFarmerDashboard: getFarmerDashboardV2 } = require('../controller/farmerDashboardController');

// farmer/v2: authenticate only (README `/farmer` = All authenticated)
router.get('/farmer/v2', getFarmerDashboardV2);

// govt: isGovernment (README `/government` = superadmin, government)
router.get('/govt', authenticate, isGovernment, getGovtDashboardV2);

module.exports = router;