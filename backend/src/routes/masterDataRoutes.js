const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/masterDataController');

router.use(authenticate);

router.get('/farms/all', ctrl.getAllFarms);
router.get('/farms', ctrl.listFarms);
router.get('/farms/:id', ctrl.getFarm);
router.post('/farms', ctrl.createFarm);
router.put('/farms/:id', ctrl.updateFarm);
router.delete('/farms/:id', ctrl.deleteFarm);

router.get('/blocks/all', ctrl.getAllBlocks);
router.get('/blocks', ctrl.listBlocks);
router.get('/blocks/:id', ctrl.getBlock);
router.post('/blocks', ctrl.createBlock);
router.put('/blocks/:id', ctrl.updateBlock);
router.delete('/blocks/:id', ctrl.deleteBlock);

router.get('/crop-types/all', ctrl.getAllCropTypes);
router.get('/crop-types', ctrl.listCropTypes);
router.get('/crop-types/:id', ctrl.getCropType);
router.post('/crop-types', ctrl.createCropType);
router.put('/crop-types/:id', ctrl.updateCropType);
router.delete('/crop-types/:id', ctrl.deleteCropType);

router.get('/activity-types/all', ctrl.getAllActivityTypes);
router.get('/activity-types', ctrl.listActivityTypes);
router.get('/activity-types/:id', ctrl.getActivityType);
router.post('/activity-types', ctrl.createActivityType);
router.put('/activity-types/:id', ctrl.updateActivityType);
router.delete('/activity-types/:id', ctrl.deleteActivityType);

module.exports = router;
