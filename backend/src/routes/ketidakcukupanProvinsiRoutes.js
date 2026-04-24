const express = require('express');
const router = express.Router();
const ketidakcukupanProvinsiController = require('../controllers/ketidakcukupanProvinsiController');

router.post('/', ketidakcukupanProvinsiController.createKetidakcukupanProvinsi);
router.get('/', ketidakcukupanProvinsiController.getKetidakcukupanProvinsi);
router.put('/:id', ketidakcukupanProvinsiController.updateKetidakcukupanProvinsi);
router.delete('/:id', ketidakcukupanProvinsiController.deleteKetidakcukupanProvinsi);

module.exports = router;
