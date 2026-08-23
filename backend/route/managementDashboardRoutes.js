const express = require('express');
const router = express.Router();
const { authenticate, isManagement } = require('../middleware/auth');
const {
  getKpi,
  getYieldTrendHandler,
  getChartDataHandler,
  getUMPerformanceHandler,
  getBlocksByFarm,
  getCyclesByFarmBlock,
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
 * /management/blocks:
 *   get:
 *     tags: [Management Dashboard]
 *     summary: Blocks scoped to farm (for cascading filter)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: farm_id, in: query, schema: { type: string }, description: Farm ID to filter blocks }
 *     responses:
 *       '200':
 *         description: List of blocks
 *         content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: array, items: { type: object } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 * /management/cycles:
 *   get:
 *     tags: [Management Dashboard]
 *     summary: Crop cycles scoped to farm + block (for cascading filter)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: farm_id, in: query, schema: { type: string }, description: Farm ID }
 *       - { name: block, in: query, schema: { type: string }, description: Block ID }
 *     responses:
 *       '200':
 *         description: List of crop cycles
 *         content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: array, items: { type: object } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 * /management/chart-data:
 *   get:
 *     tags: [Management Dashboard]
 *     summary: All chart data for dashboard (status dist, produksi trend, rev vs exp, produksi per cycle, timeline, active cycles table, farm/block perf)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: farm_id, in: query, schema: { type: string }, description: Farm ID }
 *       - { name: block_id, in: query, schema: { type: string }, description: Block ID }
 *       - { name: cycle_id, in: query, schema: { type: string }, description: Cycle ID }
 *       - { name: start_date, in: query, schema: { type: string, format: date }, description: Start date }
 *       - { name: end_date, in: query, schema: { type: string, format: date }, description: End date }
 *       - { name: year, in: query, schema: { type: integer }, description: Year for trends }
 *     responses:
 *       '200':
 *         description: Chart data
 *         content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 */

router.use(authenticate);

router.get('/kpi', isManagement, getKpi);
router.get('/yield-trend', isManagement, getYieldTrendHandler);
router.get('/chart-data', isManagement, getChartDataHandler);
router.get('/um-performance', isManagement, getUMPerformanceHandler);
router.get('/blocks', isManagement, getBlocksByFarm);
router.get('/cycles', isManagement, getCyclesByFarmBlock);

module.exports = router;
