const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, transaction } = require('../config/database');
const { authenticateToken, requireSchoolAccess, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all classes in a school
router.get('/school/:schoolId', authenticateToken, requireSchoolAccess, async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { termId, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE c.school_id = $1';
    const params = [schoolId];
    let paramCount = 1;

    if (termId) {
      paramCount++;
      whereClause += ` AND c.academic_term_id = $${paramCount}`;
      params.push(termId);
    }

    const classesQuery = `
      SELECT c.*, at.name as term_name, 
             u.first_name as teacher_first_name, u.last_name as teacher_last_name,
             COUNT(DISTINCT s.id) as student_count,
             COUNT(DISTINCT cs.subject_id) as subject_count
      FROM classes c
      LEFT JOIN academic_terms at ON c.academic_term_id = at.id
      LEFT JOIN users u ON c.class_teacher_id = u.id
      LEFT JOIN students s ON c.id = s.class_id AND s.status = 'active'
      LEFT JOIN class_subjects cs ON c.id = cs.class_id
      ${whereClause}
      GROUP BY c.id, at.id, u.id
      ORDER BY c.level, c.name
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(limit, offset);
    const classesResult = await query(classesQuery, params);

    res.json({ classes: classesResult.rows });

  } catch (error) {
    console.error('Classes fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// Create new class
router.post('/school/:schoolId', authenticateToken, requireSchoolAccess, requireRole(['super_admin', 'school_admin']), [
  body('name').trim().isLength({ min: 1 }),
  body('level').trim().isLength({ min: 1 }),
  body('academicTermId').isUUID(),
  body('capacity').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { schoolId } = req.params;
    const { name, level, section, capacity, classTeacherId, academicTermId } = req.body;

    const result = await query(
      `INSERT INTO classes (school_id, name, level, section, capacity, class_teacher_id, academic_term_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [schoolId, name, level, section, capacity || 30, classTeacherId, academicTermId]
    );

    res.status(201).json({
      message: 'Class created successfully',
      class: result.rows[0]
    });

  } catch (error) {
    console.error('Class creation error:', error);
    res.status(500).json({ error: 'Class creation failed' });
  }
});

// Get class by ID with students and subjects
router.get('/:classId', authenticateToken, async (req, res) => {
  try {
    const { classId } = req.params;

    const classResult = await query(
      `SELECT c.*, at.name as term_name, sch.name as school_name,
              u.first_name as teacher_first_name, u.last_name as teacher_last_name
       FROM classes c
       LEFT JOIN academic_terms at ON c.academic_term_id = at.id
       LEFT JOIN schools sch ON c.school_id = sch.id
       LEFT JOIN users u ON c.class_teacher_id = u.id
       WHERE c.id = $1`,
      [classId]
    );

    if (classResult.rows.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const classData = classResult.rows[0];

    // Get students in class
    const studentsResult = await query(
      `SELECT s.id, s.student_id, u.first_name, u.last_name, u.avatar_url
       FROM students s
       JOIN users u ON s.user_id = u.id
       WHERE s.class_id = $1 AND s.status = 'active'
       ORDER BY u.first_name, u.last_name`,
      [classId]
    );

    // Get subjects for class
    const subjectsResult = await query(
      `SELECT s.id, s.name, s.code, cs.teacher_id,
              u.first_name as teacher_first_name, u.last_name as teacher_last_name
       FROM class_subjects cs
       JOIN subjects s ON cs.subject_id = s.id
       LEFT JOIN users u ON cs.teacher_id = u.id
       WHERE cs.class_id = $1
       ORDER BY s.name`,
      [classId]
    );

    res.json({
      class: classData,
      students: studentsResult.rows,
      subjects: subjectsResult.rows
    });

  } catch (error) {
    console.error('Class fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch class' });
  }
});

module.exports = router;
