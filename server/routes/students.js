const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, transaction } = require('../config/database');
const { authenticateToken, requireSchoolAccess, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all students in a school
router.get('/school/:schoolId', authenticateToken, requireSchoolAccess, async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { classId, status = 'active', page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE s.school_id = $1';
    const params = [schoolId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      whereClause += ` AND s.status = $${paramCount}`;
      params.push(status);
    }

    if (classId) {
      paramCount++;
      whereClause += ` AND s.class_id = $${paramCount}`;
      params.push(classId);
    }

    if (search) {
      paramCount++;
      whereClause += ` AND (u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount} OR s.student_id ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    const studentsQuery = `
      SELECT s.*, u.first_name, u.last_name, u.email, u.phone, u.avatar_url,
             c.name as class_name, c.level as class_level
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN classes c ON s.class_id = c.id
      ${whereClause}
      ORDER BY u.first_name, u.last_name
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(limit, offset);
    const studentsResult = await query(studentsQuery, params);

    const countQuery = `
      SELECT COUNT(*) FROM students s
      JOIN users u ON s.user_id = u.id
      ${whereClause}
    `;
    const countResult = await query(countQuery, params.slice(0, paramCount));

    res.json({
      students: studentsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });

  } catch (error) {
    console.error('Students fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Create new student
router.post('/school/:schoolId', authenticateToken, requireSchoolAccess, requireRole(['super_admin', 'school_admin', 'teacher']), [
  body('userId').isUUID(),
  body('studentId').trim().isLength({ min: 1 }),
  body('classId').optional().isUUID(),
  body('dateOfBirth').optional().isISO8601(),
  body('gender').optional().isIn(['male', 'female', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { schoolId } = req.params;
    const {
      userId, studentId, classId, dateOfBirth, gender, bloodGroup,
      address, guardianName, guardianPhone, guardianEmail, guardianRelationship,
      medicalConditions, admissionDate
    } = req.body;

    // Check if student ID already exists in school
    const existingStudent = await query(
      'SELECT id FROM students WHERE school_id = $1 AND student_id = $2',
      [schoolId, studentId]
    );

    if (existingStudent.rows.length > 0) {
      return res.status(400).json({ error: 'Student ID already exists in this school' });
    }

    const result = await query(
      `INSERT INTO students (user_id, school_id, student_id, class_id, date_of_birth, gender, blood_group, address, guardian_name, guardian_phone, guardian_email, guardian_relationship, medical_conditions, admission_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [userId, schoolId, studentId, classId, dateOfBirth, gender, bloodGroup, address, guardianName, guardianPhone, guardianEmail, guardianRelationship, medicalConditions, admissionDate || new Date()]
    );

    res.status(201).json({
      message: 'Student created successfully',
      student: result.rows[0]
    });

  } catch (error) {
    console.error('Student creation error:', error);
    res.status(500).json({ error: 'Student creation failed' });
  }
});

// Get student by ID
router.get('/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;

    const studentResult = await query(
      `SELECT s.*, u.first_name, u.last_name, u.email, u.phone, u.avatar_url,
              c.name as class_name, c.level as class_level, c.section as class_section,
              sch.name as school_name
       FROM students s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN classes c ON s.class_id = c.id
       LEFT JOIN schools sch ON s.school_id = sch.id
       WHERE s.id = $1`,
      [studentId]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const student = studentResult.rows[0];

    // Check access permissions
    if (req.user.role !== 'super_admin') {
      const accessResult = await query(
        'SELECT * FROM school_users WHERE user_id = $1 AND school_id = $2 AND is_active = true',
        [req.user.id, student.school_id]
      );

      if (accessResult.rows.length === 0 && req.user.id !== student.user_id) {
        return res.status(403).json({ error: 'No access to this student' });
      }
    }

    res.json({ student });

  } catch (error) {
    console.error('Student fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// Update student
router.put('/:studentId', authenticateToken, requireRole(['super_admin', 'school_admin', 'teacher']), async (req, res) => {
  try {
    const { studentId } = req.params;
    const updates = req.body;

    const updateFields = [];
    const params = [];
    let paramCount = 0;

    const allowedFields = ['class_id', 'date_of_birth', 'gender', 'blood_group', 'address', 'guardian_name', 'guardian_phone', 'guardian_email', 'guardian_relationship', 'medical_conditions', 'status'];

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
    params.push(studentId);

    const result = await query(
      `UPDATE students SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({
      message: 'Student updated successfully',
      student: result.rows[0]
    });

  } catch (error) {
    console.error('Student update error:', error);
    res.status(500).json({ error: 'Student update failed' });
  }
});

// Get student attendance summary
router.get('/:studentId/attendance', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    const params = [studentId];
    let paramCount = 1;

    if (startDate) {
      paramCount++;
      dateFilter += ` AND date >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      dateFilter += ` AND date <= $${paramCount}`;
      params.push(endDate);
    }

    const attendanceQuery = `
      SELECT 
        COUNT(*) as total_days,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present_days,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_days,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late_days,
        COUNT(CASE WHEN status = 'excused' THEN 1 END) as excused_days
      FROM attendance 
      WHERE student_id = $1 ${dateFilter}
    `;

    const result = await query(attendanceQuery, params);
    const summary = result.rows[0];

    const attendanceRate = summary.total_days > 0 
      ? ((summary.present_days + summary.late_days) / summary.total_days * 100).toFixed(2)
      : 0;

    res.json({
      summary: {
        totalDays: parseInt(summary.total_days),
        presentDays: parseInt(summary.present_days),
        absentDays: parseInt(summary.absent_days),
        lateDays: parseInt(summary.late_days),
        excusedDays: parseInt(summary.excused_days),
        attendanceRate: parseFloat(attendanceRate)
      }
    });

  } catch (error) {
    console.error('Student attendance fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance summary' });
  }
});

// Get student grades
router.get('/:studentId/grades', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { termId, subjectId } = req.query;

    let whereClause = 'WHERE g.student_id = $1';
    const params = [studentId];
    let paramCount = 1;

    if (termId) {
      paramCount++;
      whereClause += ` AND g.academic_term_id = $${paramCount}`;
      params.push(termId);
    }

    if (subjectId) {
      paramCount++;
      whereClause += ` AND g.subject_id = $${paramCount}`;
      params.push(subjectId);
    }

    const gradesQuery = `
      SELECT g.*, s.name as subject_name, s.code as subject_code,
             at.name as term_name, u.first_name as teacher_first_name, u.last_name as teacher_last_name
      FROM grades g
      JOIN subjects s ON g.subject_id = s.id
      JOIN academic_terms at ON g.academic_term_id = at.id
      JOIN users u ON g.recorded_by = u.id
      ${whereClause}
      ORDER BY at.start_date DESC, s.name, g.created_at DESC
    `;

    const result = await query(gradesQuery, params);

    res.json({ grades: result.rows });

  } catch (error) {
    console.error('Student grades fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch student grades' });
  }
});

module.exports = router;
