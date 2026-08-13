const express = require('express');
const router = express.Router();
const { authenticate, isManagement } = require('../middleware/auth');
const { createExpense, listExpenses, updateExpense, deleteExpense } = require('../controller/expenseController');

router.use(authenticate);

// POST /api/expenses — Log an expense
router.post('/', isManagement, createExpense);

// GET /api/expenses — List with optional filters
router.get('/', isManagement, listExpenses);

// PATCH /api/expenses/:id — Edit an expense entry
router.patch('/:id', isManagement, updateExpense);

// DELETE /api/expenses/:id — Delete an expense
router.delete('/:id', isManagement, deleteExpense);

module.exports = router;