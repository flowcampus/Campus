const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, transaction } = require('../config/database');
const { authenticateToken, requireRole, requireAdminAccess } = require('../middleware/auth');

const router = express.Router();

// Create new school (for school registration)
router.post('/', [
  body('name').trim().isLength({ min: 1 }),
  body('email').isEmail().normalizeEmail(),
  body('phone').optional().isMobilePhone(),
  body('type').isIn(['nursery', 'primary', 'secondary', 'tertiary', 'mixed']),
  body('address').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name, email, phone, address, city, state, country = 'Nigeria',
      type, motto, logoUrl, adminEmail, adminPassword, adminFirstName, adminLastName
    } = req.body;

    // Generate unique school code
    const codeBase = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 6);
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const schoolCode = `${codeBase}${randomSuffix}`;

    // Check if school email already exists
    const existingSchool = await query('SELECT id FROM schools WHERE email = $1', [email]);
    if (existingSchool.rows.length > 0) {
      return res.status(400).json({ error: 'School with this email already exists' });
    }

    const result = await transaction(async (client) => {
      // Create school
      const schoolResult = await client.query(
        `INSERT INTO schools (name, code, email, phone, address, city, state, country, type, motto, logo_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [name, schoolCode, email, phone, address, city, state, country, type, motto, logoUrl]
      );

      const school = schoolResult.rows[0];

      // If admin details provided, create admin user
      if (adminEmail && adminPassword) {
        const bcrypt = require('bcryptjs');
        const passwordHash = await bcrypt.hash(adminPassword, 12);

        const adminResult = await client.query(
          `INSERT INTO users (email, password_hash, role, first_name, last_name)
           VALUES ($1, $2, $3, $4, $5) RETURNING id`,
          [adminEmail, passwordHash, 'school_admin', adminFirstName, adminLastName]
        );

        // Link admin to school
        await client.query(
          'INSERT INTO school_users (school_id, user_id, role) VALUES ($1, $2, $3)',
          [school.id, adminResult.rows[0].id, 'school_admin']
        );
      }

      return school;
    });

    res.status(201).json({
      message: 'School created successfully',
      school: {
        id: result.id,
        name: result.name,
        code: result.code,
        email: result.email,
        type: result.type
      }
    });

  } catch (error) {
    console.error('School creation error:', error);
    res.status(500).json({ error: 'School creation failed' });
  }
});

// Get all schools (admin only)
router.get('/', authenticateToken, requireAdminAccess, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type, status } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      whereClause += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR code ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (type) {
      paramCount++;
      whereClause += ` AND type = $${paramCount}`;
      params.push(type);
    }

    if (status) {
      paramCount++;
      whereClause += ` AND is_active = $${paramCount}`;
      params.push(status === 'active');
    }

    // Get schools with user counts
    const schoolsQuery = `
      SELECT s.*, 
             COUNT(DISTINCT su.user_id) as user_count,
             COUNT(DISTINCT st.id) as student_count
      FROM schools s
      LEFT JOIN school_users su ON s.id = su.school_id AND su.is_active = true
      LEFT JOIN students st ON s.id = st.school_id AND st.status = 'active'
      ${whereClause}
      GROUP BY s.id
      ORDER BY s.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(limit, offset);
    const schoolsResult = await query(schoolsQuery, params);

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM schools s ${whereClause}`;
    const countResult = await query(countQuery, params.slice(0, paramCount));

    res.json({
      schools: schoolsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });

  } catch (error) {
    console.error('Schools fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch schools' });
  }
});

// Get school by ID
router.get('/:schoolId', authenticateToken, async (req, res) => {
  try {
    const { schoolId } = req.params;

    // Check access permissions
    if (req.user.role !== 'super_admin') {
      const accessResult = await query(
        'SELECT * FROM school_users WHERE user_id = $1 AND school_id = $2 AND is_active = true',
        [req.user.id, schoolId]
      );

      if (accessResult.rows.length === 0) {
        return res.status(403).json({ error: 'No access to this school' });
      }
    }

    const schoolResult = await query(
      `SELECT s.*, 
              COUNT(DISTINCT su.user_id) as user_count,
              COUNT(DISTINCT st.id) as student_count,
              COUNT(DISTINCT t.id) as teacher_count,
              COUNT(DISTINCT c.id) as class_count
       FROM schools s
       LEFT JOIN school_users su ON s.id = su.school_id AND su.is_active = true
       LEFT JOIN students st ON s.id = st.school_id AND st.status = 'active'
       LEFT JOIN teachers t ON s.id = t.school_id AND t.status = 'active'
       LEFT JOIN classes c ON s.id = c.school_id
       WHERE s.id = $1
       GROUP BY s.id`,
      [schoolId]
    );

    if (schoolResult.rows.length === 0) {
      return res.status(404).json({ error: 'School not found' });
    }

    res.json({ school: schoolResult.rows[0] });

  } catch (error) {
    console.error('School fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch school' });
  }
});

// Update school
router.put('/:schoolId', authenticateToken, requireRole(['super_admin', 'school_admin']), [
  body('name').optional().trim().isLength({ min: 1 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().isMobilePhone(),
  body('type').optional().isIn(['nursery', 'primary', 'secondary', 'tertiary', 'mixed'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { schoolId } = req.params;
    const updates = req.body;

    // Check access permissions
    if (req.user.role !== 'super_admin') {
      const accessResult = await query(
        'SELECT role FROM school_users WHERE user_id = $1 AND school_id = $2 AND is_active = true',
        [req.user.id, schoolId]
      );

      if (accessResult.rows.length === 0 || accessResult.rows[0].role !== 'school_admin') {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
    }

    // Build update query
    const updateFields = [];
    const params = [];
    let paramCount = 0;

    Object.keys(updates).forEach(key => {
      if (['name', 'email', 'phone', 'address', 'city', 'state', 'country', 'type', 'motto', 'logo_url'].includes(key)) {
        paramCount++;
        updateFields.push(`${key} = $${paramCount}`);
        params.push(updates[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    paramCount++;
    params.push(schoolId);

    const updateQuery = `
      UPDATE schools 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(updateQuery, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'School not found' });
    }

    res.json({
      message: 'School updated successfully',
      school: result.rows[0]
    });

  } catch (error) {
    console.error('School update error:', error);
    res.status(500).json({ error: 'School update failed' });
  }
});

// Update school subscription (admin only)
router.put('/:schoolId/subscription', authenticateToken, requireAdminAccess, [
  body('plan').isIn(['free', 'basic', 'pro', 'premium']),
  body('expiresAt').optional().isISO8601()
], async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { plan, expiresAt } = req.body;

    const result = await query(
      `UPDATE schools 
       SET subscription_plan = $1, subscription_expires_at = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, name, subscription_plan, subscription_expires_at`,
      [plan, expiresAt, schoolId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'School not found' });
    }

    res.json({
      message: 'Subscription updated successfully',
      school: result.rows[0]
    });

  } catch (error) {
    console.error('Subscription update error:', error);
    res.status(500).json({ error: 'Subscription update failed' });
  }
});

// Get school statistics
router.get('/:schoolId/stats', authenticateToken, async (req, res) => {
  try {
    const { schoolId } = req.params;

    // Check access permissions
    if (req.user.role !== 'super_admin') {
      const accessResult = await query(
        'SELECT * FROM school_users WHERE user_id = $1 AND school_id = $2 AND is_active = true',
        [req.user.id, schoolId]
      );

      if (accessResult.rows.length === 0) {
        return res.status(403).json({ error: 'No access to this school' });
      }
    }

    // Get comprehensive statistics
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM students WHERE school_id = $1 AND status = 'active') as active_students,
        (SELECT COUNT(*) FROM teachers WHERE school_id = $1 AND status = 'active') as active_teachers,
        (SELECT COUNT(*) FROM classes WHERE school_id = $1) as total_classes,
        (SELECT COUNT(*) FROM subjects WHERE school_id = $1) as total_subjects,
        (SELECT COUNT(*) FROM attendance WHERE student_id IN (SELECT id FROM students WHERE school_id = $1) AND date >= CURRENT_DATE - INTERVAL '30 days') as monthly_attendance,
        (SELECT COALESCE(SUM(amount_paid), 0) FROM fee_payments WHERE student_id IN (SELECT id FROM students WHERE school_id = $1) AND payment_date >= CURRENT_DATE - INTERVAL '30 days') as monthly_revenue,
        (SELECT COUNT(*) FROM announcements WHERE school_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '7 days') as recent_announcements
    `;

    const statsResult = await query(statsQuery, [schoolId]);
    const stats = statsResult.rows[0];

    // Get enrollment trends (last 6 months)
    const trendsQuery = `
      SELECT 
        DATE_TRUNC('month', admission_date) as month,
        COUNT(*) as new_students
      FROM students 
      WHERE school_id = $1 AND admission_date >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', admission_date)
      ORDER BY month
    `;

    const trendsResult = await query(trendsQuery, [schoolId]);

    res.json({
      stats: {
        activeStudents: parseInt(stats.active_students),
        activeTeachers: parseInt(stats.active_teachers),
        totalClasses: parseInt(stats.total_classes),
        totalSubjects: parseInt(stats.total_subjects),
        monthlyAttendance: parseInt(stats.monthly_attendance),
        monthlyRevenue: parseFloat(stats.monthly_revenue),
        recentAnnouncements: parseInt(stats.recent_announcements)
      },
      enrollmentTrends: trendsResult.rows
    });

  } catch (error) {
    console.error('School stats error:', error);
    res.status(500).json({ error: 'Failed to fetch school statistics' });
  }
});

// Deactivate/Activate school (admin only)
router.patch('/:schoolId/status', authenticateToken, requireAdminAccess, [
  body('isActive').isBoolean()
], async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { isActive } = req.body;

    const result = await query(
      'UPDATE schools SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, is_active',
      [isActive, schoolId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'School not found' });
    }

    res.json({
      message: `School ${isActive ? 'activated' : 'deactivated'} successfully`,
      school: result.rows[0]
    });

  } catch (error) {
    console.error('School status update error:', error);
    res.status(500).json({ error: 'Status update failed' });
  }
});

// Search schools (public endpoint for registration)
router.get('/search/public', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const result = await query(
      `SELECT id, name, code, city, state, type 
       FROM schools 
       WHERE is_active = true AND (name ILIKE $1 OR code ILIKE $1)
       ORDER BY name
       LIMIT $2`,
      [`%${q}%`, limit]
    );

    res.json({ schools: result.rows });

  } catch (error) {
    console.error('School search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;
