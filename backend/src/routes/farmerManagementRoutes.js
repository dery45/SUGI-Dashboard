const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate } = require('../middlewares/authMiddleware');
const { validate, errorResponse, required, isEmail, minLength, isObjectId } = require('../utils/validate');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    if (req.user.role === 'farmer_owner') {
      query.$or = [
        { createdBy: req.user.id },
        { _id: req.user.id }
      ];
    }

    const total = await User.countDocuments(query);
    const data = await User.find(query)
      .select('-password')
      .populate('assigned_farms', 'name code')
      .sort({ createdAt: -1 })
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean();

    const roleStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    res.json({ success: true, data, meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) }, roleStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!require('mongoose').Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'ID tidak valid' });
    }
    const user = await User.findById(req.params.id).select('-password').populate('assigned_farms', 'name code');
    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, password, role, phone, address, assigned_farms } = req.body;

    const errors = validate(req.body, {
      name: [[required, 'Nama']],
      email: [[required, 'Email'], [isEmail, 'Email']],
      password: [[required, 'Password'], [minLength, 3, 'Password']]
    });
    if (errors) return errorResponse(res, errors);

    if (role === 'farmer_owner') {
      if (!assigned_farms || !Array.isArray(assigned_farms) || assigned_farms.length === 0) {
        return errorResponse(res, { assigned_farms: 'Minimal satu farm harus ditugaskan untuk Pemilik Petani' });
      }
      for (const farmId of assigned_farms) {
        if (!require('mongoose').Types.ObjectId.isValid(farmId)) {
          return errorResponse(res, { assigned_farms: 'ID Farm tidak valid' });
        }
      }
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
    }

    const payload = {
      name,
      email,
      password,
      role: role || 'farmer',
      phone,
      address,
      createdBy: req.user.id
    };

    if (req.user.role === 'farmer_owner') {
      payload.role = 'farmer';
      const owner = await User.findById(req.user.id);
      payload.assigned_farms = owner.assigned_farms || [];
    } else if (assigned_farms) {
      payload.assigned_farms = assigned_farms;
    }

    const user = await User.create(payload);
    res.status(201).json({ success: true, data: { id: user._id, name: user.name, email: user.email, role: user.role, assigned_farms: user.assigned_farms } });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { password, ...updateData } = req.body;

    if (!require('mongoose').Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'ID tidak valid' });
    }

    if (req.user.role === 'farmer_owner') {
      const target = await User.findById(req.params.id);
      if (!target) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
      const hasAccess = target.createdBy && target.createdBy.toString() === req.user.id;
      const isSelf = target._id.toString() === req.user.id;
      if (!hasAccess && !isSelf) {
        return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke user ini' });
      }
    }

    if (req.user.role !== 'superadmin' && req.user.role !== 'government') {
      delete updateData.role;
    }

    if (req.body.assigned_farms !== undefined) {
      if (req.user.role !== 'superadmin' && req.user.role !== 'government') {
        return res.status(403).json({ success: false, message: 'Hanya Super Admin atau Pemerintah yang dapat mengubah penugasan farm' });
      }
      if (!Array.isArray(req.body.assigned_farms)) {
        return res.status(400).json({ success: false, message: 'assigned_farms harus berupa array' });
      }
      for (const farmId of req.body.assigned_farms) {
        if (!require('mongoose').Types.ObjectId.isValid(farmId)) {
          return errorResponse(res, { assigned_farms: 'ID Farm tidak valid' });
        }
      }
      updateData.assigned_farms = req.body.assigned_farms;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!require('mongoose').Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'ID tidak valid' });
    }

    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

    if (req.user.role === 'farmer_owner') {
      const hasAccess = target.createdBy && target.createdBy.toString() === req.user.id;
      const isSelf = target._id.toString() === req.user.id;
      if (!hasAccess && !isSelf) {
        return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke user ini' });
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, { status: 'Inactive' }, { new: true });
    res.json({ success: true, message: 'User dinonaktifkan' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
