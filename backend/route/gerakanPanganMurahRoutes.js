const createDatasetRoutes = require('./_datasetCrud.factory');
const gerakanPanganMurahController = require('../controller/gerakanPanganMurahController');

module.exports = createDatasetRoutes(gerakanPanganMurahController);
