const express = require('express');
const router = express.Router();
const { authenticate, isManagement } = require('../middleware/auth');
const ctrl = require('../controller/lifecycleController');

router.use(authenticate);

router.get('/land', isManagement, ctrl.listLand);
router.post('/land', isManagement, ctrl.createLand);
router.put('/land/:id', isManagement, ctrl.updateLand);
router.delete('/land/:id', isManagement, ctrl.deleteLand);

router.get('/plantings', isManagement, ctrl.listPlantings);
router.post('/plantings', isManagement, ctrl.createPlanting);
router.put('/plantings/:id', isManagement, ctrl.updatePlanting);
router.delete('/plantings/:id', isManagement, ctrl.deletePlanting);

router.get('/activities', isManagement, ctrl.listActivities);
router.post('/activities', isManagement, ctrl.createActivity);
router.put('/activities/:id', isManagement, ctrl.updateActivity);
router.delete('/activities/:id', isManagement, ctrl.deleteActivity);

router.get('/harvests', isManagement, ctrl.listHarvests);
router.post('/harvests', isManagement, ctrl.createHarvest);
router.put('/harvests/:id', isManagement, ctrl.updateHarvest);
router.delete('/harvests/:id', isManagement, ctrl.deleteHarvest);

module.exports = router;