const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken, requireSchoolAccess, requireRole } = require('../middleware/auth');

const router = express.Router();

// Create timetable entry
router.post('/', authenticateToken, requireRole(['super_admin', 'school_admin']), [
  body('classId').isUUID(),
  body('subjectId').isUUID(),
  body('teacherId').isUUID(),
  body('dayOfWeek').isInt({ min: 1, max: 7 }),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { classId, subjectId, teacherId, dayOfWeek, startTime, endTime, room } = req.body;

    // Enforce tenant access: fetch class's school and verify membership
    if (req.user.role !== 'super_admin') {
      const classResult = await query('SELECT school_id FROM classes WHERE id = $1', [classId]);
      if (classResult.rows.length === 0) {
        return res.status(404).json({ error: 'Class not found' });
      }
      const schoolId = classResult.rows[0].school_id;
      const accessResult = await query(
        'SELECT 1 FROM school_users WHERE user_id = $1 AND school_id = $2 AND is_active = true',
        [req.user.id, schoolId]
      );
      if (accessResult.rows.length === 0) {
        return res.status(403).json({ error: 'No access to this school' });
      }
    }

    const result = await query(
      `INSERT INTO timetables (class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [classId, subjectId, teacherId, dayOfWeek, startTime, endTime, room]
    );

    res.status(201).json({
      message: 'Timetable entry created successfully',
      timetable: result.rows[0]
    });

  } catch (error) {
    console.error('Timetable creation error:', error);
    res.status(500).json({ error: 'Failed to create timetable entry' });
  }
});

// Get timetable for a class
router.get('/class/:classId', authenticateToken, async (req, res) => {
  try {
    const { classId } = req.params;

    // Enforce tenant access via class's school
    if (req.user.role !== 'super_admin') {
      const classResult = await query('SELECT school_id FROM classes WHERE id = $1', [classId]);
      if (classResult.rows.length === 0) {
        return res.status(404).json({ error: 'Class not found' });
      }
      const schoolId = classResult.rows[0].school_id;
      const accessResult = await query(
        'SELECT 1 FROM school_users WHERE user_id = $1 AND school_id = $2 AND is_active = true',
        [req.user.id, schoolId]
      );
      if (accessResult.rows.length === 0) {
        return res.status(403).json({ error: 'No access to this class' });
      }
    }

    const timetableResult = await query(
      `SELECT t.*, s.name as subject_name, s.code as subject_code,
              u.first_name as teacher_first_name, u.last_name as teacher_last_name
       FROM timetables t
       JOIN subjects s ON t.subject_id = s.id
       JOIN users u ON t.teacher_id = u.id
       WHERE t.class_id = $1
       ORDER BY t.day_of_week, t.start_time`,
      [classId]
    );

    res.json({ timetable: timetableResult.rows });

  } catch (error) {
    console.error('Timetable fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch timetable' });
  }
});

module.exports = router;
