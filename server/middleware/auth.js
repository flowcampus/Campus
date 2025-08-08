const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user details from database
    const userResult = await query(
      'SELECT u.*, su.school_id, su.role as school_role, su.permissions FROM users u LEFT JOIN school_users su ON u.id = su.user_id WHERE u.id = $1 AND u.is_active = true',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token or user not found' });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

// Check user roles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRoles = [req.user.role];
    if (req.user.school_role) {
      userRoles.push(req.user.school_role);
    }

    const hasRole = roles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles,
        current: userRoles
      });
    }

    next();
  };
};

// Check school access
const requireSchoolAccess = async (req, res, next) => {
  try {
    const schoolId = req.params.schoolId || req.body.schoolId || req.query.schoolId;
    
    if (!schoolId) {
      return res.status(400).json({ error: 'School ID required' });
    }

    // Super admin can access all schools
    if (req.user.role === 'super_admin') {
      req.schoolId = schoolId;
      return next();
    }

    // Check if user has access to this school
    const accessResult = await query(
      'SELECT * FROM school_users WHERE user_id = $1 AND school_id = $2 AND is_active = true',
      [req.user.id, schoolId]
    );

    if (accessResult.rows.length === 0) {
      return res.status(403).json({ error: 'No access to this school' });
    }

    req.schoolId = schoolId;
    req.schoolRole = accessResult.rows[0].role;
    req.schoolPermissions = accessResult.rows[0].permissions;
    next();
  } catch (error) {
    console.error('School access middleware error:', error);
    return res.status(500).json({ error: 'Access check failed' });
  }
};

// Admin portal access (hidden/secure)
const requireAdminAccess = (req, res, next) => {
  const adminRoles = ['super_admin', 'support_admin', 'sales_admin', 'content_admin', 'finance_admin'];
  
  if (!req.user || !adminRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};

// Permission checker
const hasPermission = (permission) => {
  return (req, res, next) => {
    if (req.user.role === 'super_admin') {
      return next();
    }

    const permissions = req.schoolPermissions || {};
    
    if (!permissions[permission]) {
      return res.status(403).json({ 
        error: `Permission '${permission}' required` 
      });
    }

    next();
  };
};

// Rate limiting for sensitive operations
const sensitiveOperationLimit = (req, res, next) => {
  // This would integrate with a more sophisticated rate limiting system
  // For now, we'll use a simple in-memory store
  const key = `${req.user.id}_${req.route.path}`;
  // Implementation would track sensitive operations per user
  next();
};

module.exports = {
  authenticateToken,
  requireRole,
  requireSchoolAccess,
  requireAdminAccess,
  hasPermission,
  sensitiveOperationLimit
};
