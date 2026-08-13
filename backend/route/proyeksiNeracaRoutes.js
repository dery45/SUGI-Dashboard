const createDatasetRoutes = require('./_datasetCrud.factory');
const proyeksiNeracaController = require('../controller/proyeksiNeracaController');

module.exports = createDatasetRoutes(proyeksiNeracaController);