const express = require('express');
const router = express.Router();
const gerakanPanganMurahController = require('../controllers/gerakanPanganMurahController');

router.post('/', gerakanPanganMurahController.createGerakanPanganMurah);
router.get('/', gerakanPanganMurahController.getGerakanPanganMurah);
router.put('/:id', gerakanPanganMurahController.updateGerakanPanganMurah);
router.delete('/:id', gerakanPanganMurahController.deleteGerakanPanganMurah);

module.exports = router;
