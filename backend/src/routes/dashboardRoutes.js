const express = require('express');
const router = express.Router();
const { getGovernmentDashboard: getGovtDashboardV2 } = require('../controllers/govtDashboardController');
const { getFarmerDashboard: getFarmerDashboardV2 } = require('../controllers/farmerDashboardController');

router.get('/farmer/v2', getFarmerDashboardV2);
router.get('/govt', getGovtDashboardV2);

module.exports = router;
