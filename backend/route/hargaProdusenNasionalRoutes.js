const createDatasetRoutes = require('./_datasetCrud.factory');
const hargaProdusenNasionalController = require('../controller/hargaProdusenNasionalController');

module.exports = createDatasetRoutes(hargaProdusenNasionalController);