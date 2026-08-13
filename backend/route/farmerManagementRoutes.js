const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { listUsers, getUserById, createUser, updateUser, deleteUser } = require('../controller/farmerManagementController');

router.use(authenticate);

router.get('/', listUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;