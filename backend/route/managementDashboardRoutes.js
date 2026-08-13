const express = require('express');
const router = express.Router();
const { authenticate, isManagement } = require('../middleware/auth');
const {
  getKpi,
  getYieldTrendHandler,
  getUMPerformanceHandler,
} = require('../controller/managementDashboardController');

/**
 * @swagger
 * /management/kpi:
 *   get:
 *     tags: [Management Dashboard]
 *     summary: "Management KPIs (isManagement: superadmin, farmer_owner)"
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: KPI cards
 *         content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 * /management/yield-trend:
 *   get:
 *     tags: [Management Dashboard]
 *     summary: Yield trend (isManagement)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Yield trend data
 *         content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 * /management/um-performance:
 *   get:
 *     tags: [Management Dashboard]
 *     summary: Unit management performance (isManagement)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: UM performance data
 *         content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 */

router.use(authenticate);

router.get('/kpi', isManagement, getKpi);
router.get('/yield-trend', isManagement, getYieldTrendHandler);
router.get('/um-performance', isManagement, getUMPerformanceHandler);

module.exports = router;
