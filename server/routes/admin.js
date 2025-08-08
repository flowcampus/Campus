const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, transaction } = require('../config/database');
const { authenticateToken, requireAdminAccess } = require('../middleware/auth');

const router = express.Router();

// Get platform overview (super admin only)
router.get('/overview', authenticateToken, requireAdminAccess, async (req, res) => {
  try {
    const overviewResult = await query(`
      SELECT 
        (SELECT COUNT(*) FROM schools WHERE is_active = true) as active_schools,
        (SELECT COUNT(*) FROM users WHERE is_active = true) as total_users,
        (SELECT COUNT(*) FROM students WHERE status = 'active') as total_students,
        (SELECT COUNT(*) FROM teachers WHERE status = 'active') as total_teachers,
        (SELECT COALESCE(SUM(amount_paid), 0) FROM fee_payments WHERE payment_date >= CURRENT_DATE - INTERVAL '30 days') as monthly_revenue,
        (SELECT COUNT(*) FROM schools WHERE subscription_plan != 'free') as paid_schools
    `);

    // Get subscription distribution
    const subscriptionResult = await query(`
      SELECT subscription_plan, COUNT(*) as count
      FROM schools 
      WHERE is_active = true
      GROUP BY subscription_plan
      ORDER BY subscription_plan
    `);

    // Get recent activity
    const activityResult = await query(`
      SELECT action, entity_type, created_at, 
             u.first_name, u.last_name
      FROM system_logs sl
      LEFT JOIN users u ON sl.user_id = u.id
      ORDER BY created_at DESC
      LIMIT 10
    `);

    res.json({
      overview: overviewResult.rows[0],
      subscriptionDistribution: subscriptionResult.rows,
      recentActivity: activityResult.rows
    });

  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({ error: 'Failed to fetch admin overview' });
  }
});

// Manage school subscriptions
router.put('/schools/:schoolId/subscription', authenticateToken, requireAdminAccess, [
  body('plan').isIn(['free', 'basic', 'pro', 'premium']),
  body('expiresAt').optional().isISO8601()
], async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { plan, expiresAt } = req.body;

    const result = await query(
      `UPDATE schools 
       SET subscription_plan = $1, subscription_expires_at = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, name, subscription_plan, subscription_expires_at`,
      [plan, expiresAt, schoolId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'School not found' });
    }

    // Log the action
    await query(
      'INSERT INTO system_logs (user_id, action, entity_type, entity_id, new_values) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'subscription_updated', 'school', schoolId, JSON.stringify({ plan, expiresAt })]
    );

    res.json({
      message: 'Subscription updated successfully',
      school: result.rows[0]
    });

  } catch (error) {
    console.error('Subscription update error:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

// Get system logs
router.get('/logs', authenticateToken, requireAdminAccess, async (req, res) => {
  try {
    const { page = 1, limit = 50, action, entityType, userId } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (action) {
      paramCount++;
      whereClause += ` AND action = $${paramCount}`;
      params.push(action);
    }

    if (entityType) {
      paramCount++;
      whereClause += ` AND entity_type = $${paramCount}`;
      params.push(entityType);
    }

    if (userId) {
      paramCount++;
      whereClause += ` AND user_id = $${paramCount}`;
      params.push(userId);
    }

    const logsResult = await query(
      `SELECT sl.*, u.first_name, u.last_name, u.email
       FROM system_logs sl
       LEFT JOIN users u ON sl.user_id = u.id
       ${whereClause}
       ORDER BY sl.created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM system_logs sl ${whereClause}`,
      params
    );

    res.json({
      logs: logsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });

  } catch (error) {
    console.error('System logs fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch system logs' });
  }
});

// Feature toggles management
router.put('/features/:schoolId', authenticateToken, requireAdminAccess, [
  body('features').isObject()
], async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { features } = req.body;

    const result = await query(
      `UPDATE schools 
       SET settings = COALESCE(settings, '{}') || $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, name, settings`,
      [JSON.stringify({ features }), schoolId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'School not found' });
    }

    // Log the action
    await query(
      'INSERT INTO system_logs (user_id, action, entity_type, entity_id, new_values) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'features_updated', 'school', schoolId, JSON.stringify({ features })]
    );

    res.json({
      message: 'Features updated successfully',
      school: result.rows[0]
    });

  } catch (error) {
    console.error('Features update error:', error);
    res.status(500).json({ error: 'Failed to update features' });
  }
});

// Send system-wide announcement
router.post('/broadcast', authenticateToken, requireAdminAccess, [
  body('title').trim().isLength({ min: 1 }),
  body('message').trim().isLength({ min: 1 }),
  body('targetAudience').optional().isIn(['all', 'schools', 'admins'])
], async (req, res) => {
  try {
    const { title, message, targetAudience = 'all' } = req.body;

    // Create notifications for target audience
    let targetUsers = [];

    if (targetAudience === 'all') {
      const usersResult = await query('SELECT id FROM users WHERE is_active = true');
      targetUsers = usersResult.rows;
    } else if (targetAudience === 'schools') {
      const usersResult = await query(
        'SELECT DISTINCT u.id FROM users u JOIN school_users su ON u.id = su.user_id WHERE u.is_active = true AND su.is_active = true'
      );
      targetUsers = usersResult.rows;
    } else if (targetAudience === 'admins') {
      const usersResult = await query(
        "SELECT id FROM users WHERE is_active = true AND role IN ('super_admin', 'school_admin')"
      );
      targetUsers = usersResult.rows;
    }

    // Insert notifications
    const notifications = targetUsers.map(user => [
      user.id, title, message, 'info', null
    ]);

    if (notifications.length > 0) {
      const placeholders = notifications.map((_, index) => 
        `($${index * 5 + 1}, $${index * 5 + 2}, $${index * 5 + 3}, $${index * 5 + 4}, $${index * 5 + 5})`
      ).join(', ');

      await query(
        `INSERT INTO notifications (user_id, title, message, type, school_id) VALUES ${placeholders}`,
        notifications.flat()
      );
    }

    // Log the action
    await query(
      'INSERT INTO system_logs (user_id, action, entity_type, new_values) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'broadcast_sent', 'notification', JSON.stringify({ title, targetAudience, recipientCount: targetUsers.length })]
    );

    res.json({
      message: 'Broadcast sent successfully',
      recipientCount: targetUsers.length
    });

  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({ error: 'Failed to send broadcast' });
  }
});

module.exports = router;
