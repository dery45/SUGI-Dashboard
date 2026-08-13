const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('[FATAL] JWT_SECRET is not set in the environment. Refusing to start.');
  console.error('Set JWT_SECRET before starting the server (see backend/.env.example).');
  process.exit(1);
}

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token tidak valid' });
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: `Akses ditolak. Required roles: ${allowedRoles.join(', ')}` });
    }
    next();
  };
}

const isSuperAdmin = authorize('superadmin');
const isGovernment = authorize('superadmin', 'government');
const isManagement = authorize('superadmin', 'farmer_owner');
const isFarmerOwner = authorize('superadmin', 'farmer_owner');
const isFarmer = authorize('superadmin', 'farmer_owner', 'farmer');

const checkRole = authorize;

module.exports = { authenticate, authorize, checkRole, isSuperAdmin, isGovernment, isManagement, isFarmerOwner, isFarmer };
