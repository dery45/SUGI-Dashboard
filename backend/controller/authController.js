const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/User');
const { JWT_SECRET } = require('../middleware/auth');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email tidak terdaftar' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Password salah' });
    }

    // Reject login for farmer/farmer_owner with zero farm assignments
    if (['farmer', 'farmer_owner'].includes(user.role)) {
      if (!user.assigned_farms || user.assigned_farms.length === 0) {
        return res.status(403).json({ 
          success: false, 
          message: 'Akun Anda tidak memiliki farm yang ditugaskan. Hubungi administrator untuk mendapatkan akses farm.' 
        });
      }
    }

    const token = jwt.sign({ id: user._id, role: user.role, email: user.email, name: user.name }, JWT_SECRET, {
      expiresIn: '24h',
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server. Silakan coba lagi.' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server. Silakan coba lagi.' });
  }
};

module.exports = { login, getMe };
