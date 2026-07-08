const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: `Akses ditolak. Required roles: ${allowedRoles.join(', ')}` });
    }
    next();
  };
};

const isSuperAdmin = checkRole('superadmin');
const isGovernment = checkRole('superadmin', 'government');
const isManagement = checkRole('superadmin', 'farmer_owner');
const isFarmerOwner = checkRole('superadmin', 'farmer_owner');
const isFarmer = checkRole('superadmin', 'farmer_owner', 'farmer');

module.exports = { checkRole, isSuperAdmin, isGovernment, isManagement, isFarmerOwner, isFarmer };
