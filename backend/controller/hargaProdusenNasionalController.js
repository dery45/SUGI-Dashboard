const HargaProdusenNasional = require('../model/HargaProdusenNasional');
const createDatasetController = require('./_datasetCrud.factory');

module.exports = createDatasetController(HargaProdusenNasional);