const createDatasetRoutes = require('./_datasetCrud.factory');
const hargaProdusenProvinsiController = require('../controller/hargaProdusenProvinsiController');

module.exports = createDatasetRoutes(hargaProdusenProvinsiController);
