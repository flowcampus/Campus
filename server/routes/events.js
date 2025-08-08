const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken, requireSchoolAccess, requireRole } = require('../middleware/auth');

const router = express.Router();

// Create event
router.post('/school/:schoolId', authenticateToken, requireSchoolAccess, requireRole(['super_admin', 'school_admin', 'teacher']), [
  body('title').trim().isLength({ min: 1 }),
  body('eventType').isIn(['exam', 'holiday', 'meeting', 'sports', 'cultural', 'academic', 'other']),
  body('startDate').isISO8601(),
  body('endDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { schoolId } = req.params;
    const { title, description, eventType, startDate, endDate, location, targetAudience = 'all' } = req.body;

    const result = await query(
      `INSERT INTO events (school_id, title, description, event_type, start_date, end_date, location, target_audience, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [schoolId, title, description, eventType, startDate, endDate, location, targetAudience, req.user.id]
    );

    res.status(201).json({
      message: 'Event created successfully',
      event: result.rows[0]
    });

  } catch (error) {
    console.error('Event creation error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Get events for a school
router.get('/school/:schoolId', authenticateToken, requireSchoolAccess, async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { eventType, startDate, endDate, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE e.school_id = $1';
    const params = [schoolId];
    let paramCount = 1;

    if (eventType) {
      paramCount++;
      whereClause += ` AND e.event_type = $${paramCount}`;
      params.push(eventType);
    }

    if (startDate) {
      paramCount++;
      whereClause += ` AND e.start_date >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      whereClause += ` AND e.start_date <= $${paramCount}`;
      params.push(endDate);
    }

    const eventsResult = await query(
      `SELECT e.*, u.first_name as creator_first_name, u.last_name as creator_last_name
       FROM events e
       JOIN users u ON e.created_by = u.id
       ${whereClause}
       ORDER BY e.start_date ASC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );

    res.json({ events: eventsResult.rows });

  } catch (error) {
    console.error('Events fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

module.exports = router;
