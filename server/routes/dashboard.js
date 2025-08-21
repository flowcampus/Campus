const express = require('express');
const router = express.Router();

const { query } = require('../config/database');
const {
  authenticateToken,
  requireRole,
  requireAdminAccess,
} = require('../middleware/auth');

// Helper to derive active school from authenticated user
const getActiveSchoolId = (user) => user?.school_id || null;

// GET /dashboard/student
router.get('/student', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const userId = req.user.id;
    const schoolId = getActiveSchoolId(req.user);

    // Minimal sample aggregates; safe even if tables differ
    const [{ rows: attendanceRows }, { rows: gradesRows }] = await Promise.all([
      query('SELECT COUNT(*)::int AS days_present FROM attendance WHERE student_id = $1 AND status = $2', [userId, 'present']).catch(() => ({ rows: [{ days_present: 0 }] })),
      query('SELECT AVG(score)::float AS average_score FROM grades WHERE student_id = $1', [userId]).catch(() => ({ rows: [{ average_score: null }] })),
    ]);

    res.json({
      userId,
      schoolId,
      widgets: {
        daysPresent: attendanceRows[0]?.days_present ?? 0,
        averageScore: gradesRows[0]?.average_score ?? null,
      },
    });
  } catch (error) {
    console.error('Dashboard student error:', error);
    res.status(500).json({ error: 'Failed to load student dashboard' });
  }
});

// GET /dashboard/parent
router.get('/parent', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const userId = req.user.id;
    const schoolId = getActiveSchoolId(req.user);

    // Example: fetch linked children
    const children = await query(
      `SELECT s.id, s.first_name, s.last_name
       FROM parent_children pc
       JOIN students s ON pc.child_id = s.id
       WHERE pc.parent_id = $1`,
      [userId]
    ).catch(() => ({ rows: [] }));

    res.json({
      userId,
      schoolId,
      children: children.rows,
    });
  } catch (error) {
    console.error('Dashboard parent error:', error);
    res.status(500).json({ error: 'Failed to load parent dashboard' });
  }
});

// GET /dashboard/guest
router.get('/guest', authenticateToken, requireRole(['guest']), async (req, res) => {
  try {
    res.json({ message: 'Welcome guest! Limited demo access enabled.' });
  } catch (error) {
    console.error('Dashboard guest error:', error);
    res.status(500).json({ error: 'Failed to load guest dashboard' });
  }
});

// GET /dashboard/school
// Teachers and school admins can view; infer school from token context
router.get('/school', authenticateToken, requireRole(['teacher', 'school_admin']), async (req, res) => {
  try {
    const schoolId = getActiveSchoolId(req.user);
    if (!schoolId) {
      return res.status(400).json({ error: 'No active school in session' });
    }

    const [students, teachers, classes] = await Promise.all([
      query('SELECT COUNT(*)::int AS c FROM students WHERE school_id = $1', [schoolId]).catch(() => ({ rows: [{ c: 0 }] })),
      query('SELECT COUNT(*)::int AS c FROM teachers WHERE school_id = $1', [schoolId]).catch(() => ({ rows: [{ c: 0 }] })),
      query('SELECT COUNT(*)::int AS c FROM classes WHERE school_id = $1', [schoolId]).catch(() => ({ rows: [{ c: 0 }] })),
    ]);

    res.json({
      schoolId,
      totals: {
        students: students.rows[0]?.c ?? 0,
        teachers: teachers.rows[0]?.c ?? 0,
        classes: classes.rows[0]?.c ?? 0,
      }
    });
  } catch (error) {
    console.error('Dashboard school error:', error);
    res.status(500).json({ error: 'Failed to load school dashboard' });
  }
});

// GET /dashboard/admin
router.get('/admin', authenticateToken, requireAdminAccess, async (req, res) => {
  try {
    const [schools, users] = await Promise.all([
      query('SELECT COUNT(*)::int AS c FROM schools').catch(() => ({ rows: [{ c: 0 }] })),
      query('SELECT COUNT(*)::int AS c FROM users').catch(() => ({ rows: [{ c: 0 }] })),
    ]);

    res.json({
      totals: {
        schools: schools.rows[0]?.c ?? 0,
        users: users.rows[0]?.c ?? 0,
      },
      adminUser: {
        id: req.user.id,
        role: req.user.role,
        email: req.user.email,
      }
    });
  } catch (error) {
    console.error('Dashboard admin error:', error);
    res.status(500).json({ error: 'Failed to load admin dashboard' });
  }
});

module.exports = router;
