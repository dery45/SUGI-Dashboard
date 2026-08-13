const createDatasetRoutes = require('./_datasetCrud.factory');
const hargaKonsumenProvinsiController = require('../controller/hargaKonsumenProvinsiController');

module.exports = createDatasetRoutes(hargaKonsumenProvinsiController);