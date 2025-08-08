const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get notifications for user
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const offset = (page - 1) * limit;

    // Users can only view their own notifications
    if (req.user.id !== userId && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    let whereClause = 'WHERE user_id = $1';
    const params = [userId];

    if (unreadOnly === 'true') {
      whereClause += ' AND is_read = false';
    }

    const notificationsResult = await query(
      `SELECT * FROM notifications
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [...params, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM notifications ${whereClause}`,
      params
    );

    res.json({
      notifications: notificationsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });

  } catch (error) {
    console.error('Notifications fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;

    const result = await query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING id',
      [notificationId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found or not authorized' });
    }

    res.json({ message: 'Notification marked as read' });

  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.patch('/user/:userId/read-all', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only mark their own notifications as read
    if (req.user.id !== userId && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    await query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
      [userId]
    );

    res.json({ message: 'All notifications marked as read' });

  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Get unread count
router.get('/user/:userId/unread-count', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only view their own notification count
    if (req.user.id !== userId && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const countResult = await query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );

    res.json({ unreadCount: parseInt(countResult.rows[0].count) });

  } catch (error) {
    console.error('Unread count fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

module.exports = router;
