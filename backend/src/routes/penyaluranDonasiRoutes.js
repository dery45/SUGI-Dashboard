const express = require('express');
const router = express.Router();
const penyaluranDonasiController = require('../controllers/penyaluranDonasiController');

router.post('/', penyaluranDonasiController.createPenyaluranDonasi);
router.get('/', penyaluranDonasiController.getPenyaluranDonasi);
router.put('/:id', penyaluranDonasiController.updatePenyaluranDonasi);
router.delete('/:id', penyaluranDonasiController.deletePenyaluranDonasi);

module.exports = router;
