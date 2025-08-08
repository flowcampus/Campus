const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, transaction } = require('../config/database');
const { authenticateToken, requireSchoolAccess, requireRole } = require('../middleware/auth');

const router = express.Router();

// Record grades for students
router.post('/', authenticateToken, requireRole(['teacher', 'school_admin']), [
  body('studentId').isUUID(),
  body('subjectId').isUUID(),
  body('academicTermId').isUUID(),
  body('assessmentType').isIn(['test', 'exam', 'assignment', 'project', 'continuous_assessment']),
  body('score').isNumeric(),
  body('maxScore').optional().isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { studentId, subjectId, academicTermId, assessmentType, score, maxScore = 100, grade, remarks } = req.body;

    const result = await query(
      `INSERT INTO grades (student_id, subject_id, academic_term_id, assessment_type, score, max_score, grade, remarks, recorded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [studentId, subjectId, academicTermId, assessmentType, score, maxScore, grade, remarks, req.user.id]
    );

    res.status(201).json({
      message: 'Grade recorded successfully',
      grade: result.rows[0]
    });

  } catch (error) {
    console.error('Grade recording error:', error);
    res.status(500).json({ error: 'Failed to record grade' });
  }
});

// Get grades for a student
router.get('/student/:studentId', authenticateToken, async (req, res) => {
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

    const gradesResult = await query(
      `SELECT g.*, s.name as subject_name, s.code as subject_code,
              at.name as term_name, u.first_name as teacher_first_name, u.last_name as teacher_last_name
       FROM grades g
       JOIN subjects s ON g.subject_id = s.id
       JOIN academic_terms at ON g.academic_term_id = at.id
       JOIN users u ON g.recorded_by = u.id
       ${whereClause}
       ORDER BY at.start_date DESC, s.name, g.created_at DESC`,
      params
    );

    res.json({ grades: gradesResult.rows });

  } catch (error) {
    console.error('Grades fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch grades' });
  }
});

// Get class grades for a subject
router.get('/class/:classId/subject/:subjectId', authenticateToken, requireRole(['teacher', 'school_admin']), async (req, res) => {
  try {
    const { classId, subjectId } = req.params;
    const { termId, assessmentType } = req.query;

    let whereClause = 'WHERE s.class_id = $1 AND g.subject_id = $2';
    const params = [classId, subjectId];
    let paramCount = 2;

    if (termId) {
      paramCount++;
      whereClause += ` AND g.academic_term_id = $${paramCount}`;
      params.push(termId);
    }

    if (assessmentType) {
      paramCount++;
      whereClause += ` AND g.assessment_type = $${paramCount}`;
      params.push(assessmentType);
    }

    const gradesResult = await query(
      `SELECT g.*, s.student_id, u.first_name, u.last_name,
              sub.name as subject_name, at.name as term_name
       FROM grades g
       JOIN students s ON g.student_id = s.id
       JOIN users u ON s.user_id = u.id
       JOIN subjects sub ON g.subject_id = sub.id
       JOIN academic_terms at ON g.academic_term_id = at.id
       ${whereClause}
       ORDER BY u.first_name, u.last_name, g.created_at DESC`,
      params
    );

    res.json({ grades: gradesResult.rows });

  } catch (error) {
    console.error('Class grades fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch class grades' });
  }
});

// Update grade
router.put('/:gradeId', authenticateToken, requireRole(['teacher', 'school_admin']), [
  body('score').optional().isNumeric(),
  body('grade').optional().trim(),
  body('remarks').optional().trim()
], async (req, res) => {
  try {
    const { gradeId } = req.params;
    const { score, grade, remarks } = req.body;

    const updateFields = [];
    const params = [];
    let paramCount = 0;

    if (score !== undefined) {
      paramCount++;
      updateFields.push(`score = $${paramCount}`);
      params.push(score);
    }

    if (grade !== undefined) {
      paramCount++;
      updateFields.push(`grade = $${paramCount}`);
      params.push(grade);
    }

    if (remarks !== undefined) {
      paramCount++;
      updateFields.push(`remarks = $${paramCount}`);
      params.push(remarks);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    paramCount++;
    params.push(gradeId);

    const result = await query(
      `UPDATE grades SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Grade not found' });
    }

    res.json({
      message: 'Grade updated successfully',
      grade: result.rows[0]
    });

  } catch (error) {
    console.error('Grade update error:', error);
    res.status(500).json({ error: 'Failed to update grade' });
  }
});

module.exports = router;
