const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { isManagement } = require('../middlewares/rbacMiddleware');

// POST /api/expenses — Log an expense
router.post('/', isManagement, async (req, res) => {
  try {
    const { farm_id, crop_cycle_id, category, amount_idr, description, expense_date, um_responsible_id, receipt_ref } = req.body;

    if (!farm_id || !category || !amount_idr) {
      return res.status(400).json({ success: false, message: 'Field wajib: farm_id, category, amount_idr' });
    }

    const expense = new Expense({
      farm_id,
      crop_cycle_id,
      organization_id: req.user.organization_id,
      category,
      amount_idr,
      description,
      expense_date: expense_date || new Date(),
      um_responsible_id,
      receipt_ref,
      createdBy: req.user._id,
    });

    await expense.save();
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /api/expenses — List with optional filters
router.get('/', isManagement, async (req, res) => {
  try {
    const { farm_id, category, page = 1, limit = 20 } = req.query;
    const query = { organization_id: req.user.organization_id };

    if (farm_id) query.farm_id = farm_id;
    if (category) query.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [expenses, total] = await Promise.all([
      Expense.find(query).populate('farm_id', 'name').sort({ expense_date: -1 }).skip(skip).limit(parseInt(limit)),
      Expense.countDocuments(query)
    ]);

    // Aggregate total cost by category
    const breakdown = await Expense.aggregate([
      { $match: query },
      { $group: { _id: '$category', totalAmount: { $sum: '$amount_idr' }, count: { $sum: 1 } } },
      { $sort: { totalAmount: -1 } }
    ]);

    res.json({ success: true, data: expenses, total, page: parseInt(page), breakdown });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/expenses/:id — Edit an expense entry
router.patch('/:id', isManagement, async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, organization_id: req.user.organization_id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ success: false, message: 'Pengeluaran tidak ditemukan' });
    res.json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/expenses/:id — Delete an expense
router.delete('/:id', isManagement, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, organization_id: req.user.organization_id });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
