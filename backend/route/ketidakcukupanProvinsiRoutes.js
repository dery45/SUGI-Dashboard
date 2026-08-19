const createDatasetRoutes = require('./_datasetCrud.factory');
const ketidakcukupanProvinsiController = require('../controller/ketidakcukupanProvinsiController');

module.exports = createDatasetRoutes(ketidakcukupanProvinsiController);
