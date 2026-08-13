const express = require('express');
const router = express.Router();
const { authenticate, isGovernment } = require('../middleware/auth');
const { getInsights, getFarmerInsights } = require('../controller/insightController');

/**
 * @swagger
 * /insights:
 *   get:
 *     tags: [Insights]
 *     summary: Government insights / policy recommendations (isGovernment)
 *     description: superadmin or government. Reads `GovernmentInsight`; `?source=policy_recommendation` returns the latest policy recommendation.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: source, in: query, schema: { type: string }, description: sourceCollection filter, e.g. policy_recommendation }
 *     responses:
 *       '200':
 *         description: List of government insights
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { type: array, items: { type: object } }
 *       '401':
 *         $ref: '#/components/schemas/Error'
 *       '403':
 *         $ref: '#/components/schemas/Error'
 * /insights/farmer:
 *   get:
 *     tags: [Insights]
 *     summary: Farmer market intelligence (authenticate)
 *     description: All authenticated roles. Reads `FarmerInsight` (10-market-intelligence items).
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: List of farmer insights
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { type: array, items: { type: object } }
 *       '401':
 *         $ref: '#/components/schemas/Error'
 */

// /insights (policy recommendations) feeds the government dashboard (README:
// "Government Insights: Policy recommendations" + /government role). isGovernment.
// /insights/farmer (market intelligence, 10 items) feeds the all-authenticated
// farmer dashboard (README /farmer = All authenticated). authenticate only.
router.use(authenticate);

router.get('/', isGovernment, getInsights);
router.get('/farmer', getFarmerInsights);

module.exports = router;
