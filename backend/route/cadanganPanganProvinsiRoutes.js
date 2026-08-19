const createDatasetRoutes = require('./_datasetCrud.factory');
const cadanganPanganProvinsiController = require('../controller/cadanganPanganProvinsiController');

module.exports = createDatasetRoutes(cadanganPanganProvinsiController);
