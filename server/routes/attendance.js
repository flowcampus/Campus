const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, transaction } = require('../config/database');
const { authenticateToken, requireSchoolAccess, requireRole } = require('../middleware/auth');

const router = express.Router();

// Mark attendance for a class
router.post('/class/:classId', authenticateToken, requireRole(['teacher', 'school_admin']), [
  body('date').isISO8601(),
  body('attendance').isArray(),
  body('attendance.*.studentId').isUUID(),
  body('attendance.*.status').isIn(['present', 'absent', 'late', 'excused'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { classId } = req.params;
    const { date, attendance } = req.body;

    const result = await transaction(async (client) => {
      const attendanceRecords = [];

      for (const record of attendance) {
        // Check if attendance already exists for this student and date
        const existingResult = await client.query(
          'SELECT id FROM attendance WHERE student_id = $1 AND date = $2',
          [record.studentId, date]
        );

        if (existingResult.rows.length > 0) {
          // Update existing record
          await client.query(
            'UPDATE attendance SET status = $1, remarks = $2, marked_by = $3 WHERE student_id = $4 AND date = $5',
            [record.status, record.remarks || null, req.user.id, record.studentId, date]
          );
        } else {
          // Insert new record
          const insertResult = await client.query(
            'INSERT INTO attendance (student_id, class_id, date, status, remarks, marked_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [record.studentId, classId, date, record.status, record.remarks || null, req.user.id]
          );
          attendanceRecords.push(insertResult.rows[0]);
        }
      }

      return attendanceRecords;
    });

    res.json({
      message: 'Attendance marked successfully',
      records: result
    });

  } catch (error) {
    console.error('Attendance marking error:', error);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

// Get attendance for a class on a specific date
router.get('/class/:classId/date/:date', authenticateToken, async (req, res) => {
  try {
    const { classId, date } = req.params;

    const attendanceResult = await query(
      `SELECT a.*, s.student_id, u.first_name, u.last_name
       FROM attendance a
       JOIN students s ON a.student_id = s.id
       JOIN users u ON s.user_id = u.id
       WHERE a.class_id = $1 AND a.date = $2
       ORDER BY u.first_name, u.last_name`,
      [classId, date]
    );

    res.json({ attendance: attendanceResult.rows });

  } catch (error) {
    console.error('Attendance fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// Get attendance summary for a student
router.get('/student/:studentId/summary', authenticateToken, async (req, res) => {
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

    const summaryResult = await query(
      `SELECT 
        COUNT(*) as total_days,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present_days,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_days,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late_days,
        COUNT(CASE WHEN status = 'excused' THEN 1 END) as excused_days
       FROM attendance 
       WHERE student_id = $1 ${dateFilter}`,
      params
    );

    const summary = summaryResult.rows[0];
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
    console.error('Attendance summary error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance summary' });
  }
});

module.exports = router;
