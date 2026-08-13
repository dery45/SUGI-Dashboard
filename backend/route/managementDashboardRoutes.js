const express = require('express');
const router = express.Router();
const { authenticate, isManagement } = require('../middleware/auth');
const { getKpi, getYieldTrendHandler, getUMPerformanceHandler } = require('../controller/managementDashboardController');

router.use(authenticate);

router.get('/kpi', isManagement, getKpi);
router.get('/yield-trend', isManagement, getYieldTrendHandler);
router.get('/um-performance', isManagement, getUMPerformanceHandler);

module.exports = router;