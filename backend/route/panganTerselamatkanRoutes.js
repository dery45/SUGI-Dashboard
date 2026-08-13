const createDatasetRoutes = require('./_datasetCrud.factory');
const panganTerselamatkanController = require('../controller/panganTerselamatkanController');

module.exports = createDatasetRoutes(panganTerselamatkanController);