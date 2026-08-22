const express = require('express');
const router = express.Router();
const { authenticate, isFarmerOwner } = require('../middleware/auth');
const ctrl = require('../controller/assignmentController');

/**
 * @swagger
 * /assignments/farmer-assignments:
 *   get:
 *     tags: [Assignments]
 *     summary: List farmer assignments (authenticate)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: List of farmer assignments
 *         content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: array, items: { type: object } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *   post:
 *     tags: [Assignments]
 *     summary: "Create a farmer assignment (isFarmerOwner: superadmin, farmer_owner)"
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               farmer: { type: string, description: farmer user id }
 *               farm: { type: string }
 *               block: { type: string }
 *               crop_cycle: { type: string }
 *     responses:
 *       '201': { description: Created, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 * /assignments/farmer-assignments/{id}:
 *   put:
 *     tags: [Assignments]
 *     summary: Update a farmer assignment (isFarmerOwner)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               farmer: { type: string }
 *               farm: { type: string }
 *               block: { type: string }
 *               crop_cycle: { type: string }
 *     responses:
 *       '200': { description: Updated, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 *       '404': { $ref: '#/components/schemas/Error' }
 *   delete:
 *     tags: [Assignments]
 *     summary: Delete a farmer assignment (isFarmerOwner)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     responses:
 *       '200': { description: Deleted, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 *       '404': { $ref: '#/components/schemas/Error' }
 * /assignments/task-assignments:
 *   get:
 *     tags: [Assignments]
 *     summary: List task assignments (authenticate)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: List of task assignments
 *         content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: array, items: { type: object } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *   post:
 *     tags: [Assignments]
 *     summary: Create a task assignment (isFarmerOwner)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               farmer: { type: string }
 *               task: { type: string }
 *               due_date: { type: string, format: date }
 *     responses:
 *       '201': { description: Created, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 * /assignments/task-assignments/{id}:
 *   delete:
 *     tags: [Assignments]
 *     summary: Delete a task assignment (isFarmerOwner)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     responses:
 *       '200': { description: Deleted, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 *       '404': { $ref: '#/components/schemas/Error' }
 */

router.use(authenticate);

// Penugasan viewer: Owner + Petani + superadmin — NOT Government (Phase 4b Task 4)
const isPenugasanViewer = (req, res, next) => {
  if (['superadmin', 'farmer_owner', 'farmer'].includes(req.user?.role)) return next();
  return res.status(403).json({ success: false, message: 'Akses ditolak. Penugasan hanya untuk Owner dan Petani yang ditugaskan' });
};

router.get('/farmer-assignments', isPenugasanViewer, ctrl.listFarmerAssignments);
router.post('/farmer-assignments', isFarmerOwner, ctrl.createFarmerAssignment);
router.put('/farmer-assignments/:id', isFarmerOwner, ctrl.updateFarmerAssignment);
router.delete('/farmer-assignments/:id', isFarmerOwner, ctrl.removeFarmerAssignment);

router.get('/task-assignments', isPenugasanViewer, ctrl.listTaskAssignments);
router.post('/task-assignments', isFarmerOwner, ctrl.createTaskAssignment);
router.delete('/task-assignments/:id', isFarmerOwner, ctrl.removeTaskAssignment);

module.exports = router;
