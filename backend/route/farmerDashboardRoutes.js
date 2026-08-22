const express = require('express');
const router = express.Router();
const { authenticate, isManagement } = require('../middleware/auth');
const { getFarmerDashboard: getFarmerDashboardV2 } = require('../controller/farmerDashboardController');

/**
 * @swagger
 * /dashboard/farmer/v2:
 *   get:
 *     tags: [Farmer Dashboard]
 *     summary: Farmer v2 dashboard (authenticate)
 *     description: All authenticated roles. KPIs, price analytics, market analytics, map, tables.
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
 *         description: Farmer dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { type: object, description: kpis, chart data, map data, tables }
 *       '401':
 *         $ref: '#/components/schemas/Error'
 *       '500':
 *         $ref: '#/components/schemas/Error'
 */

// farmer/v2: Owner + superadmin only (Petani uses lifecycle stages per Phase 4b policy change)
router.get('/farmer/v2', authenticate, isManagement, getFarmerDashboardV2);

module.exports = router;
