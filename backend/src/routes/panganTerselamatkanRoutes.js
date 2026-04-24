const express = require('express');
const router = express.Router();
const panganTerselamatkanController = require('../controllers/panganTerselamatkanController');

router.post('/', panganTerselamatkanController.createPanganTerselamatkan);
router.get('/', panganTerselamatkanController.getPanganTerselamatkan);
router.put('/:id', panganTerselamatkanController.updatePanganTerselamatkan);
router.delete('/:id', panganTerselamatkanController.deletePanganTerselamatkan);

module.exports = router;
