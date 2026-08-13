const GerakanPanganMurah = require('../model/GerakanPanganMurah');
const createDatasetController = require('./_datasetCrud.factory');

module.exports = createDatasetController(GerakanPanganMurah);
