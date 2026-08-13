const createDatasetRoutes = require('./_datasetCrud.factory');
const penyaluranDonasiController = require('../controller/penyaluranDonasiController');

module.exports = createDatasetRoutes(penyaluranDonasiController);