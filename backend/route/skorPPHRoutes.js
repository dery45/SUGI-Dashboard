const createDatasetRoutes = require('./_datasetCrud.factory');
const skorPPHController = require('../controller/skorPPHController');

module.exports = createDatasetRoutes(skorPPHController);
