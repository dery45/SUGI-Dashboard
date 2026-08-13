const express = require('express');
const router = express.Router();
const { authenticate, isGovernment } = require('../middleware/auth');
const bulkImportController = require('../controller/bulkImportController');

// FLAG: legacy bulkImportRoutes had NO auth guard; restrictive default applied (authenticate + isGovernment,
// consistent with the /api/master dataset endpoints it writes to)
router.use(authenticate);
router.post('/:modelName', isGovernment, bulkImportController.bulkImportData);

module.exports = router;