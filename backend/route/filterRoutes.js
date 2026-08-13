const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getFilterOptions } = require('../controller/filterController');

/**
 * @swagger
 * /filters:
 *   get:
 *     tags: [Filters]
 *     summary: Dashboard filter options (years, months, commodities, provinces)
 *     description: Any authenticated role. Feeds year/month/commodity/province dropdowns.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Filter options
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     years: { type: array, items: { type: string } }
 *                     months: { type: array, items: { type: string } }
 *                     commodities: { type: array, items: { type: string } }
 *                     provinces: { type: array, items: { type: string } }
 *       '401':
 *         $ref: '#/components/schemas/Error'
 */
router.get('/', authenticate, getFilterOptions);

module.exports = router;