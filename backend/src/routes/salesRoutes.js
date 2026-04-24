const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const { isManagement } = require('../middlewares/rbacMiddleware');

// POST /api/sales — Record a new sale
router.post('/', isManagement, async (req, res) => {
  try {
    const { crop_cycle_id, farm_id, buyer_name, buyer_type, quantity_kg, price_per_kg, transport_notes, invoice_ref, sale_date } = req.body;

    if (!crop_cycle_id || !farm_id || !buyer_name || !buyer_type || !quantity_kg || !price_per_kg) {
      return res.status(400).json({ success: false, message: 'Field wajib: crop_cycle_id, farm_id, buyer_name, buyer_type, quantity_kg, price_per_kg' });
    }

    const sale = new Sale({
      crop_cycle_id,
      farm_id,
      organization_id: req.user.organization_id,
      buyer_name,
      buyer_type,
      quantity_kg,
      price_per_kg,
      transport_notes,
      invoice_ref,
      sale_date: sale_date || new Date(),
      createdBy: req.user._id,
    });

    await sale.save();
    res.status(201).json({ success: true, data: sale });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /api/sales — List sales with optional filters
router.get('/', isManagement, async (req, res) => {
  try {
    const { cycle_id, farm_id, buyer_type, page = 1, limit = 20 } = req.query;
    const query = { organization_id: req.user.organization_id };

    if (cycle_id) query.crop_cycle_id = cycle_id;
    if (farm_id) query.farm_id = farm_id;
    if (buyer_type) query.buyer_type = buyer_type;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [sales, total] = await Promise.all([
      Sale.find(query).populate('farm_id', 'name').populate('crop_cycle_id', 'crop_type status').sort({ sale_date: -1 }).skip(skip).limit(parseInt(limit)),
      Sale.countDocuments(query)
    ]);

    // Aggregate totals
    const totals = await Sale.aggregate([
      { $match: query },
      { $group: { _id: null, totalKg: { $sum: '$quantity_kg' }, totalRevenue: { $sum: '$total_revenue' }, avgPrice: { $avg: '$price_per_kg' } } }
    ]);

    res.json({ success: true, data: sales, total, page: parseInt(page), totals: totals[0] || { totalKg: 0, totalRevenue: 0, avgPrice: 0 } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/sales/:id — Single sale
router.get('/:id', isManagement, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).populate('farm_id', 'name').populate('createdBy', 'name');
    if (!sale) return res.status(404).json({ success: false, message: 'Data penjualan tidak ditemukan' });
    res.json({ success: true, data: sale });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/sales/:id — Edit a sale entry
router.put('/:id', isManagement, async (req, res) => {
  try {
    const sale = await Sale.findOneAndUpdate(
      { _id: req.params.id, organization_id: req.user.organization_id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });
    res.json({ success: true, data: sale });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/sales/:id — Delete a sale
router.delete('/:id', isManagement, async (req, res) => {
  try {
    const sale = await Sale.findOneAndDelete({ _id: req.params.id, organization_id: req.user.organization_id });
    if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
