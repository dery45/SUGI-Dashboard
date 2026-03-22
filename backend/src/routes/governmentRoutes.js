const express = require('express');
const router = express.Router();
const governmentController = require('../controllers/governmentController');

router.get('/pou', governmentController.getPouData);
router.get('/consumption', governmentController.getConsumptionData);
router.get('/donations', governmentController.getDonationData);
router.get('/balance-projection', governmentController.getBalanceProjection);

module.exports = router;
