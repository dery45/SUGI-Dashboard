const mongoose = require('mongoose');
const User = require('../model/User');
const { validate, errorResponse, required, isEmail, minLength } = require('../util/validate');

const listUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    }

    // Role-based access control
    if (req.user.role === 'government') {
      // Government can only see government users
      query.role = 'government';
    } else if (req.user.role === 'farmer_owner') {
      // Owner can only see users they created OR themselves, AND only those sharing a farm
      const owner = await User.findById(req.user.id).populate('assigned_farms', '_id');
      const ownerFarmIds = (owner?.assigned_farms || []).map(f => f.toString());
      
      if (!ownerFarmIds.length) {
        return res.json({
          success: true,
          data: [],
          meta: { total: 0, page: parseInt(page), limit: parseInt(limit), totalPages: 0 },
          roleStats: [],
        });
      }
      
      // Find farmers/farmer_owners who share at least one farm
      const sharedFarmUsers = await User.find({
        role: { $in: ['farmer', 'farmer_owner'] },
        assigned_farms: { $in: ownerFarmIds },
      }).select('_id');
      
      const sharedFarmUserIds = sharedFarmUsers.map(u => u._id.toString());
      const ownerId = req.user.id.toString();
      
      query.$or = [
        { createdBy: req.user.id },
        { _id: req.user.id },
        { _id: { $in: sharedFarmUserIds } }
      ];
    }
    // Superadmin has no restrictions

    const total = await User.countDocuments(query);
    const data = await User.find(query)
      .select('-password')
      .populate('assigned_farms', 'name code')
      .sort({ createdAt: -1 })
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean();

    // Add farm names to response for Superadmin/Owner
    if (['superadmin', 'farmer_owner'].includes(req.user.role)) {
      for (const user of data) {
        if (user.assigned_farms && user.assigned_farms.length > 0) {
          user.assigned_farms_names = user.assigned_farms.map(f => f.name).join(', ');
        }
      }

    const roleStats = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);

    res.json({
      success: true,
      data,
      meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
      roleStats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'ID tidak valid' });
    }
    const user = await User.findById(req.params.id).select('-password').populate('assigned_farms', 'name code');
    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, address, assigned_farms } = req.body;

    const errors = validate(req.body, {
      name: [[required, 'Nama']],
      email: [
        [required, 'Email'],
        [isEmail, 'Email'],
      ],
      password: [
        [required, 'Password'],
        [minLength, 3, 'Password'],
      ],
    });
    if (errors) return errorResponse(res, errors);

    // Role-based restrictions
    if (req.user.role === 'government') {
      if (role !== 'government') {
        return errorResponse(res, { role: 'Pemerintah hanya dapat membuat user dengan peran Pemerintah' });
      }
    }

    if (role === 'farmer_owner') {
      if (!assigned_farms || !Array.isArray(assigned_farms) || assigned_farms.length === 0) {
        return errorResponse(res, { assigned_farms: 'Minimal satu farm harus ditugaskan untuk Owner' });
      }
      for (const farmId of assigned_farms) {
        if (!mongoose.Types.ObjectId.isValid(farmId)) {
          return errorResponse(res, { assigned_farms: 'ID Farm tidak valid' });
        }
      }
    }

    // For farmer role created by superadmin or farmer_owner, require farm assignment
    if (role === 'farmer' && ['superadmin', 'farmer_owner'].includes(req.user.role)) {
      if (!assigned_farms || !Array.isArray(assigned_farms) || assigned_farms.length === 0) {
        return errorResponse(res, { assigned_farms: 'Minimal satu farm harus ditugaskan untuk Petani' });
      }
      for (const farmId of assigned_farms) {
        if (!mongoose.Types.ObjectId.isValid(farmId)) {
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
      createdBy: req.user.id,
    };

    if (req.user.role === 'farmer_owner') {
      payload.role = 'farmer';
      const owner = await User.findById(req.user.id);
      payload.assigned_farms = owner.assigned_farms || [];
    } else if (assigned_farms) {
      payload.assigned_farms = assigned_farms;
    }

    const user = await User.create(payload);
    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        assigned_farms: user.assigned_farms,
      },
    });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { password: _password, ...updateData } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'ID tidak valid' });
    }

    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

    // Access control
    if (req.user.role === 'government') {
      if (target.role !== 'government') {
        return res.status(403).json({ success: false, message: 'Pemerintah hanya dapat mengelola user dengan peran Pemerintah' });
      }
    } else if (req.user.role === 'farmer_owner') {
      // Owner can only manage users they created OR themselves, AND only those sharing a farm
      const isSelf = target._id.toString() === req.user.id;
      const hasAccess = target.createdBy && target.createdBy.toString() === req.user.id;
      
      // Check farm sharing
      const owner = await User.findById(req.user.id).populate('assigned_farms', '_id');
      const ownerFarmIds = (owner?.assigned_farms || []).map(f => f.toString());
      const targetFarmIds = (target.assigned_farms || []).map(f => f.toString());
      const sharesFarm = ownerFarmIds.some(f => targetFarmIds.includes(f.toString()));
      
      if (!isSelf && !hasAccess && !sharesFarm) {
        return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke user ini' });
      }
      
      // Farmer owner can only update farmers/farmer_owners sharing their farm
      if (!['farmer', 'farmer_owner'].includes(target.role)) {
        return res.status(403).json({ success: false, message: 'Anda hanya dapat mengelola Petani dan Owner' });
      }
    }

    // Role change restrictions
    if (req.user.role !== 'superadmin' && req.user.role !== 'government') {
      delete updateData.role;
    } else if (req.user.role === 'government') {
      // Government can only change role to government
      if (updateData.role && updateData.role !== 'government') {
        delete updateData.role;
      }
    }

    if (req.body.assigned_farms !== undefined) {
      if (req.user.role !== 'superadmin' && req.user.role !== 'government') {
        return res
          .status(403)
          .json({ success: false, message: 'Hanya Super Admin atau Pemerintah yang dapat mengubah penugasan farm' });
      }
      if (!Array.isArray(req.body.assigned_farms)) {
        return res.status(400).json({ success: false, message: 'assigned_farms harus berupa array' });
      }
      for (const farmId of req.body.assigned_farms) {
        if (!mongoose.Types.ObjectId.isValid(farmId)) {
          return errorResponse(res, { assigned_farms: 'ID Farm tidak valid' });
        }
      }
      updateData.assigned_farms = req.body.assigned_farms;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select(
      '-password'
    );
    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'ID tidak valid' });
    }

    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

    // Access control
    if (req.user.role === 'government') {
      if (target.role !== 'government') {
        return res.status(403).json({ success: false, message: 'Pemerintah hanya dapat menonaktifkan user dengan peran Pemerintah' });
      }
    } else if (req.user.role === 'farmer_owner') {
      // Owner can only deactivate users they created OR themselves, AND only those sharing a farm
      const isSelf = target._id.toString() === req.user.id;
      const hasAccess = target.createdBy && target.createdBy.toString() === req.user.id;
      
      // Check farm sharing
      const owner = await User.findById(req.user.id).populate('assigned_farms', '_id');
      const ownerFarmIds = (owner?.assigned_farms || []).map(f => f.toString());
      const targetFarmIds = (target.assigned_farms || []).map(f => f.toString());
      const sharesFarm = ownerFarmIds.some(f => targetFarmIds.includes(f.toString()));
      
      if (!isSelf && !hasAccess && !sharesFarm) {
        return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke user ini' });
      }
      
      // Farmer owner can only deactivate farmers/farmer_owners sharing their farm
      if (!['farmer', 'farmer_owner'].includes(target.role)) {
        return res.status(403).json({ success: false, message: 'Anda hanya dapat menonaktifkan Petani dan Owner' });
      }
    }

    await User.findByIdAndUpdate(req.params.id, { status: 'Inactive' }, { new: true });
    res.json({ success: true, message: 'User dinonaktifkan' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { listUsers, getUserById, createUser, updateUser, deleteUser };
