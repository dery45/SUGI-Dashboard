const express = require('express');
const router = express.Router();
const { authenticate, isManagement, isFarmerScoped } = require('../middleware/auth');
const { createExpense, listExpenses, updateExpense, deleteExpense } = require('../controller/expenseController');

/**
 * @swagger
 * /expenses:
 *   post:
 *     tags: [Expenses]
 *     summary: "Log an expense (superadmin, farmer_owner, or farmer with assignment)"
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
 *     summary: List expenses with optional filters (superadmin, farmer_owner, or farmer with assignment)
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
 *     summary: Update an expense (superadmin, farmer_owner, or farmer with assignment)
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
 *     summary: Delete an expense (superadmin, farmer_owner, or farmer with assignment)
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

// Access control: superadmin, farmer_owner, or farmer with assignment
const expenseAccess = async (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  if (['superadmin', 'farmer_owner'].includes(req.user.role)) return next();
  if (req.user.role === 'farmer') return isFarmerScoped(req, res, next);
  return res.status(403).json({ success: false, message: 'Akses ditolak' });
};

router.use(authenticate);
router.post('/', expenseAccess, createExpense);
router.get('/', expenseAccess, listExpenses);
router.patch('/:id', expenseAccess, updateExpense);
router.delete('/:id', expenseAccess, deleteExpense);

module.exports = router;
