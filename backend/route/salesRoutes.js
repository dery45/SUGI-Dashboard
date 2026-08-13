const express = require('express');
const router = express.Router();
const { authenticate, isManagement } = require('../middleware/auth');
const { createSale, listSales, getSale, updateSale, deleteSale } = require('../controller/salesController');

/**
 * @swagger
 * /sales:
 *   post:
 *     tags: [Sales]
 *     summary: "Record a new sale (isManagement: superadmin, farmer_owner)"
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [farm_id, buyer_name, buyer_type, quantity_kg, price_per_kg]
 *             properties:
 *               crop_cycle_id: { type: string }
 *               farm_id: { type: string }
 *               buyer_name: { type: string }
 *               buyer_type: { type: string, enum: [Mill, Middleman, Direct, Government] }
 *               quantity_kg: { type: number }
 *               price_per_kg: { type: number }
 *               transport_notes: { type: string }
 *               invoice_ref: { type: string }
 *               sale_date: { type: string, format: date }
 *     responses:
 *       '201': { description: Created, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 *       '400': { $ref: '#/components/schemas/Error' }
 *   get:
 *     tags: [Sales]
 *     summary: List sales with optional filters (isManagement)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: cycle_id, in: query, schema: { type: string } }
 *       - { name: farm_id, in: query, schema: { type: string } }
 *       - { name: buyer_type, in: query, schema: { type: string, enum: [Mill, Middleman, Direct, Government] } }
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *     responses:
 *       '200':
 *         description: Sales list with totals
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { type: array, items: { type: object } }
 *                 total: { type: integer }
 *                 page: { type: integer }
 *                 totals: { type: object, description: totalKg, totalRevenue, avgPrice }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 * /sales/{id}:
 *   get:
 *     tags: [Sales]
 *     summary: Get a single sale (isManagement)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     responses:
 *       '200':
 *         description: Sale detail
 *         content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 *       '404': { $ref: '#/components/schemas/Error' }
 *   put:
 *     tags: [Sales]
 *     summary: Update a sale (isManagement)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               buyer_name: { type: string }
 *               buyer_type: { type: string, enum: [Mill, Middleman, Direct, Government] }
 *               quantity_kg: { type: number }
 *               price_per_kg: { type: number }
 *               transport_notes: { type: string }
 *               invoice_ref: { type: string }
 *               sale_date: { type: string, format: date }
 *     responses:
 *       '200':
 *         description: Updated
 *         content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } }
 *       '400': { $ref: '#/components/schemas/Error' }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 *       '404': { $ref: '#/components/schemas/Error' }
 *   delete:
 *     tags: [Sales]
 *     summary: Delete a sale (isManagement)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     responses:
 *       '200':
 *         description: Deleted
 *         content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 *       '404': { $ref: '#/components/schemas/Error' }
 */

// POST /api/sales — Record a new sale
router.use(authenticate);
router.post('/', isManagement, createSale);

// GET /api/sales — List sales with optional filters
router.get('/', isManagement, listSales);

// GET /api/sales/:id — Single sale
router.get('/:id', isManagement, getSale);

// PUT /api/sales/:id — Edit a sale entry
router.put('/:id', isManagement, updateSale);

// DELETE /api/sales/:id — Delete a sale
router.delete('/:id', isManagement, deleteSale);

module.exports = router;
