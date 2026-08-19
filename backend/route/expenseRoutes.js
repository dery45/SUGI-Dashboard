const express = require('express');
const router = express.Router();
const { authenticate, isManagement } = require('../middleware/auth');
const { createExpense, listExpenses, updateExpense, deleteExpense } = require('../controller/expenseController');

/**
 * @swagger
 * /expenses:
 *   post:
 *     tags: [Expenses]
 *     summary: "Log an expense (isManagement: superadmin, farmer_owner)"
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [farm_id, category, amount_idr]
 *             properties:
 *               farm_id: { type: string }
 *               crop_cycle_id: { type: string }
 *               category: { type: string, enum: [Bibit, Pupuk, Pestisida, Tenaga Kerja, Transportasi, Peralatan, Sewa Lahan, Lainnya] }
 *               amount_idr: { type: number }
 *               description: { type: string }
 *               expense_date: { type: string, format: date }
 *               um_responsible_id: { type: string }
 *               receipt_ref: { type: string }
 *     responses:
 *       '201': { description: Created, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } } }
 *       '400': { $ref: '#/components/schemas/Error' }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 *   get:
 *     tags: [Expenses]
 *     summary: List expenses with optional filters (isManagement)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: farm_id, in: query, schema: { type: string } }
 *       - { name: category, in: query, schema: { type: string } }
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *     responses:
 *       '200':
 *         description: Expense list + breakdown
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { type: array, items: { type: object } }
 *                 total: { type: integer }
 *                 page: { type: integer }
 *                 breakdown: { type: object, description: Total cost by category }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 * /expenses/{id}:
 *   patch:
 *     tags: [Expenses]
 *     summary: Update an expense (isManagement)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category: { type: string, enum: [Bibit, Pupuk, Pestisida, Tenaga Kerja, Transportasi, Peralatan, Sewa Lahan, Lainnya] }
 *               amount_idr: { type: number }
 *               description: { type: string }
 *               expense_date: { type: string, format: date }
 *               receipt_ref: { type: string }
 *     responses:
 *       '200':
 *         description: Updated
 *         content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } }
 *       '400': { $ref: '#/components/schemas/Error' }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 *       '404': { $ref: '#/components/schemas/Error' }
 *   delete:
 *     tags: [Expenses]
 *     summary: Delete an expense (isManagement)
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

// POST /api/expenses — Log an expense
router.use(authenticate);
router.post('/', isManagement, createExpense);

// GET /api/expenses — List with optional filters
router.get('/', isManagement, listExpenses);

// PATCH /api/expenses/:id — Edit an expense entry
router.patch('/:id', isManagement, updateExpense);

// DELETE /api/expenses/:id — Delete an expense
router.delete('/:id', isManagement, deleteExpense);

module.exports = router;
