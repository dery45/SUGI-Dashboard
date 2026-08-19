const PenyaluranDonasi = require('../model/PenyaluranDonasi');
const createDatasetController = require('./_datasetCrud.factory');

module.exports = createDatasetController(PenyaluranDonasi);
