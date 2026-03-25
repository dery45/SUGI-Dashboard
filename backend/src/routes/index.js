const express = require('express');
const router = express.Router();

const farmerRoutes = require('./farmerRoutes');
const governmentRoutes = require('./governmentRoutes');
const sharedRoutes = require('./sharedRoutes');
const managementDashboardRoutes = require('./managementDashboardRoutes');
const umRoutes = require('./umRoutes');
const lifecycleRoutes = require('./lifecycleRoutes');
const salesRoutes = require('./salesRoutes');
const expenseRoutes = require('./expenseRoutes');
const farmerManagementRoutes = require('./farmerManagementRoutes');

router.use('/farmer', farmerRoutes);
router.use('/government', governmentRoutes);
router.use('/shared', sharedRoutes);
router.use('/management', managementDashboardRoutes);
router.use('/um', umRoutes);
router.use('/lifecycle', lifecycleRoutes);
router.use('/sales', salesRoutes);
router.use('/expenses', expenseRoutes);
router.use('/farmers', farmerManagementRoutes);

module.exports = router;
