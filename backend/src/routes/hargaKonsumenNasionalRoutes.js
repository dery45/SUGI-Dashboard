const express = require('express');
const router = express.Router();
const hargaKonsumenNasionalController = require('../controllers/hargaKonsumenNasionalController');

router.post('/', hargaKonsumenNasionalController.createHargaKonsumenNasional);
router.get('/', hargaKonsumenNasionalController.getHargaKonsumenNasional);
router.put('/:id', hargaKonsumenNasionalController.updateHargaKonsumenNasional);
router.delete('/:id', hargaKonsumenNasionalController.deleteHargaKonsumenNasional);

module.exports = router;
