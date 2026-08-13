const express = require('express');
const router = express.Router();

const managementDashboardRoutes = require('./managementDashboardRoutes');
const lifecycleRoutes = require('../../route/lifecycleRoutes');
const salesRoutes = require('../../route/salesRoutes');
const expenseRoutes = require('../../route/expenseRoutes');
const farmerManagementRoutes = require('../../route/farmerManagementRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const authRoutes = require('../../route/authRoutes');
const masterDataRoutes = require('../../route/masterDataFeatureRoutes');
const assignmentRoutes = require('../../route/assignmentRoutes');

const bulkImportRoutes = require('./bulkImportRoutes');
const settingsRoutes = require('../../route/settingsRoutes');
const filterRoutes = require('../../route/filterRoutes');
const insightRoutes = require('../../route/insightRoutes');
const chatbotInsightRoutes = require('./chatbotInsightRoutes');

router.use('/auth', authRoutes);
router.use('/master-data', masterDataRoutes);
router.use('/assignments', assignmentRoutes);

router.use('/bulk-import', bulkImportRoutes);
router.use('/management', managementDashboardRoutes);
router.use('/lifecycle', lifecycleRoutes);
router.use('/sales', salesRoutes);
router.use('/expenses', expenseRoutes);
router.use('/farmers', farmerManagementRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/settings', settingsRoutes);
router.use('/filters', filterRoutes);
router.use('/insights', insightRoutes);
router.use('/chatbot-insight', chatbotInsightRoutes);

module.exports = router;
