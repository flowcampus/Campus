const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, transaction } = require('../config/database');
const { authenticateToken, requireSchoolAccess, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all teachers in a school
router.get('/school/:schoolId', authenticateToken, requireSchoolAccess, async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { status = 'active', page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE t.school_id = $1';
    const params = [schoolId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      whereClause += ` AND t.status = $${paramCount}`;
      params.push(status);
    }

    if (search) {
      paramCount++;
      whereClause += ` AND (u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount} OR t.employee_id ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    const teachersQuery = `
      SELECT t.*, u.first_name, u.last_name, u.email, u.phone, u.avatar_url,
             COUNT(DISTINCT cs.class_id) as classes_count,
             COUNT(DISTINCT cs.subject_id) as subjects_count
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN class_subjects cs ON t.user_id = cs.teacher_id
      ${whereClause}
      GROUP BY t.id, u.id
      ORDER BY u.first_name, u.last_name
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(limit, offset);
    const teachersResult = await query(teachersQuery, params);

    const countQuery = `
      SELECT COUNT(*) FROM teachers t
      JOIN users u ON t.user_id = u.id
      ${whereClause}
    `;
    const countResult = await query(countQuery, params.slice(0, paramCount));

    res.json({
      teachers: teachersResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });

  } catch (error) {
    console.error('Teachers fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

// Create new teacher
router.post('/school/:schoolId', authenticateToken, requireSchoolAccess, requireRole(['super_admin', 'school_admin']), [
  body('userId').isUUID(),
  body('employeeId').trim().isLength({ min: 1 }),
  body('qualification').optional().trim(),
  body('specialization').optional().trim(),
  body('salary').optional().isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { schoolId } = req.params;
    const { userId, employeeId, qualification, specialization, salary, hireDate } = req.body;

    // Check if employee ID already exists in school
    const existingTeacher = await query(
      'SELECT id FROM teachers WHERE school_id = $1 AND employee_id = $2',
      [schoolId, employeeId]
    );

    if (existingTeacher.rows.length > 0) {
      return res.status(400).json({ error: 'Employee ID already exists in this school' });
    }

    const result = await query(
      `INSERT INTO teachers (user_id, school_id, employee_id, qualification, specialization, salary, hire_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, schoolId, employeeId, qualification, specialization, salary, hireDate || new Date()]
    );

    res.status(201).json({
      message: 'Teacher created successfully',
      teacher: result.rows[0]
    });

  } catch (error) {
    console.error('Teacher creation error:', error);
    res.status(500).json({ error: 'Teacher creation failed' });
  }
});

// Get teacher by ID
router.get('/:teacherId', authenticateToken, async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacherResult = await query(
      `SELECT t.*, u.first_name, u.last_name, u.email, u.phone, u.avatar_url,
              sch.name as school_name
       FROM teachers t
       JOIN users u ON t.user_id = u.id
       LEFT JOIN schools sch ON t.school_id = sch.id
       WHERE t.id = $1`,
      [teacherId]
    );

    if (teacherResult.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const teacher = teacherResult.rows[0];

    // Check access permissions
    if (req.user.role !== 'super_admin') {
      const accessResult = await query(
        'SELECT * FROM school_users WHERE user_id = $1 AND school_id = $2 AND is_active = true',
        [req.user.id, teacher.school_id]
      );

      if (accessResult.rows.length === 0 && req.user.id !== teacher.user_id) {
        return res.status(403).json({ error: 'No access to this teacher' });
      }
    }

    // Get assigned classes and subjects
    const assignmentsResult = await query(
      `SELECT c.name as class_name, c.level as class_level, s.name as subject_name, s.code as subject_code
       FROM class_subjects cs
       JOIN classes c ON cs.class_id = c.id
       JOIN subjects s ON cs.subject_id = s.id
       WHERE cs.teacher_id = $1`,
      [teacher.user_id]
    );

    res.json({ 
      teacher,
      assignments: assignmentsResult.rows
    });

  } catch (error) {
    console.error('Teacher fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch teacher' });
  }
});

// Update teacher
router.put('/:teacherId', authenticateToken, requireRole(['super_admin', 'school_admin']), async (req, res) => {
  try {
    const { teacherId } = req.params;
    const updates = req.body;

    // Enforce tenant access: only super_admin or members of the teacher's school can update
    if (req.user.role !== 'super_admin') {
      const teacherSchoolResult = await query(
        'SELECT school_id FROM teachers WHERE id = $1',
        [teacherId]
      );

      if (teacherSchoolResult.rows.length === 0) {
        return res.status(404).json({ error: 'Teacher not found' });
      }

      const schoolId = teacherSchoolResult.rows[0].school_id;
      const accessResult = await query(
        'SELECT 1 FROM school_users WHERE user_id = $1 AND school_id = $2 AND is_active = true',
        [req.user.id, schoolId]
      );

      if (accessResult.rows.length === 0) {
        return res.status(403).json({ error: 'No access to this teacher\'s school' });
      }
    }

    const updateFields = [];
    const params = [];
    let paramCount = 0;

    const allowedFields = ['qualification', 'specialization', 'salary', 'status'];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        paramCount++;
        updateFields.push(`${key} = $${paramCount}`);
        params.push(updates[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    paramCount++;
    params.push(teacherId);

    const result = await query(
      `UPDATE teachers SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    res.json({
      message: 'Teacher updated successfully',
      teacher: result.rows[0]
    });

  } catch (error) {
    console.error('Teacher update error:', error);
    res.status(500).json({ error: 'Teacher update failed' });
  }
});

module.exports = router;
