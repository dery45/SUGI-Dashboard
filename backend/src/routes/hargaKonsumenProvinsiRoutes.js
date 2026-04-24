const express = require('express');
const router = express.Router();
const hargaKonsumenProvinsiController = require('../controllers/hargaKonsumenProvinsiController');

router.post('/', hargaKonsumenProvinsiController.createHargaKonsumenProvinsi);
router.get('/', hargaKonsumenProvinsiController.getHargaKonsumenProvinsi);
router.put('/:id', hargaKonsumenProvinsiController.updateHargaKonsumenProvinsi);
router.delete('/:id', hargaKonsumenProvinsiController.deleteHargaKonsumenProvinsi);

module.exports = router;
