const express = require('express');
const router = express.Router();
const proyeksiNeracaController = require('../controllers/proyeksiNeracaController');

router.post('/', proyeksiNeracaController.createProyeksiNeraca);
router.get('/', proyeksiNeracaController.getProyeksiNeraca);
router.put('/:id', proyeksiNeracaController.updateProyeksiNeraca);
router.delete('/:id', proyeksiNeracaController.deleteProyeksiNeraca);

module.exports = router;
