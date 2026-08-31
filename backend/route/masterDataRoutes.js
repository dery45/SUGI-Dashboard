const express = require('express');
const router = express.Router();
const { authenticate, isManagement, authorize } = require('../middleware/auth');
const ctrl = require('../controller/masterDataController');
const varietyCtrl = require('../controller/cropVarietyController');

router.use(authenticate);

const isManagementOrFarmer = authorize('superadmin', 'farmer_owner', 'farmer');
const isSuperAdminOnly = authorize('superadmin');

// Farms - superadmin-only (Owner must not access; sidebar also hides for Owner)
router.get('/farms/all', isSuperAdminOnly, ctrl.getAllFarms);
router.get('/farms', isSuperAdminOnly, ctrl.listFarms);
router.get('/farms/:id', isSuperAdminOnly, ctrl.getFarm);
router.post('/farms', isSuperAdminOnly, ctrl.createFarm);
router.put('/farms/:id', isSuperAdminOnly, ctrl.updateFarm);
router.delete('/farms/:id', isSuperAdminOnly, ctrl.deleteFarm);

// Blocks - management only
router.get('/blocks/all', isManagement, ctrl.getAllBlocks);
router.get('/blocks', isManagement, ctrl.listBlocks);
router.get('/blocks/:id', isManagement, ctrl.getBlock);
router.post('/blocks', isManagement, ctrl.createBlock);
router.put('/blocks/:id', isManagement, ctrl.updateBlock);
router.delete('/blocks/:id', isManagement, ctrl.deleteBlock);

// Crop Types - read for farmer + management, write for management only (simplified: name+category+status only)
router.get('/crop-types/all', isManagementOrFarmer, ctrl.getAllCropTypes);
router.get('/crop-types', isManagementOrFarmer, ctrl.listCropTypes);
router.get('/crop-types/:id', isManagementOrFarmer, ctrl.getCropType);
router.post('/crop-types', isManagement, ctrl.createCropType);
router.put('/crop-types/:id', isManagement, ctrl.updateCropType);
router.delete('/crop-types/:id', isManagement, ctrl.deleteCropType);

// Activity Types - 3 fixed categories: Lainnya, Pemupukan - Perawatan - Penyemprotan, Panen
router.get('/activity-types/all', isManagementOrFarmer, ctrl.getAllActivityTypes);
router.get('/activity-types', isManagementOrFarmer, ctrl.listActivityTypes);
router.get('/activity-types/:id', isManagementOrFarmer, ctrl.getActivityType);
router.post('/activity-types', isManagement, ctrl.createActivityType);
router.put('/activity-types/:id', isManagement, ctrl.updateActivityType);
router.delete('/activity-types/:id', isManagement, ctrl.deleteActivityType);

// Units - foundational, used by variety/fertilizer/nutrient/medicine
router.get('/units/all', isManagementOrFarmer, ctrl.getAllUnits);
router.get('/units', isManagementOrFarmer, ctrl.listUnits);
router.get('/units/:id', isManagementOrFarmer, ctrl.getUnit);
router.post('/units', isManagement, ctrl.createUnit);
router.put('/units/:id', isManagement, ctrl.updateUnit);
router.delete('/units/:id', isManagement, ctrl.deleteUnit);

// Crop Varieties - dedicated controller (embedded Grades)
router.get('/crop-varieties/all', isManagementOrFarmer, varietyCtrl.getAll);
router.get('/crop-varieties', isManagementOrFarmer, varietyCtrl.list);
router.get('/crop-varieties/:id', isManagementOrFarmer, varietyCtrl.getById);
router.post('/crop-varieties', isManagement, varietyCtrl.create);
router.put('/crop-varieties/:id', isManagement, varietyCtrl.update);
router.delete('/crop-varieties/:id', isManagement, varietyCtrl.remove);
// Grade sub-resource
router.post('/crop-varieties/:id/grades', isManagement, varietyCtrl.addGrade);
router.put('/crop-varieties/:id/grades/:gradeId', isManagement, varietyCtrl.updateGrade);
router.delete('/crop-varieties/:id/grades/:gradeId', isManagement, varietyCtrl.deleteGrade);

// Fertilizers
router.get('/fertilizers/all', isManagementOrFarmer, ctrl.getAllFertilizers);
router.get('/fertilizers', isManagementOrFarmer, ctrl.listFertilizers);
router.get('/fertilizers/:id', isManagementOrFarmer, ctrl.getFertilizer);
router.post('/fertilizers', isManagement, ctrl.createFertilizer);
router.put('/fertilizers/:id', isManagement, ctrl.updateFertilizer);
router.delete('/fertilizers/:id', isManagement, ctrl.deleteFertilizer);

// Nutrients
router.get('/nutrients/all', isManagementOrFarmer, ctrl.getAllNutrients);
router.get('/nutrients', isManagementOrFarmer, ctrl.listNutrients);
router.get('/nutrients/:id', isManagementOrFarmer, ctrl.getNutrient);
router.post('/nutrients', isManagement, ctrl.createNutrient);
router.put('/nutrients/:id', isManagement, ctrl.updateNutrient);
router.delete('/nutrients/:id', isManagement, ctrl.deleteNutrient);

// Medicines
router.get('/medicines/all', isManagementOrFarmer, ctrl.getAllMedicines);
router.get('/medicines', isManagementOrFarmer, ctrl.listMedicines);
router.get('/medicines/:id', isManagementOrFarmer, ctrl.getMedicine);
router.post('/medicines', isManagement, ctrl.createMedicine);
router.put('/medicines/:id', isManagement, ctrl.updateMedicine);
router.delete('/medicines/:id', isManagement, ctrl.deleteMedicine);

module.exports = router;
