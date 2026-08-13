const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getFarmerDashboard: getFarmerDashboardV2 } = require('../controller/farmerDashboardController');

// farmer/v2: authenticate only (README `/farmer` = All authenticated)
router.get('/farmer/v2', authenticate, getFarmerDashboardV2);

module.exports = router;