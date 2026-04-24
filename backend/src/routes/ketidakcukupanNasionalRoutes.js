const express = require('express');
const router = express.Router();
const ketidakcukupanNasionalController = require('../controllers/ketidakcukupanNasionalController');

router.post('/', ketidakcukupanNasionalController.createKetidakcukupanNasional);
router.get('/', ketidakcukupanNasionalController.getKetidakcukupanNasional);
router.put('/:id', ketidakcukupanNasionalController.updateKetidakcukupanNasional);
router.delete('/:id', ketidakcukupanNasionalController.deleteKetidakcukupanNasional);

module.exports = router;
