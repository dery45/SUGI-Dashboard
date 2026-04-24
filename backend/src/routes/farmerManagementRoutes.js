const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isManagement } = require('../middlewares/rbacMiddleware');

// GET /api/farmers — List all farmers/users in the organization
router.get('/', isManagement, async (req, res) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const query = { organization_id: req.user.organization_id };

    if (role) query.role = role;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(query, '-password').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    // Role breakdown stats
    const roleStats = await User.aggregate([
      { $match: { organization_id: req.user.organization_id } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    res.json({ success: true, data: users, total, page: parseInt(page), roleStats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/farmers — Create new farmer/user
router.post('/', isManagement, async (req, res) => {
  try {
    const { name, email, password, phone, address, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Field wajib: name, email, password, role' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success: false, message: 'Email sudah terdaftar' });

    const user = new User({
      name,
      email,
      password, // Note: should be hashed in production with bcrypt
      phone,
      address,
      role,
      organization_id: req.user.organization_id,
      createdBy: req.user._id,
    });

    await user.save();
    const { password: _, ...safeUser } = user.toObject();
    res.status(201).json({ success: true, data: safeUser });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PATCH /api/farmers/:id — Update user details / role
router.patch('/:id', isManagement, async (req, res) => {
  try {
    const { password, ...updates } = req.body; // Prevent direct password update through this route

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, organization_id: req.user.organization_id },
      { $set: updates },
      { new: true, runValidators: true, projection: '-password' }
    );

    if (!user) return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/farmers/:id — Soft-delete by setting a deleted flag (or change org to null)
router.delete('/:id', isManagement, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, organization_id: req.user.organization_id },
      { $set: { organization_id: null } }, // Remove from org (soft delete)
      { new: true, projection: '-password' }
    );
    if (!user) return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
    res.json({ success: true, message: 'Pengguna berhasil dihapus dari organisasi' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
