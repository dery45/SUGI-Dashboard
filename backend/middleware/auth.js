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

// Farmer-scoped access check for lifecycle/sales/expenses routes
// Distinguishes "no active assignment" vs "assignment exists but stage/farm not covered"
const isFarmerScoped = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }
    const FarmerAssignment = require('../model/FarmerAssignment');
    const farmerId = req.user.id;
    let farmId = req.body?.farm_id || req.query.farm_id || req.params.farm_id;
    let blockId = req.body?.block || req.query?.block || req.params.block_id;
    let cropCycleId = req.body?.crop_cycle_id || req.query?.crop_cycle_id || req.params.crop_cycle_id;
    const urlForCheck = req.originalUrl || req.path;
    const isSalesRoute = urlForCheck.includes('/sales');
    const isExpensesRoute = urlForCheck.includes('/expenses');
    const isLifecycleRoute = urlForCheck.includes('/lifecycle');
    // Map lifecycle sub-path to required stage (used for specific error)
    let requiredStage = null;
    if (isLifecycleRoute) {
      if (urlForCheck.includes('/land')) requiredStage = 'Land_Preparation';
      else if (urlForCheck.includes('/plantings')) requiredStage = 'Planting';
      else if (urlForCheck.includes('/activities')) requiredStage = 'Maintenance';
      else if (urlForCheck.includes('/harvests')) requiredStage = 'Harvesting';
      else if (urlForCheck.includes('/cycles/eligible')) requiredStage = null; // any stage suffices
    }
    const assignments = await FarmerAssignment.find({ farmer: farmerId, status: 'Active' }).lean();
    if (!assignments.length) {
      return res.status(403).json({ success: false, message: 'Anda tidak memiliki penugasan aktif' });
    }
    let hasAccess = false;
    let hasStageMismatch = false;
    for (const assignment of assignments) {
      if (farmId && assignment.farm?.toString() === farmId) { hasAccess = true; break; }
      if (blockId && assignment.block?.toString() === blockId) { hasAccess = true; break; }
      if (cropCycleId && assignment.crop_cycle?.toString() === cropCycleId) { hasAccess = true; break; }
      if ((isSalesRoute || isExpensesRoute) && assignment.sales_access) { hasAccess = true; break; }
      if ((isSalesRoute || isExpensesRoute) && !assignment.sales_access) hasStageMismatch = true;
      if (isLifecycleRoute) {
        if (requiredStage) {
          if (assignment.access_stages?.includes(requiredStage)) { hasAccess = true; break; }
          if (assignment.access_stages?.length) hasStageMismatch = true;
          // empty access_stages means full access
          if (!assignment.access_stages || assignment.access_stages.length === 0) { hasAccess = true; break; }
        } else {
          // cycles/eligible or generic lifecycle -> any stage suffices
          if (assignment.access_stages?.length > 0 || !assignment.access_stages) { hasAccess = true; break; }
        }
      }
    }
    if (!hasAccess) {
      if ((isSalesRoute || isExpensesRoute) && hasStageMismatch) {
        return res.status(403).json({ success: false, message: 'Penugasan Anda tidak memiliki akses Penjualan & Distribusi' });
      }
      if (isLifecycleRoute && requiredStage && hasStageMismatch) {
        const stageLabels = { Land_Preparation: 'Persiapan Lahan', Planting: 'Penanaman', Maintenance: 'Perawatan', Harvesting: 'Panen' };
        return res.status(403).json({ success: false, message: `Penugasan Anda tidak mencakup akses tahap ${stageLabels[requiredStage] || requiredStage}` });
      }
      return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke resource ini untuk farm/block tersebut' });
    }
    return next();
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
