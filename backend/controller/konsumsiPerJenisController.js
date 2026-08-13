const KonsumsiPerJenis = require('../model/KonsumsiPerJenis');
const createDatasetController = require('./_datasetCrud.factory');

module.exports = createDatasetController(KonsumsiPerJenis);
