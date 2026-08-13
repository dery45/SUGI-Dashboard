const express = require('express');
const router = express.Router();
const { authenticate, isManagement } = require('../middleware/auth');
const { createSale, listSales, getSale, updateSale, deleteSale } = require('../controller/salesController');

router.use(authenticate);

// POST /api/sales — Record a new sale
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