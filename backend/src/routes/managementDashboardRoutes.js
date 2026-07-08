const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const { isManagement } = require('../middlewares/rbacMiddleware');
const KPIService = require('../services/kpiService');

router.use(authenticate);

router.get('/kpi', isManagement, async (req, res) => {
  try {
    const { farm_id, start_date, end_date } = req.query;
    const data = await KPIService.calculateOrganizationOverview({ farm_id, start_date, end_date });
    const alerts = await KPIService.generateAlerts({ farm_id });
    if (!data.success) return res.status(500).json({ success: false, error: data.error });
    res.json({ success: true, data: { ...data, alerts } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/yield-trend', isManagement, async (req, res) => {
  try {
    const { farm_id, year, start_date, end_date } = req.query;
    const trend = await KPIService.getYieldTrend({ farm_id, year, start_date, end_date });
    res.json({ success: true, data: trend });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/um-performance', isManagement, async (req, res) => {
  try {
    const data = await KPIService.getUMPerformance();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;