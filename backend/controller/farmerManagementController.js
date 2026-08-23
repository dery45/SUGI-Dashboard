const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../model/User');
const { validate, errorResponse, required, isEmail, minLength } = require('../util/validate');

// Raw farm-id reader: lean + NO populate so assigned_farms are scalar ObjectIds.
// (populate + .toString() yields inspect strings like "{ _id: ObjectId(...) }",
// which broke the owner list query and silently disabled farm-sharing checks.)
const getRawFarmIds = async (userId) => {
  const u = await User.findById(userId).select('assigned_farms').lean();
  return (u?.assigned_farms || []).map(f =>
    f && typeof f === 'object' ? (f._id || f).toString() : String(f)
  );
};

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
      const ownerFarmIds = await getRawFarmIds(req.user.id);

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

      // Owner visibility scope. Combined via $and when a search $or exists,
      // otherwise the scope would silently overwrite the search filter.
      const scopeOr = [
        { createdBy: req.user.id },
        { _id: req.user.id },
        { _id: { $in: sharedFarmUserIds } }
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: scopeOr }];
        delete query.$or;
      } else {
        query.$or = scopeOr;
      }
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
    console.log('[DEBUG getUserById] Request user role:', req.user?.role, 'target user ID:', req.params.id);
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'ID tidak valid' });
    }
    const user = await User.findById(req.params.id).select('-password').populate('assigned_farms', 'name code');
    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

    console.log('[DEBUG getUserById] Target user role:', user.role, 'Request user role:', req.user?.role);
    
    // Role-based access control for getUserById
    if (req.user?.role === 'government') {
      console.log('[DEBUG] Government role check - user.role:', user.role);
      if (user.role !== 'government') {
        console.log('[DEBUG] Government access denied for role:', user.role);
        return res.status(403).json({ success: false, message: 'Pemerintah hanya dapat melihat user dengan peran Pemerintah' });
      }
    } else if (req.user?.role === 'farmer_owner') {
      const isSelf = user._id.toString() === req.user.id;
      const hasAccess = user.createdBy && user.createdBy.toString() === req.user.id;
      
      // Check farm sharing (lean raw ids — populated .toString() gives junk)
      const ownerFarmIds = await getRawFarmIds(req.user.id);
      const targetFarmIds = (user.assigned_farms || []).map(f =>
        f && typeof f === 'object' ? (f._id || f).toString() : String(f)
      );
      const sharesFarm = ownerFarmIds.some(id => targetFarmIds.includes(id));
      
      if (!isSelf && !hasAccess && !sharesFarm) {
        return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke user ini' });
      }
      
      // Farmer owner can only view farmers/farmer_owners sharing their farm
      if (!['farmer', 'farmer_owner'].includes(user.role)) {
        return res.status(403).json({ success: false, message: 'Anda hanya dapat melihat Petani dan Owner' });
      }
    }

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
        [minLength, 6, 'Password'],
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
    // For farmer_owner creator: single-farm auto-copy handles empty request; multi-farm picker must be subset
    if (role === 'farmer' && ['superadmin', 'farmer_owner'].includes(req.user.role)) {
      let effectiveFarms = assigned_farms;
      if (req.user.role === 'farmer_owner') {
        const ownerFarmIds = await getRawFarmIds(req.user.id);
        if (!assigned_farms || !Array.isArray(assigned_farms) || assigned_farms.length === 0) {
          // Single-farm auto-assign: use owner's farms
          effectiveFarms = ownerFarmIds;
          req.body.assigned_farms = effectiveFarms;
        } else {
          // Multi-farm picker: ensure picked farms are subset of owner's farms
          effectiveFarms = assigned_farms;
          const invalid = effectiveFarms.filter(f => !ownerFarmIds.includes(f.toString()));
          if (invalid.length) {
            return errorResponse(res, { assigned_farms: 'Farm yang dipilih tidak termasuk dalam farm Anda' });
          }
        }
      }
      if (!effectiveFarms || !Array.isArray(effectiveFarms) || effectiveFarms.length === 0) {
        return errorResponse(res, { assigned_farms: 'Minimal satu farm harus ditugaskan untuk Petani' });
      }
      for (const farmId of effectiveFarms) {
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
      // Use validated effective farms (auto-copy or picker subset) if set, else fallback to owner's farms
      if (req.body.assigned_farms && Array.isArray(req.body.assigned_farms) && req.body.assigned_farms.length) {
        payload.assigned_farms = req.body.assigned_farms;
      } else {
        const owner = await User.findById(req.user.id);
        payload.assigned_farms = owner?.assigned_farms || [];
      }
    } else if (assigned_farms) {
      payload.assigned_farms = assigned_farms;
    }

    const user = await User.create(payload);
    // Auto-create full-access penugasan for farmers created by Owner (single or multi)
    if (req.user.role === 'farmer_owner' && payload.role === 'farmer' && payload.assigned_farms?.length) {
      try {
        const FarmerAssignment = require('../model/FarmerAssignment');
        const Block = require('../model/Block');
        for (const farmId of payload.assigned_farms) {
          const block = await Block.findOne({ farm: farmId });
          if (!block) continue;
          const exists = await FarmerAssignment.findOne({ farmer: user._id, block: block._id });
          if (!exists) {
            await FarmerAssignment.create({
              farmer: user._id,
              farm: farmId,
              block: block._id,
              access_stages: [],
              sales_access: true,
              assigned_by: req.user.id,
              status: 'Active',
            });
          }
        }
      } catch (e) { console.error('auto-assignment failed', e.message); }
    }
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
    const { password, ...updateData } = req.body;

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

      // Check farm sharing (lean raw ids)
      const ownerFarmIds = await getRawFarmIds(req.user.id);
      const targetFarmIds = (target.assigned_farms || []).map(f =>
        f && typeof f === 'object' ? (f._id || f).toString() : String(f)
      );
      const sharesFarm = ownerFarmIds.some(id => targetFarmIds.includes(id));

      if (!isSelf && !hasAccess && !sharesFarm) {
        return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke user ini' });
      }

      // Farmer owner can only update farmers/farmer_owners sharing their farm
      if (!['farmer', 'farmer_owner'].includes(target.role)) {
        return res.status(403).json({ success: false, message: 'Anda hanya dapat mengelola Petani dan Owner' });
      }
    }

    // Email change: validate format + uniqueness before writing
    if (updateData.email !== undefined && updateData.email !== target.email) {
      const emailErrors = validate(updateData, {
        email: [
          [required, 'Email'],
          [isEmail, 'Email'],
        ],
      });
      if (emailErrors) return errorResponse(res, emailErrors);
      const duplicate = await User.findOne({ email: updateData.email, _id: { $ne: target._id } }).select('_id').lean();
      if (duplicate) return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
    }

    // Admin password reset. findByIdAndUpdate does NOT run the document
    // pre('save') hook that normally hashes passwords, so hash explicitly.
    if (password !== undefined && password !== '') {
      const pwErrors = validate({ password }, {
        password: [
          [required, 'Password'],
          [minLength, 6, 'Password'],
        ],
      });
      if (pwErrors) return errorResponse(res, pwErrors);
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
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
      const canManageFarms = ['superadmin', 'government'].includes(req.user.role);
      // Normalize both sides to sorted string id arrays for comparison
      const requested = Array.isArray(req.body.assigned_farms)
        ? req.body.assigned_farms.map(f => f.toString()).sort()
        : null;
      const current = (target.assigned_farms || [])
        .map(f => (f && typeof f === 'object' ? (f._id || f).toString() : String(f)))
        .sort();
      const unchanged =
        !!requested && requested.length === current.length && requested.every((v, i) => v === current[i]);

      if (!canManageFarms) {
        // Owners may echo back the existing assignment on edit; only a real
        // change to farm assignments is forbidden.
        if (!unchanged) {
          return res
            .status(403)
            .json({ success: false, message: 'Hanya Super Admin atau Pemerintah yang dapat mengubah penugasan farm' });
        }
      } else {
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

      // Check farm sharing (lean raw ids)
      const ownerFarmIds = await getRawFarmIds(req.user.id);
      const targetFarmIds = (target.assigned_farms || []).map(f =>
        f && typeof f === 'object' ? (f._id || f).toString() : String(f)
      );
      const sharesFarm = ownerFarmIds.some(id => targetFarmIds.includes(id));

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