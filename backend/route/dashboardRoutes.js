const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getGovernmentDashboard: getGovtDashboardV2 } = require('../controller/govtDashboardController');
const { getFarmerDashboard: getFarmerDashboardV2 } = require('../controller/farmerDashboardController');

// FLAG: legacy dashboardRoutes had NO auth guard; restrictive default applied (authenticate) per ambiguous-guard policy
router.use(authenticate);

router.get('/farmer/v2', getFarmerDashboardV2);
router.get('/govt', getGovtDashboardV2);

module.exports = router;