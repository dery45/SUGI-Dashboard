const express = require('express');
const router = express.Router();
const { authenticate, isGovernment } = require('../middleware/auth');
const { getGovernmentDashboard: getGovtDashboardV2 } = require('../controller/govtDashboardController');

/**
 * @swagger
 * /dashboard/govt:
 *   get:
 *     tags: [Government Dashboard]
 *     summary: Government v2 dashboard (isGovernment)
 *     description: superadmin or government. KPIs, trends, rankings, map, tables.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: year, in: query, schema: { type: string }, description: Filter by year ('all' for all) }
 *       - { name: month, in: query, schema: { type: string }, description: Filter by month ('all' for all) }
 *       - { name: commodity, in: query, schema: { type: string }, description: Filter by commodity ('all' for all) }
 *       - { name: province, in: query, schema: { type: string }, description: Filter by province ('all' for all) }
 *       - { name: page, in: query, schema: { type: integer }, description: Page number }
 *       - { name: limit, in: query, schema: { type: integer, maximum: 100 }, description: Items per page }
 *     responses:
 *       '200':
 *         description: Government dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { type: object, description: kpis, chart data, map data, tables }
 *       '401':
 *         $ref: '#/components/schemas/Error'
 *       '403':
 *         $ref: '#/components/schemas/Error'
 *       '500':
 *         $ref: '#/components/schemas/Error'
 */

// govt: isGovernment (README `/government` = superadmin, government)
router.get('/govt', authenticate, isGovernment, getGovtDashboardV2);

module.exports = router;