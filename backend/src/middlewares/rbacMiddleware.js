/**
 * Role-Based Access Control Middleware
 * Supports: 'Company_Admin', 'Group_Admin', 'UM', 'Farmer', 'Government'
 */

const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    // Expect req.user to be populated by authentication middleware (e.g. NextAuth/JWT)
    // For DEMO purposes, we will mock req.user if it doesn't exist to allow testing
    
    if (!req.user) {
      // Mock user for testing if auth isn't fully set up yet
      req.user = {
        _id: '661faecfc11c4c1a2b000888',
        role: 'Company_Admin', // Default to highest role for initial dev
        organization_id: '661faecfc11c4c1a2b000999'
      };
      
      // In production, uncomment this block instead:
      /*
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized: No user found. Please log in.' 
      });
      */
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires one of these roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

module.exports = {
  checkRole,
  isCompanyAdmin: checkRole(['Company_Admin']),
  isManagement: checkRole(['Company_Admin', 'Group_Admin', 'UM']),
  isFarmerOrUM: checkRole(['Farmer', 'UM', 'Group_Admin', 'Company_Admin'])
};
