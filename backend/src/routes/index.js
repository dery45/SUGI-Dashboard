const express = require('express');
const router = express.Router();

const farmerRoutes = require('./farmerRoutes');
const governmentRoutes = require('./governmentRoutes');
const sharedRoutes = require('./sharedRoutes');

router.use('/farmer', farmerRoutes);
router.use('/government', governmentRoutes);
router.use('/shared', sharedRoutes);

module.exports = router;
