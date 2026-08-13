const express = require('express');
const router = express.Router();
const { authenticate, isSuperAdmin, isFarmerOwner } = require('../middleware/auth');
const ctrl = require('../controller/assignmentController');

router.use(authenticate);

router.get('/farmer-assignments', ctrl.listFarmerAssignments);
router.post('/farmer-assignments', isFarmerOwner, ctrl.createFarmerAssignment);
router.put('/farmer-assignments/:id', isFarmerOwner, ctrl.updateFarmerAssignment);
router.delete('/farmer-assignments/:id', isFarmerOwner, ctrl.removeFarmerAssignment);

router.get('/task-assignments', ctrl.listTaskAssignments);
router.post('/task-assignments', isFarmerOwner, ctrl.createTaskAssignment);
router.delete('/task-assignments/:id', isFarmerOwner, ctrl.removeTaskAssignment);

module.exports = router;