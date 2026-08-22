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
  } catch {
    return res.status(401).json({ success: false, message: 'Token tidak valid' });
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ success: false, message: `Akses ditolak. Required roles: ${allowedRoles.join(', ')}` });
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

// Farmer-scoped access check for lifecycle/sales routes
const isFarmerScoped = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    // Superadmin, government, farmer_owner pass through (they have isManagement guard)
    if (['superadmin', 'government', 'farmer_owner'].includes(req.user.role)) {
      return next();
    }
    
    // For farmers, check if they have assignment for the requested resource
    if (req.user.role === 'farmer') {
      const FarmerAssignment = require('../model/FarmerAssignment');
      const farmerId = req.user.id;
      
      // Extract farm_id or block from request
      let farmId = req.body.farm_id || req.query.farm_id || req.params.farm_id;
      let blockId = req.body.block || req.query.block || req.params.block_id;
      let cropCycleId = req.body.crop_cycle_id || req.query.crop_cycle_id || req.params.crop_cycle_id;
      
      // For sales, check sales_access
      const isSalesRoute = req.path.includes('/sales');
      const isLifecycleRoute = req.path.includes('/lifecycle');
      
      const assignments = await FarmerAssignment.find({ 
        farmer: farmerId, 
        status: 'Active' 
      }).lean();
      
      if (!assignments.length) {
        return res.status(403).json({ success: false, message: 'Anda tidak memiliki penugasan aktif' });
      }
      
      let hasAccess = false;
      
      for (const assignment of assignments) {
        // Check farm access
        if (farmId && assignment.farm?.toString() === farmId) {
          hasAccess = true;
          break;
        }
        // Check block access
        if (blockId && assignment.block?.toString() === blockId) {
          hasAccess = true;
          break;
        }
        // For sales, check sales_access flag
        if (isSalesRoute && assignment.sales_access) {
          hasAccess = true;
          break;
        }
        // For lifecycle, check access_stages
        if (isLifecycleRoute && assignment.access_stages?.length > 0) {
          hasAccess = true;
          break;
        }
        // If crop_cycle_id provided, check if assignment belongs to that cycle
        if (cropCycleId && assignment.crop_cycle?.toString() === cropCycleId) {
          hasAccess = true;
          break;
        }
      }
      
      if (!hasAccess) {
        return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke resource ini' });
      }
      
      return next();
    }
    
    // Other roles not allowed
    return res.status(403).json({ success: false, message: 'Akses ditolak' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  authenticate,
  authorize,
  checkRole,
  isSuperAdmin,
  isGovernment,
  isManagement,
  isFarmerOwner,
  isFarmer,
  isFarmerScoped,
  JWT_SECRET,
};
