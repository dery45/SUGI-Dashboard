const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require('../controller/farmerManagementController');

/**
 * @swagger
 * /farmers:
 *   get:
 *     tags: [Farmer Management]
 *     summary: List users (farmers/owners) with role stats (authenticate)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: role, in: query, schema: { type: string, enum: [farmer, farmer_owner] } }
 *       - { name: search, in: query, schema: { type: string } }
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *     responses:
 *       '200':
 *         description: Users list + roleStats meta
 *         content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: array, items: { type: object } }, meta: { type: object, properties: { total: { type: integer }, page: { type: integer }, limit: { type: integer }, totalPages: { type: integer } } }, roleStats: { type: object } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *   post:
 *     tags: [Farmer Management]
 *     summary: Create a user (farmer_owner creates farmer)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *               role: { type: string, enum: [farmer, farmer_owner] }
 *               phone: { type: string }
 *               address: { type: string }
 *               assigned_farms: { type: array, items: { type: string } }
 *     responses:
 *       '201': { description: Created, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } } }
 *       '400': { $ref: '#/components/schemas/Error' }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 * /farmers/{id}:
 *   get:
 *     tags: [Farmer Management]
 *     summary: Get one user (authenticate)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     responses:
 *       '200': { description: User, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '404': { $ref: '#/components/schemas/Error' }
 *   put:
 *     tags: [Farmer Management]
 *     summary: Update a user (role change restricted to superadmin/government)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               phone: { type: string }
 *               address: { type: string }
 *               role: { type: string, enum: [farmer, farmer_owner] }
 *               assigned_farms: { type: array, items: { type: string } }
 *     responses:
 *       '200': { description: Updated, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true }, data: { type: object } } } } } }
 *       '400': { $ref: '#/components/schemas/Error' }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 *       '404': { $ref: '#/components/schemas/Error' }
 *   delete:
 *     tags: [Farmer Management]
 *     summary: Delete a user
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     responses:
 *       '200': { description: Deleted, content: { application/json: { schema: { type: object, properties: { success: { type: boolean, example: true } } } } } }
 *       '401': { $ref: '#/components/schemas/Error' }
 *       '403': { $ref: '#/components/schemas/Error' }
 *       '404': { $ref: '#/components/schemas/Error' }
 */

router.use(authenticate);

// User Manajemen: Owner + Government + superadmin — NOT Petani (Phase 4b Task 4)
const isUserManajemen = (req, res, next) => {
  if (['superadmin', 'farmer_owner', 'government'].includes(req.user?.role)) return next();
  return res.status(403).json({ success: false, message: 'Akses ditolak. User Manajemen hanya untuk Owner dan Pemerintah' });
};

router.use(isUserManajemen);

router.get('/', listUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
