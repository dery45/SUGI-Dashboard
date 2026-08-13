const ProyeksiNeraca = require('../model/ProyeksiNeraca');
const createDatasetController = require('./_datasetCrud.factory');

module.exports = createDatasetController(ProyeksiNeraca);