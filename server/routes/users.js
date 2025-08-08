const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, transaction } = require('../config/database');
const { authenticateToken, requireSchoolAccess, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all users in a school
router.get('/school/:schoolId', authenticateToken, requireSchoolAccess, async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { role, page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE su.school_id = $1 AND su.is_active = true';
    const params = [schoolId];
    let paramCount = 1;

    if (role) {
      paramCount++;
      whereClause += ` AND su.role = $${paramCount}`;
      params.push(role);
    }

    if (search) {
      paramCount++;
      whereClause += ` AND (u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    const usersQuery = `
      SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.avatar_url, u.is_active, u.last_login,
             su.role as school_role, su.joined_at
      FROM users u
      JOIN school_users su ON u.id = su.user_id
      ${whereClause}
      ORDER BY u.first_name, u.last_name
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(limit, offset);
    const usersResult = await query(usersQuery, params);

    const countQuery = `
      SELECT COUNT(*) FROM users u
      JOIN school_users su ON u.id = su.user_id
      ${whereClause}
    `;
    const countResult = await query(countQuery, params.slice(0, paramCount));

    res.json({
      users: usersResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });

  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user profile
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can view their own profile, or admins can view any profile
    if (req.user.id !== userId && !['super_admin', 'school_admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const userResult = await query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.avatar_url, u.role, u.is_active, u.created_at, u.last_login,
              su.school_id, su.role as school_role, s.name as school_name
       FROM users u
       LEFT JOIN school_users su ON u.id = su.user_id AND su.is_active = true
       LEFT JOIN schools s ON su.school_id = s.id
       WHERE u.id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: userResult.rows[0] });

  } catch (error) {
    console.error('User profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/:userId', authenticateToken, [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('phone').optional().isMobilePhone()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    const { firstName, lastName, phone, avatarUrl } = req.body;

    // Users can update their own profile, or admins can update any profile
    if (req.user.id !== userId && !['super_admin', 'school_admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const updateFields = [];
    const params = [];
    let paramCount = 0;

    if (firstName !== undefined) {
      paramCount++;
      updateFields.push(`first_name = $${paramCount}`);
      params.push(firstName);
    }

    if (lastName !== undefined) {
      paramCount++;
      updateFields.push(`last_name = $${paramCount}`);
      params.push(lastName);
    }

    if (phone !== undefined) {
      paramCount++;
      updateFields.push(`phone = $${paramCount}`);
      params.push(phone);
    }

    if (avatarUrl !== undefined) {
      paramCount++;
      updateFields.push(`avatar_url = $${paramCount}`);
      params.push(avatarUrl);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    paramCount++;
    params.push(userId);

    const result = await query(
      `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING id, email, first_name, last_name, phone, avatar_url`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Profile update failed' });
  }
});

// Add user to school
router.post('/school/:schoolId/add', authenticateToken, requireSchoolAccess, requireRole(['super_admin', 'school_admin']), [
  body('email').isEmail().normalizeEmail(),
  body('role').isIn(['teacher', 'student', 'parent', 'staff'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { schoolId } = req.params;
    const { email, role, permissions = {} } = req.body;

    // Check if user exists
    const userResult = await query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found. User must register first.' });
    }

    const userId = userResult.rows[0].id;

    // Check if user is already in this school
    const existingResult = await query(
      'SELECT id FROM school_users WHERE school_id = $1 AND user_id = $2',
      [schoolId, userId]
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: 'User is already associated with this school' });
    }

    // Add user to school
    await query(
      'INSERT INTO school_users (school_id, user_id, role, permissions) VALUES ($1, $2, $3, $4)',
      [schoolId, userId, role, JSON.stringify(permissions)]
    );

    res.status(201).json({ message: 'User added to school successfully' });

  } catch (error) {
    console.error('Add user to school error:', error);
    res.status(500).json({ error: 'Failed to add user to school' });
  }
});

// Remove user from school
router.delete('/school/:schoolId/remove/:userId', authenticateToken, requireSchoolAccess, requireRole(['super_admin', 'school_admin']), async (req, res) => {
  try {
    const { schoolId, userId } = req.params;

    const result = await query(
      'UPDATE school_users SET is_active = false WHERE school_id = $1 AND user_id = $2 RETURNING id',
      [schoolId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found in this school' });
    }

    res.json({ message: 'User removed from school successfully' });

  } catch (error) {
    console.error('Remove user from school error:', error);
    res.status(500).json({ error: 'Failed to remove user from school' });
  }
});

// Update user role in school
router.put('/school/:schoolId/role/:userId', authenticateToken, requireSchoolAccess, requireRole(['super_admin', 'school_admin']), [
  body('role').isIn(['teacher', 'student', 'parent', 'staff', 'school_admin']),
  body('permissions').optional().isObject()
], async (req, res) => {
  try {
    const { schoolId, userId } = req.params;
    const { role, permissions } = req.body;

    const result = await query(
      'UPDATE school_users SET role = $1, permissions = $2 WHERE school_id = $3 AND user_id = $4 RETURNING id',
      [role, JSON.stringify(permissions || {}), schoolId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found in this school' });
    }

    res.json({ message: 'User role updated successfully' });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

module.exports = router;
