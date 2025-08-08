const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { query, transaction } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Register new user (multi-role registration)
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  body('role').isIn(['student', 'parent', 'teacher', 'school_admin']),
  body('phone').optional().isMobilePhone()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, role, phone, schoolCode } = req.body;

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user in transaction
    const result = await transaction(async (client) => {
      // Insert user
      const userResult = await client.query(
        'INSERT INTO users (email, password_hash, role, first_name, last_name, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, role, first_name, last_name',
        [email, passwordHash, role, firstName, lastName, phone]
      );

      const user = userResult.rows[0];

      // If school code provided, link user to school
      if (schoolCode && role !== 'super_admin') {
        const schoolResult = await client.query('SELECT id FROM schools WHERE code = $1', [schoolCode]);
        
        if (schoolResult.rows.length > 0) {
          await client.query(
            'INSERT INTO school_users (school_id, user_id, role) VALUES ($1, $2, $3)',
            [schoolResult.rows[0].id, user.id, role]
          );
        }
      }

      return user;
    });

    // Generate token
    const token = generateToken(result.id, result.role);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: result.id,
        email: result.email,
        firstName: result.first_name,
        lastName: result.last_name,
        role: result.role
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, schoolCode } = req.body;

    // Get user with school information
    let userQuery = `
      SELECT u.*, su.school_id, su.role as school_role, s.name as school_name, s.code as school_code
      FROM users u 
      LEFT JOIN school_users su ON u.id = su.user_id AND su.is_active = true
      LEFT JOIN schools s ON su.school_id = s.id
      WHERE u.email = $1 AND u.is_active = true
    `;
    
    const params = [email];
    
    // If school code provided, filter by school
    if (schoolCode) {
      userQuery += ' AND s.code = $2';
      params.push(schoolCode);
    }

    const userResult = await query(userQuery, params);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    // Generate token
    const token = generateToken(user.id, user.role);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        schoolId: user.school_id,
        schoolRole: user.school_role,
        schoolName: user.school_name,
        schoolCode: user.school_code,
        avatar: user.avatar_url
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Guest login (demo access)
router.post('/guest-login', async (req, res) => {
  try {
    const { schoolCode } = req.body;

    let guestData = {
      id: 'guest',
      role: 'guest',
      firstName: 'Guest',
      lastName: 'User'
    };

    // If school code provided, get school info for demo
    if (schoolCode) {
      const schoolResult = await query('SELECT id, name, code FROM schools WHERE code = $1', [schoolCode]);
      if (schoolResult.rows.length > 0) {
        guestData.schoolId = schoolResult.rows[0].id;
        guestData.schoolName = schoolResult.rows[0].name;
        guestData.schoolCode = schoolResult.rows[0].code;
      }
    }

    // Generate limited token (shorter expiry)
    const token = jwt.sign(
      { userId: 'guest', role: 'guest' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Guest access granted',
      user: guestData,
      token,
      limitations: [
        'Read-only access',
        'Limited to public information',
        'Session expires in 24 hours'
      ]
    });

  } catch (error) {
    console.error('Guest login error:', error);
    res.status(500).json({ error: 'Guest login failed' });
  }
});

// Admin portal login (hidden access)
router.post('/admin-login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 }),
  body('adminKey').optional().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, adminKey } = req.body;

    // Verify admin key if provided (additional security layer)
    if (adminKey && adminKey !== process.env.ADMIN_ACCESS_KEY) {
      return res.status(401).json({ error: 'Invalid admin access key' });
    }

    // Get admin user
    const userResult = await query(
      'SELECT * FROM users WHERE email = $1 AND role IN ($2, $3, $4, $5, $6) AND is_active = true',
      [email, 'super_admin', 'support_admin', 'sales_admin', 'content_admin', 'finance_admin']
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const user = userResult.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Log admin access
    await query(
      'INSERT INTO system_logs (user_id, action, ip_address, user_agent) VALUES ($1, $2, $3, $4)',
      [user.id, 'admin_login', req.ip, req.get('User-Agent')]
    );

    // Update last login
    await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    // Generate token with admin permissions
    const token = generateToken(user.id, user.role);

    res.json({
      message: 'Admin login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        avatar: user.avatar_url
      },
      token,
      adminAccess: true
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Admin login failed' });
  }
});

// Refresh token
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const newToken = generateToken(req.user.id, req.user.role);
    
    res.json({
      message: 'Token refreshed',
      token: newToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// Logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Log logout action
    await query(
      'INSERT INTO system_logs (user_id, action, ip_address) VALUES ($1, $2, $3)',
      [req.user.id, 'logout', req.ip]
    );

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Password reset request
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const { email } = req.body;

    const userResult = await query('SELECT id, email, first_name FROM users WHERE email = $1', [email]);
    
    if (userResult.rows.length === 0) {
      // Don't reveal if email exists or not
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }

    const user = userResult.rows[0];
    
    // Generate reset token (expires in 1 hour)
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // In production, send email with reset link
    // For now, we'll just log it
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.json({ message: 'If the email exists, a reset link has been sent' });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
});

// Reset password
router.post('/reset-password', [
  body('token').isLength({ min: 1 }),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Verify reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({ error: 'Invalid reset token' });
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [passwordHash, decoded.userId]
    );

    res.json({ message: 'Password reset successful' });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Reset token expired' });
    }
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userResult = await query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.avatar_url, u.role, u.created_at,
              su.school_id, su.role as school_role, s.name as school_name, s.code as school_code
       FROM users u 
       LEFT JOIN school_users su ON u.id = su.user_id AND su.is_active = true
       LEFT JOIN schools s ON su.school_id = s.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        avatar: user.avatar_url,
        role: user.role,
        schoolId: user.school_id,
        schoolRole: user.school_role,
        schoolName: user.school_name,
        schoolCode: user.school_code,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;
