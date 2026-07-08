const express = require('express');
const router = express.Router();
const { getFarmerDashboard, getGovernmentDashboard } = require('../controllers/dashboardDataController');
const { getGovernmentDashboard: getGovtDashboardV2 } = require('../controllers/govtDashboardController');
const { getFarmerDashboard: getFarmerDashboardV2 } = require('../controllers/farmerDashboardController');

router.get('/farmer', getFarmerDashboard);
router.get('/farmer/v2', getFarmerDashboardV2);
router.get('/government', getGovernmentDashboard);
router.get('/govt', getGovtDashboardV2);

module.exports = router;
