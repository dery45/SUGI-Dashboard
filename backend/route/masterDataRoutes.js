const express = require('express');
const router = express.Router();
const { authenticate, isManagement } = require('../middleware/auth');
const ctrl = require('../controller/masterDataController');

/**
 * @swagger
 * tags:
 *   - name: Master Data — Operational
 *     description: farms, blocks, crop-types, activity-types (authenticate; farmer_owner scoping on farms)
 * components:
 *   schemas:
 *     MasterEntity:
 *       type: object
 *       description: Shape varies per resource (farms/blocks/crop-types/activity-types).
 * /master-data/farms/all:
 *   get:
 *     tags: [Master Data — Operational]
 *     summary: All farms (no pagination)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200': { description: List of all farms, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: array, items: { type: object } } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 * /master-data/farms:
 *   get:
 *     tags: [Master Data — Operational]
 *     summary: List farms (paginated, searchable)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *       - { name: search, in: query, schema: { type: string } }
 *       - { name: status, in: query, schema: { type: string } }
 *     responses:
 *       '200': { description: Paged farms, content: { application/json: { schema: { $ref: '#/components/schemas/PagedData' } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *   post:
 *     tags: [Master Data — Operational]
 *     summary: Create a farm
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code]
 *             properties:
 *               name: { type: string }
 *               code: { type: string }
 *               total_area_ha: { type: number }
 *               province: { type: string }
 *               city: { type: string }
 *               address: { type: string }
 *     responses:
 *       '201': { description: Created, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } } }
 *       '400': { $ref: '#/components/schemas/Error' }
 *       '401': { $ref: '#/components/schemas/Error' }
 * /master-data/farms/{id}:
 *   get:
 *     tags: [Master Data — Operational]
 *     summary: Get one farm
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     responses:
 *       '200': { description: Farm, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '404': { $ref: '#/components/schemas/Error' }
 *   put:
 *     tags: [Master Data — Operational]
 *     summary: Update a farm
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     requestBody: { required: true, content: { application/json: { schema: { type: object, properties: { name: { type: string }, code: { type: string }, total_area_ha: { type: number }, province: { type: string }, city: { type: string }, address: { type: string }, status: { type: string } } } } } }
 *     responses:
 *       '200': { description: Updated, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } } }
 *       '400': { $ref: '#/components/schemas/Error' }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '404': { $ref: '#/components/schemas/Error' }
 *   delete:
 *     tags: [Master Data — Operational]
 *     summary: Delete a farm
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     responses:
 *       '200': { description: Deleted, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '404': { $ref: '#/components/schemas/Error' }
 * /master-data/blocks/all:
 *   get:
 *     tags: [Master Data — Operational]
 *     summary: All blocks (no pagination)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200': { description: List of all blocks, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: array, items: { type: object } } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 * /master-data/blocks:
 *   get:
 *     tags: [Master Data — Operational]
 *     summary: List blocks (paginated, filter by farm)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *       - { name: search, in: query, schema: { type: string } }
 *       - { name: farm, in: query, schema: { type: string }, description: farm id }
 *     responses:
 *       '200': { description: Paged blocks, content: { application/json: { schema: { $ref: '#/components/schemas/PagedData' } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *   post:
 *     tags: [Master Data — Operational]
 *     summary: Create a block
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code, farm, area_ha]
 *             properties:
 *               name: { type: string }
 *               code: { type: string }
 *               farm: { type: string }
 *               area_ha: { type: number }
 *     responses:
 *       '201': { description: Created, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } } }
 *       '400': { $ref: '#/components/schemas/Error' }
 *       '401': { $ref: '#/components/schemas/Error' }
 * /master-data/blocks/{id}:
 *   get:
 *     tags: [Master Data — Operational]
 *     summary: Get one block
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     responses:
 *       '200': { description: Block, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '404': { $ref: '#/components/schemas/Error' }
 *   put:
 *     tags: [Master Data — Operational]
 *     summary: Update a block
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     requestBody: { required: true, content: { application/json: { schema: { type: object, properties: { name: { type: string }, code: { type: string }, farm: { type: string }, area_ha: { type: number }, status: { type: string } } } } } }
 *     responses:
 *       '200': { description: Updated, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } } }
 *       '400': { $ref: '#/components/schemas/Error' }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '404': { $ref: '#/components/schemas/Error' }
 *   delete:
 *     tags: [Master Data — Operational]
 *     summary: Delete a block
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     responses:
 *       '200': { description: Deleted, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '404': { $ref: '#/components/schemas/Error' }
 * /master-data/crop-types/all:
 *   get:
 *     tags: [Master Data — Operational]
 *     summary: All crop types (no pagination)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200': { description: List of all crop types, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: array, items: { type: object } } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 * /master-data/crop-types:
 *   get:
 *     tags: [Master Data — Operational]
 *     summary: List crop types (paginated)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *       - { name: search, in: query, schema: { type: string } }
 *     responses:
 *       '200': { description: Paged crop types, content: { application/json: { schema: { $ref: '#/components/schemas/PagedData' } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *   post:
 *     tags: [Master Data — Operational]
 *     summary: Create a crop type
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code]
 *             properties:
 *               name: { type: string }
 *               code: { type: string }
 *     responses:
 *       '201': { description: Created, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } } }
 *       '400': { $ref: '#/components/schemas/Error' }
 *       '401': { $ref: '#/components/schemas/Error' }
 * /master-data/crop-types/{id}:
 *   get:
 *     tags: [Master Data — Operational]
 *     summary: Get one crop type
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     responses:
 *       '200': { description: Crop type, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '404': { $ref: '#/components/schemas/Error' }
 *   put:
 *     tags: [Master Data — Operational]
 *     summary: Update a crop type
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     requestBody: { required: true, content: { application/json: { schema: { type: object, properties: { name: { type: string }, code: { type: string }, status: { type: string } } } } } }
 *     responses:
 *       '200': { description: Updated, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } } }
 *       '400': { $ref: '#/components/schemas/Error' }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '404': { $ref: '#/components/schemas/Error' }
 *   delete:
 *     tags: [Master Data — Operational]
 *     summary: Delete a crop type
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     responses:
 *       '200': { description: Deleted, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '404': { $ref: '#/components/schemas/Error' }
 * /master-data/activity-types/all:
 *   get:
 *     tags: [Master Data — Operational]
 *     summary: All activity types (no pagination)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200': { description: List of all activity types, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: array, items: { type: object } } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 * /master-data/activity-types:
 *   get:
 *     tags: [Master Data — Operational]
 *     summary: List activity types (paginated)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *       - { name: search, in: query, schema: { type: string } }
 *     responses:
 *       '200': { description: Paged activity types, content: { application/json: { schema: { $ref: '#/components/schemas/PagedData' } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *   post:
 *     tags: [Master Data — Operational]
 *     summary: Create an activity type
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code]
 *             properties:
 *               name: { type: string }
 *               code: { type: string }
 *     responses:
 *       '201': { description: Created, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } } }
 *       '400': { $ref: '#/components/schemas/Error' }
 *       '401': { $ref: '#/components/schemas/Error' }
 * /master-data/activity-types/{id}:
 *   get:
 *     tags: [Master Data — Operational]
 *     summary: Get one activity type
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     responses:
 *       '200': { description: Activity type, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '404': { $ref: '#/components/schemas/Error' }
 *   put:
 *     tags: [Master Data — Operational]
 *     summary: Update an activity type
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     requestBody: { required: true, content: { application/json: { schema: { type: object, properties: { name: { type: string }, code: { type: string }, status: { type: string } } } } } }
 *     responses:
 *       '200': { description: Updated, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } } }
 *       '400': { $ref: '#/components/schemas/Error' }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '404': { $ref: '#/components/schemas/Error' }
 *   delete:
 *     tags: [Master Data — Operational]
 *     summary: Delete an activity type
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     responses:
 *       '200': { description: Deleted, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '404': { $ref: '#/components/schemas/Error' }
 */

router.use(authenticate, isManagement);

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
