const HargaKonsumenProvinsi = require('../model/HargaKonsumenProvinsi');
const createDatasetController = require('./_datasetCrud.factory');

module.exports = createDatasetController(HargaKonsumenProvinsi);
