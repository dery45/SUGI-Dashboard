const express = require('express');
const router = express.Router();
const sharedController = require('../controllers/sharedController');

router.get('/prices/consumer', sharedController.getConsumerPrices);

module.exports = router;
