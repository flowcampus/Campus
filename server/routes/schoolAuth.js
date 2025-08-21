const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

const router = express.Router();

const generateToken = (userId, role) =>
  jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/school/login
// School-specific login for Admin/Teacher/Staff with school identification
router.post('/login', [
  body('schoolIdentifier').isString().trim(), // name | email | code
  body('role').isIn(['school_admin', 'teacher', 'staff']),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { schoolIdentifier, role, email, password } = req.body;

    // Find school by code OR email OR name (ILIKE)
    const schoolResult = await query(
      `SELECT * FROM schools 
       WHERE code = $1 OR email = $1 OR name ILIKE $2 
       ORDER BY created_at DESC LIMIT 1`,
      [schoolIdentifier, `%${schoolIdentifier}%`]
    );

    if (schoolResult.rows.length === 0) {
      return res.status(404).json({ error: 'School not found' });
    }

    const school = schoolResult.rows[0];

    // Get user and membership in this school with specific role
    const userResult = await query(
      `SELECT u.*, su.role as school_role, su.school_id
       FROM users u
       JOIN school_users su ON su.user_id = u.id AND su.is_active = true
       WHERE u.email = $1 AND su.school_id = $2 AND su.role = $3`,
      [email, school.id, role]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials or no access to this school' });
    }

    const user = userResult.rows[0];

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      // best-effort login event (table may not exist yet)
      try { await query(`INSERT INTO login_events (user_id, success, reason) VALUES ($1, FALSE, 'bad_password')`, [user.id]); } catch (_) {}
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
    // best-effort login event
    try {
      await query(
        `INSERT INTO login_events (user_id, success, ip, user_agent, device_info) VALUES ($1, TRUE, $2, $3, $4)`,
        [user.id, req.ip, req.get('User-Agent') || null, null]
      );
    } catch (_) {}

    const token = generateToken(user.id, user.role);

    return res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        schoolId: school.id,
        schoolRole: user.school_role,
        schoolName: school.name,
        schoolCode: school.code,
        avatar: user.avatar_url
      },
      token
    });
  } catch (error) {
    console.error('School login error:', error);
    return res.status(500).json({ error: 'School login failed' });
  }
});

module.exports = router;
