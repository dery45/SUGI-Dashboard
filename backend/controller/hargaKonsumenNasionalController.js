const HargaKonsumenNasional = require('../model/HargaKonsumenNasional');
const createDatasetController = require('./_datasetCrud.factory');

module.exports = createDatasetController(HargaKonsumenNasional);
