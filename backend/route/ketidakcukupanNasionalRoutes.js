const createDatasetRoutes = require('./_datasetCrud.factory');
const ketidakcukupanNasionalController = require('../controller/ketidakcukupanNasionalController');

module.exports = createDatasetRoutes(ketidakcukupanNasionalController);