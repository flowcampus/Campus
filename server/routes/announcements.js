const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken, requireSchoolAccess, requireRole } = require('../middleware/auth');

const router = express.Router();

// Create announcement
router.post('/school/:schoolId', authenticateToken, requireSchoolAccess, requireRole(['super_admin', 'school_admin', 'teacher']), [
  body('title').trim().isLength({ min: 1 }),
  body('content').trim().isLength({ min: 1 }),
  body('targetAudience').isIn(['all', 'students', 'teachers', 'parents', 'staff']),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { schoolId } = req.params;
    const { title, content, targetAudience, priority = 'normal', publishDate, expiresAt } = req.body;

    const result = await query(
      `INSERT INTO announcements (school_id, title, content, target_audience, priority, publish_date, expires_at, created_by, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [schoolId, title, content, targetAudience, priority, publishDate || new Date(), expiresAt, req.user.id, true]
    );

    res.status(201).json({
      message: 'Announcement created successfully',
      announcement: result.rows[0]
    });

  } catch (error) {
    console.error('Announcement creation error:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

// Get announcements for a school
router.get('/school/:schoolId', authenticateToken, requireSchoolAccess, async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { targetAudience, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE a.school_id = $1 AND a.is_published = true AND (a.expires_at IS NULL OR a.expires_at > CURRENT_TIMESTAMP)';
    const params = [schoolId];
    let paramCount = 1;

    if (targetAudience) {
      paramCount++;
      whereClause += ` AND (a.target_audience = $${paramCount} OR a.target_audience = 'all')`;
      params.push(targetAudience);
    }

    const announcementsResult = await query(
      `SELECT a.*, u.first_name as author_first_name, u.last_name as author_last_name
       FROM announcements a
       JOIN users u ON a.created_by = u.id
       ${whereClause}
       ORDER BY a.priority DESC, a.publish_date DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );

    res.json({ announcements: announcementsResult.rows });

  } catch (error) {
    console.error('Announcements fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

module.exports = router;
