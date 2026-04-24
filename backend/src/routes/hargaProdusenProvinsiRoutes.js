const express = require('express');
const router = express.Router();
const hargaProdusenProvinsiController = require('../controllers/hargaProdusenProvinsiController');

router.post('/', hargaProdusenProvinsiController.createHargaProdusenProvinsi);
router.get('/', hargaProdusenProvinsiController.getHargaProdusenProvinsi);
router.put('/:id', hargaProdusenProvinsiController.updateHargaProdusenProvinsi);
router.delete('/:id', hargaProdusenProvinsiController.deleteHargaProdusenProvinsi);

module.exports = router;
