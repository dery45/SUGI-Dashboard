const express = require('express');
const router = express.Router();
const bulkImportController = require('../controllers/bulkImportController');

router.post('/:modelName', bulkImportController.bulkImportData);

module.exports = router;
