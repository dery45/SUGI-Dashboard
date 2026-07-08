const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/settingsController');

router.use(authenticate);

router.get('/profile', ctrl.getProfile);
router.put('/profile', ctrl.updateProfile);
router.put('/change-password', ctrl.changePassword);
router.post('/assign-farm', ctrl.updateAssignedFarm);

module.exports = router;
