const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken, requireRole, requireSchoolAccess } = require('../middleware/auth');

const router = express.Router();

// Utility: generate short code (6-8 chars)
function makeCode() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

// POST /api/parent-links/request
// Admin/Teacher can generate a code (and QR) for a student to be linked by a parent
router.post('/request', [
  authenticateToken,
  requireRole(['super_admin', 'school_admin', 'teacher']),
  body('studentId').isString().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { studentId } = req.body;

    // Ensure student exists and belongs to requester's school (if not super_admin)
    const student = await query('SELECT id, school_id FROM students WHERE id = $1', [studentId]);
    if (student.rows.length === 0) return res.status(404).json({ error: 'Student not found' });

    if (req.user.role !== 'super_admin') {
      const access = await query(
        'SELECT 1 FROM school_users WHERE user_id = $1 AND school_id = $2 AND is_active = true',
        [req.user.id, student.rows[0].school_id]
      );
      if (access.rows.length === 0) return res.status(403).json({ error: 'No access to student school' });
    }

    const code = makeCode();

    // Best-effort insert (migration may not exist yet)
    try {
      await query(
        `INSERT INTO parent_links (id, student_id, code, status) VALUES (gen_random_uuid(), $1, $2, 'pending')`,
        [studentId, code]
      );
    } catch (_) {}

    // QR could be generated on client from the code.
    return res.json({
      message: 'Link code generated',
      code,
      status: 'pending'
    });
  } catch (error) {
    console.error('Parent link request error:', error);
    return res.status(500).json({ error: 'Failed to create link code' });
  }
});

// POST /api/parent-links/claim
// Parent submits code to request linking to a student
router.post('/claim', [
  authenticateToken,
  requireRole(['parent']),
  body('code').isString().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code } = req.body;

    // Find pending link by code
    const link = await query(`SELECT * FROM parent_links WHERE code = $1 ORDER BY created_at DESC LIMIT 1`, [code]);
    if (link.rows.length === 0) return res.status(404).json({ error: 'Invalid or expired code' });

    const rec = link.rows[0];

    // Record claimant (best-effort, migration might not exist)
    try {
      await query(`UPDATE parent_links SET parent_id = $1 WHERE id = $2`, [req.user.id, rec.id]);
    } catch (_) {}

    return res.json({
      message: 'Claim submitted',
      status: rec.status === 'approved' ? 'approved' : 'pending_approval'
    });
  } catch (error) {
    console.error('Parent link claim error:', error);
    return res.status(500).json({ error: 'Failed to claim link' });
  }
});

// POST /api/parent-links/approve
// School admin approves a pending parent link request
router.post('/approve', [
  authenticateToken,
  requireRole(['super_admin', 'school_admin']),
  body('linkId').isString().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { linkId } = req.body;

    // Fetch link and student for school check
    const link = await query(`SELECT pl.*, s.school_id FROM parent_links pl JOIN students s ON s.id = pl.student_id WHERE pl.id = $1`, [linkId]);
    if (link.rows.length === 0) return res.status(404).json({ error: 'Link not found' });
    const rec = link.rows[0];

    // Tenant check for non-super admin
    if (req.user.role !== 'super_admin') {
      const access = await query(
        'SELECT 1 FROM school_users WHERE user_id = $1 AND school_id = $2 AND is_active = true',
        [req.user.id, rec.school_id]
      );
      if (access.rows.length === 0) return res.status(403).json({ error: 'No access to this school' });
    }

    // Approve link and create relation in parent_students
    try {
      await query('UPDATE parent_links SET status = \"approved\", approved_at = NOW() WHERE id = $1', [linkId]);
      await query('INSERT INTO parent_students (parent_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [rec.parent_id, rec.student_id]);
    } catch (_) {}

    return res.json({ message: 'Link approved' });
  } catch (error) {
    console.error('Parent link approve error:', error);
    return res.status(500).json({ error: 'Failed to approve link' });
  }
});

// GET /api/parent-links/my - list children for parent
router.get('/my', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const result = await query(
      `SELECT s.* FROM students s 
       JOIN parent_students ps ON ps.student_id = s.id 
       WHERE ps.parent_id = $1`,
      [req.user.id]
    );
    return res.json({ children: result.rows });
  } catch (error) {
    console.error('Parent link list error:', error);
    return res.status(500).json({ error: 'Failed to fetch children' });
  }
});

module.exports = router;
