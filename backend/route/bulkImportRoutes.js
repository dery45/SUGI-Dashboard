const express = require('express');
const router = express.Router();
const { authenticate, isGovernment } = require('../middleware/auth');
const bulkImportController = require('../controller/bulkImportController');

/**
 * @swagger
 * /bulk-import/{modelName}:
 *   post:
 *     tags: [Bulk Import]
 *     summary: "Bulk-import dataset docs by model name (isGovernment: superadmin, government)"
 *     description: Inserts an array of documents into the dataset matching `modelName` (e.g. `skor-pph`, `ketidakcukupan-nasional`, ...).
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: modelName, in: path, required: true, schema: { type: string }, description: Dataset model name / slug }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [data]
 *             properties:
 *               data: { type: array, items: { type: object, description: Document matching the dataset model } }
 *     responses:
 *       '200':
 *         description: Import summary (inserted/updated counts)
 *         content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } }
 *       '400': { $ref: '#/components/schemas/Error' }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 */

// FLAG: legacy bulkImportRoutes had NO auth guard; restrictive default applied (authenticate + isGovernment,
// consistent with the /api/master dataset endpoints it writes to)
router.use(authenticate);
router.post('/:modelName', isGovernment, bulkImportController.bulkImportData);

module.exports = router;
