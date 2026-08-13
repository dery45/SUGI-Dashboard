const KetidakcukupanNasional = require('../model/KetidakcukupanNasional');
const createDatasetController = require('./_datasetCrud.factory');

module.exports = createDatasetController(KetidakcukupanNasional);