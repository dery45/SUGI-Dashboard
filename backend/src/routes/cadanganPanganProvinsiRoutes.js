const express = require('express');
const router = express.Router();
const cadanganPanganProvinsiController = require('../controllers/cadanganPanganProvinsiController');

router.post('/', cadanganPanganProvinsiController.createCadanganPanganProvinsi);
router.get('/', cadanganPanganProvinsiController.getCadanganPanganProvinsi);
router.put('/:id', cadanganPanganProvinsiController.updateCadanganPanganProvinsi);
router.delete('/:id', cadanganPanganProvinsiController.deleteCadanganPanganProvinsi);

module.exports = router;
