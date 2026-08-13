const createDatasetRoutes = require('./_datasetCrud.factory');
const konsumsiPerJenisController = require('../controller/konsumsiPerJenisController');

module.exports = createDatasetRoutes(konsumsiPerJenisController);
