const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { validate, errorResponse, required, isEmail, isPhone, minLength } = require('../utils/validate');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('assigned_farms', 'name code province city')
      .lean();
    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const errors = validate(req.body, {
      name: [[required, 'Nama']],
      phone: [[isPhone, 'Telepon']]
    });
    if (errors) return errorResponse(res, errors);

    const updateData = { name };
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;

    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true, runValidators: true })
      .select('-password')
      .populate('assigned_farms', 'name code')
      .lean();

    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { current_password, new_password, confirm_password } = req.body;

    const errors = validate(req.body, {
      current_password: [[required, 'Password saat ini']],
      new_password: [[required, 'Password baru'], [minLength, 6, 'Password baru']],
      confirm_password: [[required, 'Konfirmasi password']]
    });
    if (errors) return errorResponse(res, errors);

    if (new_password !== confirm_password) {
      return errorResponse(res, { confirm_password: 'Konfirmasi password tidak cocok' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      return errorResponse(res, { current_password: 'Password saat ini salah' });
    }

    user.password = new_password;
    await user.save();

    res.json({ success: true, message: 'Password berhasil diubah' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateAssignedFarm = async (req, res) => {
  try {
    if (req.user.role !== 'farmer_owner' && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Tidak memiliki akses' });
    }

    const { farm_id } = req.body;
    if (!farm_id || !require('mongoose').Types.ObjectId.isValid(farm_id)) {
      return errorResponse(res, { farm_id: 'ID Farm tidak valid' });
    }

    const FarmMaster = require('../models/FarmMaster');
    const farm = await FarmMaster.findById(farm_id);
    if (!farm) return res.status(404).json({ success: false, message: 'Farm tidak ditemukan' });

    // Superadmin can update any farmer_owner's farms; farmer_owner can only update own
    const targetId = req.user.role === 'superadmin' && req.body.user_id ? req.body.user_id : req.user.id;
    const user = await User.findById(targetId);
    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

    const assigned = user.assigned_farms || [];
    if (!assigned.some(f => f.toString() === farm_id)) {
      assigned.push(farm_id);
      user.assigned_farms = assigned;
      await user.save();
    }

    const updated = await User.findById(targetId).select('-password').populate('assigned_farms', 'name code').lean();
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProfile, updateProfile, changePassword, updateAssignedFarm };
