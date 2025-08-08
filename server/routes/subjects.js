const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken, requireSchoolAccess, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all subjects in a school
router.get('/school/:schoolId', authenticateToken, requireSchoolAccess, async (req, res) => {
  try {
    const { schoolId } = req.params;
    
    const subjectsResult = await query(
      `SELECT s.*, COUNT(DISTINCT cs.class_id) as class_count
       FROM subjects s
       LEFT JOIN class_subjects cs ON s.id = cs.subject_id
       WHERE s.school_id = $1
       GROUP BY s.id
       ORDER BY s.name`,
      [schoolId]
    );

    res.json({ subjects: subjectsResult.rows });

  } catch (error) {
    console.error('Subjects fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// Create new subject
router.post('/school/:schoolId', authenticateToken, requireSchoolAccess, requireRole(['super_admin', 'school_admin']), [
  body('name').trim().isLength({ min: 1 }),
  body('code').optional().trim(),
  body('isCore').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { schoolId } = req.params;
    const { name, code, description, isCore } = req.body;

    const result = await query(
      `INSERT INTO subjects (school_id, name, code, description, is_core)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [schoolId, name, code, description, isCore || false]
    );

    res.status(201).json({
      message: 'Subject created successfully',
      subject: result.rows[0]
    });

  } catch (error) {
    console.error('Subject creation error:', error);
    res.status(500).json({ error: 'Subject creation failed' });
  }
});

module.exports = router;
