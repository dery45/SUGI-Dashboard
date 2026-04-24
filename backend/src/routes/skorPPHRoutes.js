const express = require('express');
const router = express.Router();
const skorPPHController = require('../controllers/skorPPHController');

router.post('/', skorPPHController.createSkorPPH);
router.get('/', skorPPHController.getSkorPPH);
router.put('/:id', skorPPHController.updateSkorPPH);
router.delete('/:id', skorPPHController.deleteSkorPPH);

module.exports = router;
