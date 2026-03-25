const express = require('express');
const router = express.Router();
const { isManagement } = require('../middlewares/rbacMiddleware');
const KPIService = require('../services/kpiService');

// GET /api/management/kpi — Full KPI overview (uses real aggregation pipelines)
router.get('/kpi', isManagement, async (req, res) => {
  try {
    const orgId = req.user.organization_id;
    if (!orgId) return res.status(400).json({ success: false, message: 'organization_id not found on user' });

    const data = await KPIService.calculateOrganizationOverview(orgId);
    if (!data.success) return res.status(500).json({ success: false, error: data.error });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/management/yield-trend?year=2026 — Monthly yield trend by actor type
router.get('/yield-trend', isManagement, async (req, res) => {
  try {
    const orgId = req.user.organization_id;
    const { year } = req.query;
    const trend = await KPIService.getYieldTrend(orgId, year);
    res.json({ success: true, data: trend });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/management/um-performance — UM leaderboard
router.get('/um-performance', isManagement, async (req, res) => {
  try {
    const orgId = req.user.organization_id;
    const data = await KPIService.getUMPerformance(orgId);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
