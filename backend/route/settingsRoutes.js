const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controller/settingsController');

/**
 * @swagger
 * /settings/profile:
 *   get:
 *     tags: [Settings]
 *     summary: Get own profile (assigned farms populated)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { type: object }
 *       '404':
 *         $ref: '#/components/schemas/Error'
 *   put:
 *     tags: [Settings]
 *     summary: Update own profile (name required, phone/address optional)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               phone: { type: string }
 *               address: { type: string }
 *     responses:
 *       '200':
 *         description: Updated profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { type: object }
 *     '4XX':
 *       $ref: '#/components/schemas/Error'
 * /settings/change-password:
 *   put:
 *     tags: [Settings]
 *     summary: Change own password
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [current_password, new_password, confirm_password]
 *             properties:
 *               current_password: { type: string, format: password }
 *               new_password: { type: string, format: password }
 *               confirm_password: { type: string, format: password }
 *     responses:
 *       '200':
 *         description: Changed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *     '4XX':
 *       $ref: '#/components/schemas/Error'
 * /settings/assign-farm:
 *   post:
 *     tags: [Settings]
 *     summary: Assign a farm to a user (farmer_owner or superadmin)
 *     description: farmer_owner assigns own farm; superadmin may pass `user_id` to target another user.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [farm_id]
 *             properties:
 *               farm_id: { type: string, description: ObjectId of a farm }
 *               user_id: { type: string, description: Only when superadmin targets another user }
 *     responses:
 *       '200':
 *         description: Updated user with populated assigned farms
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { type: object }
 *       '403':
 *         $ref: '#/components/schemas/Error'
 *     '4XX':
 *       $ref: '#/components/schemas/Error'
 */
router.use(authenticate);

router.get('/profile', ctrl.getProfile);
router.put('/profile', ctrl.updateProfile);
router.put('/change-password', ctrl.changePassword);
router.post('/assign-farm', ctrl.updateAssignedFarm);

module.exports = router;
