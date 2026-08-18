/**
 * @swagger
 * tags:
 *   - name: Lifecycle
 *     description: "Land, plantings, activities, harvests (isManagement: superadmin, farmer_owner)"
 * components:
 *   schemas:
 *     LifecycleEntity:
 *       type: object
 *       description: Record shape varies per lifecycle sub-resource (land/planting/activity/harvest).
 *       properties:
 *         _id: { type: string }
 *         createdBy: { type: string }
 * /lifecycle/land:
 *   get:
 *     tags: [Lifecycle]
 *     summary: List land records
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200': { description: List of land records, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: array, items: { type: object } } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 *   post:
 *     tags: [Lifecycle]
 *     summary: Create a land record
 *     security: [{ bearerAuth: [] }]
 *     requestBody: { required: true, content: { application/json: { schema: { type: object, required: [farm_id, land_opening_date], properties: { farm_id: { type: string }, land_opening_date: { type: string, format: date }, crop_cycle_status: { type: string } } } } } }
 *     responses:
 *       '201': { description: Created, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 * /lifecycle/land/{id}:
 *   put:
 *     tags: [Lifecycle]
 *     summary: Update a land record
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     requestBody: { required: true, content: { application/json: { schema: { type: object } } } }
 *     responses:
 *       '200': { description: Updated, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 *   delete:
 *     tags: [Lifecycle]
 *     summary: Delete a land record
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     responses:
 *       '200': { description: Deleted, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 * /lifecycle/plantings:
 *   get:
 *     tags: [Lifecycle]
 *     summary: List plantings
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200': { description: List of plantings, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: array, items: { type: object } } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 *   post:
 *     tags: [Lifecycle]
 *     summary: Create a planting
 *     security: [{ bearerAuth: [] }]
 *     requestBody: { required: true, content: { application/json: { schema: { type: object, required: [farm_id, crop_type], properties: { farm_id: { type: string }, crop_type: { type: string }, status: { type: string, enum: [Planned, Land_Preparation, Planted, Maintenance, In_Progress, Completed, Cancelled] } } } } } }
 *     responses:
 *       '201': { description: Created, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 * /lifecycle/plantings/{id}:
 *   put:
 *     tags: [Lifecycle]
 *     summary: Update a planting
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     requestBody: { required: true, content: { application/json: { schema: { type: object } } } }
 *     responses:
 *       '200': { description: Updated, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 *   delete:
 *     tags: [Lifecycle]
 *     summary: Delete a planting
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     responses:
 *       '200': { description: Deleted, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 * /lifecycle/activities:
 *   get:
 *     tags: [Lifecycle]
 *     summary: List activities
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200': { description: List of activities, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: array, items: { type: object } } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 *   post:
 *     tags: [Lifecycle]
 *     summary: Create an activity
 *     security: [{ bearerAuth: [] }]
 *     requestBody: { required: true, content: { application/json: { schema: { type: object, required: [farm_id, date], properties: { farm_id: { type: string }, date: { type: string, format: date }, activity_type: { type: string }, notes: { type: string } } } } } }
 *     responses:
 *       '201': { description: Created, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 * /lifecycle/activities/{id}:
 *   put:
 *     tags: [Lifecycle]
 *     summary: Update an activity
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     requestBody: { required: true, content: { application/json: { schema: { type: object } } } }
 *     responses:
 *       '200': { description: Updated, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 *   delete:
 *     tags: [Lifecycle]
 *     summary: Delete an activity
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     responses:
 *       '200': { description: Deleted, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 * /lifecycle/harvests:
 *   get:
 *     tags: [Lifecycle]
 *     summary: List harvests
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200': { description: List of harvests, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: array, items: { type: object } } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 *   post:
 *     tags: [Lifecycle]
 *     summary: Create a harvest
 *     security: [{ bearerAuth: [] }]
 *     requestBody: { required: true, content: { application/json: { schema: { type: object, required: [farm_id, harvest_opening_date], properties: { farm_id: { type: string }, harvest_opening_date: { type: string, format: date }, harvest_closing_date: { type: string, format: date }, total_yield_kg: { type: number } } } } } }
 *     responses:
 *       '201': { description: Created, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 * /lifecycle/harvests/{id}:
 *   put:
 *     tags: [Lifecycle]
 *     summary: Update a harvest
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     requestBody: { required: true, content: { application/json: { schema: { type: object } } } }
 *     responses:
 *       '200': { description: Updated, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 *   delete:
 *     tags: [Lifecycle]
 *     summary: Delete a harvest
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     responses:
 *       '200': { description: Deleted, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 */
const express = require('express');
const router = express.Router();
const { authenticate, isManagement } = require('../middleware/auth');
const ctrl = require('../controller/lifecycleController');

router.use(authenticate);

router.get('/cycles/eligible', isManagement, ctrl.listEligibleCycles);

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
