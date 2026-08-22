const express = require('express');
const router = express.Router();
const { authenticate, isFarmerScoped } = require('../middleware/auth');
const { createSale, listSales, getSale, updateSale, deleteSale } = require('../controller/salesController');

router.use(authenticate);

// Single combined guard — role-direct
const salesAccess = async (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  if (['superadmin', 'farmer_owner'].includes(req.user.role)) return next();
  if (req.user.role === 'farmer') return isFarmerScoped(req, res, next);
  return res.status(403).json({ success: false, message: 'Akses ditolak. Penjualan hanya untuk Owner dan Petani dengan akses Penjualan' });
};

router.post('/', salesAccess, createSale);
router.get('/', salesAccess, listSales);
router.get('/:id', salesAccess, getSale);
router.put('/:id', salesAccess, updateSale);
router.delete('/:id', salesAccess, deleteSale);

module.exports = router;
