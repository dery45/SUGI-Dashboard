const express = require('express');
const router = express.Router();
const hargaProdusenNasionalController = require('../controllers/hargaProdusenNasionalController');

router.post('/', hargaProdusenNasionalController.createHargaProdusenNasional);
router.get('/', hargaProdusenNasionalController.getHargaProdusenNasional);
router.put('/:id', hargaProdusenNasionalController.updateHargaProdusenNasional);
router.delete('/:id', hargaProdusenNasionalController.deleteHargaProdusenNasional);

module.exports = router;
