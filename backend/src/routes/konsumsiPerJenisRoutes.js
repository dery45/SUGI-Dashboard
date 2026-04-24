const express = require('express');
const router = express.Router();
const konsumsiPerJenisController = require('../controllers/konsumsiPerJenisController');

router.post('/', konsumsiPerJenisController.createKonsumsiPerJenis);
router.get('/', konsumsiPerJenisController.getKonsumsiPerJenis);
router.put('/:id', konsumsiPerJenisController.updateKonsumsiPerJenis);
router.delete('/:id', konsumsiPerJenisController.deleteKonsumsiPerJenis);

module.exports = router;
