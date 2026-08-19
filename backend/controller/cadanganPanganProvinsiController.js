const CadanganPanganProvinsi = require('../model/CadanganPanganProvinsi');
const createDatasetController = require('./_datasetCrud.factory');

module.exports = createDatasetController(CadanganPanganProvinsi);
