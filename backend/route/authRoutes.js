const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controller/authController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Public login — obtain a Bearer token
 *     description: "Only unguarded endpoint. Returns a JWT (24h) used as `Authorization: Bearer <token>` elsewhere."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "superadmin@sugi.id" }
 *               password: { type: string, example: "superadmin123" }
 *     responses:
 *       '200':
 *         description: Login success with token + user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 token: { type: string }
 *                 user:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     name: { type: string }
 *                     email: { type: string }
 *                     role: { type: string, enum: [superadmin, government, farmer_owner, farmer] }
 *                     phone: { type: string }
 *       '400':
 *         $ref: '#/components/schemas/Error'
 *       '401':
 *         $ref: '#/components/schemas/Error'
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current authenticated user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       '200':
 *         description: Current user (password excluded)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 user: { type: object }
 *       '401':
 *         $ref: '#/components/schemas/Error'
 */
router.post('/login', login);
router.get('/me', authenticate, getMe);

module.exports = router;
