const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken, requireSchoolAccess } = require('../middleware/auth');

const router = express.Router();

// Send message
router.post('/', authenticateToken, [
  body('recipientId').isUUID(),
  body('subject').optional().trim(),
  body('content').trim().isLength({ min: 1 }),
  body('messageType').optional().isIn(['direct', 'broadcast', 'notification'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { recipientId, subject, content, messageType = 'direct', schoolId } = req.body;

    const result = await query(
      `INSERT INTO messages (school_id, sender_id, recipient_id, subject, content, message_type)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [schoolId, req.user.id, recipientId, subject, content, messageType]
    );

    res.status(201).json({
      message: 'Message sent successfully',
      messageData: result.rows[0]
    });

  } catch (error) {
    console.error('Message sending error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get messages for user
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { type = 'received', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Users can only view their own messages
    if (req.user.id !== userId && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    let whereClause = '';
    if (type === 'sent') {
      whereClause = 'WHERE m.sender_id = $1';
    } else {
      whereClause = 'WHERE m.recipient_id = $1';
    }

    const messagesResult = await query(
      `SELECT m.*, 
              sender.first_name as sender_first_name, sender.last_name as sender_last_name,
              recipient.first_name as recipient_first_name, recipient.last_name as recipient_last_name
       FROM messages m
       JOIN users sender ON m.sender_id = sender.id
       JOIN users recipient ON m.recipient_id = recipient.id
       ${whereClause}
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({ messages: messagesResult.rows });

  } catch (error) {
    console.error('Messages fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Mark message as read
router.patch('/:messageId/read', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;

    const result = await query(
      'UPDATE messages SET is_read = true WHERE id = $1 AND recipient_id = $2 RETURNING id',
      [messageId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found or not authorized' });
    }

    res.json({ message: 'Message marked as read' });

  } catch (error) {
    console.error('Mark message read error:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

module.exports = router;
