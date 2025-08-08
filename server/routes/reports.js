const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, requireSchoolAccess, requireRole } = require('../middleware/auth');

const router = express.Router();

// Generate student report card
router.get('/student/:studentId/report-card', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { termId } = req.query;

    if (!termId) {
      return res.status(400).json({ error: 'Term ID is required' });
    }

    // Get student details
    const studentResult = await query(
      `SELECT s.*, u.first_name, u.last_name, u.email,
              c.name as class_name, c.level as class_level,
              sch.name as school_name, sch.logo_url as school_logo,
              at.name as term_name, at.start_date, at.end_date
       FROM students s
       JOIN users u ON s.user_id = u.id
       JOIN classes c ON s.class_id = c.id
       JOIN schools sch ON s.school_id = sch.id
       JOIN academic_terms at ON at.id = $2
       WHERE s.id = $1`,
      [studentId, termId]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const student = studentResult.rows[0];

    // Get grades for the term
    const gradesResult = await query(
      `SELECT g.*, s.name as subject_name, s.code as subject_code, s.is_core,
              AVG(g.score) as average_score,
              COUNT(g.id) as assessment_count
       FROM grades g
       JOIN subjects s ON g.subject_id = s.id
       WHERE g.student_id = $1 AND g.academic_term_id = $2
       GROUP BY g.subject_id, s.id, s.name, s.code, s.is_core
       ORDER BY s.is_core DESC, s.name`,
      [studentId, termId]
    );

    // Get attendance summary
    const attendanceResult = await query(
      `SELECT 
        COUNT(*) as total_days,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present_days,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_days,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late_days
       FROM attendance a
       JOIN academic_terms at ON a.date BETWEEN at.start_date AND at.end_date
       WHERE a.student_id = $1 AND at.id = $2`,
      [studentId, termId]
    );

    const attendance = attendanceResult.rows[0];
    const attendanceRate = attendance.total_days > 0 
      ? ((attendance.present_days + attendance.late_days) / attendance.total_days * 100).toFixed(2)
      : 0;

    res.json({
      student,
      grades: gradesResult.rows,
      attendance: {
        ...attendance,
        attendanceRate: parseFloat(attendanceRate)
      }
    });

  } catch (error) {
    console.error('Report card generation error:', error);
    res.status(500).json({ error: 'Failed to generate report card' });
  }
});

// Generate class performance report
router.get('/class/:classId/performance', authenticateToken, requireRole(['teacher', 'school_admin']), async (req, res) => {
  try {
    const { classId } = req.params;
    const { termId, subjectId } = req.query;

    let whereClause = 'WHERE s.class_id = $1';
    const params = [classId];
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

    const performanceResult = await query(
      `SELECT u.first_name, u.last_name, s.student_id,
              sub.name as subject_name,
              AVG(g.score) as average_score,
              COUNT(g.id) as assessment_count
       FROM students s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN grades g ON s.id = g.student_id
       LEFT JOIN subjects sub ON g.subject_id = sub.id
       ${whereClause}
       GROUP BY s.id, u.id, sub.id
       ORDER BY u.first_name, u.last_name, sub.name`,
      params
    );

    res.json({ performance: performanceResult.rows });

  } catch (error) {
    console.error('Class performance report error:', error);
    res.status(500).json({ error: 'Failed to generate class performance report' });
  }
});

// Generate school analytics report
router.get('/school/:schoolId/analytics', authenticateToken, requireSchoolAccess, requireRole(['school_admin', 'super_admin']), async (req, res) => {
  try {
    const { schoolId } = req.params;

    // Get comprehensive school statistics
    const analyticsResult = await query(
      `SELECT 
        (SELECT COUNT(*) FROM students WHERE school_id = $1 AND status = 'active') as total_students,
        (SELECT COUNT(*) FROM teachers WHERE school_id = $1 AND status = 'active') as total_teachers,
        (SELECT COUNT(*) FROM classes WHERE school_id = $1) as total_classes,
        (SELECT COUNT(*) FROM subjects WHERE school_id = $1) as total_subjects,
        (SELECT COALESCE(AVG(score), 0) FROM grades g JOIN students s ON g.student_id = s.id WHERE s.school_id = $1) as average_grade,
        (SELECT COALESCE(SUM(amount_paid), 0) FROM fee_payments fp JOIN students s ON fp.student_id = s.id WHERE s.school_id = $1 AND fp.payment_date >= CURRENT_DATE - INTERVAL '30 days') as monthly_revenue`,
      [schoolId]
    );

    // Get enrollment trends (last 6 months)
    const enrollmentResult = await query(
      `SELECT 
        DATE_TRUNC('month', admission_date) as month,
        COUNT(*) as new_enrollments
       FROM students 
       WHERE school_id = $1 AND admission_date >= CURRENT_DATE - INTERVAL '6 months'
       GROUP BY DATE_TRUNC('month', admission_date)
       ORDER BY month`,
      [schoolId]
    );

    // Get grade distribution
    const gradeDistributionResult = await query(
      `SELECT 
        CASE 
          WHEN score >= 80 THEN 'A'
          WHEN score >= 70 THEN 'B'
          WHEN score >= 60 THEN 'C'
          WHEN score >= 50 THEN 'D'
          ELSE 'F'
        END as grade_band,
        COUNT(*) as count
       FROM grades g
       JOIN students s ON g.student_id = s.id
       WHERE s.school_id = $1
       GROUP BY grade_band
       ORDER BY grade_band`,
      [schoolId]
    );

    res.json({
      analytics: analyticsResult.rows[0],
      enrollmentTrends: enrollmentResult.rows,
      gradeDistribution: gradeDistributionResult.rows
    });

  } catch (error) {
    console.error('School analytics error:', error);
    res.status(500).json({ error: 'Failed to generate school analytics' });
  }
});

module.exports = router;
