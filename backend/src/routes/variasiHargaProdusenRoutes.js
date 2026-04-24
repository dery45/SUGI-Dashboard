const express = require('express');
const router = express.Router();
const variasiHargaProdusenController = require('../controllers/variasiHargaProdusenController');

router.post('/', variasiHargaProdusenController.createVariasiHargaProdusen);
router.get('/', variasiHargaProdusenController.getVariasiHargaProdusen);
router.put('/:id', variasiHargaProdusenController.updateVariasiHargaProdusen);
router.delete('/:id', variasiHargaProdusenController.deleteVariasiHargaProdusen);

module.exports = router;
