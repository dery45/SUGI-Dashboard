const express = require('express');
const router = express.Router();
const { authenticate, isManagement, isFarmerScoped } = require('../middleware/auth');
const { createSale, listSales, getSale, updateSale, deleteSale } = require('../controller/salesController');

router.use(authenticate);

// Combine isManagement OR isFarmerScoped for sales routes
const salesAccess = (req, res, next) => {
  isManagement(req, res, (err) => {
    if (!err) return next();
    isFarmerScoped(req, res, next);
  });
};

router.post('/', salesAccess, createSale);
router.get('/', salesAccess, listSales);
router.get('/:id', salesAccess, getSale);
router.put('/:id', salesAccess, updateSale);
router.delete('/:id', salesAccess, deleteSale);

module.exports = router;
