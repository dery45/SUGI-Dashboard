const createDatasetRoutes = require('./_datasetCrud.factory');
const hargaKonsumenNasionalController = require('../controller/hargaKonsumenNasionalController');

module.exports = createDatasetRoutes(hargaKonsumenNasionalController);
