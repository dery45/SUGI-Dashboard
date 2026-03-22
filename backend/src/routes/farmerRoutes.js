const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmerController');

router.get('/prices/producer', farmerController.getProducerPrices);
router.get('/prices/variation', farmerController.getPriceVariation);

module.exports = router;
