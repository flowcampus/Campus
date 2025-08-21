const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');

const router = express.Router();

// POST /api/guest/login - start guest session (optionally scoped to a school by code)
router.post('/login', [
  body('schoolCode').optional().isString().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { schoolCode } = req.body;

    const payload = { userId: 'guest', role: 'guest' };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    let school = null;
    if (schoolCode) {
      const s = await query('SELECT id, name, code FROM schools WHERE code = $1 AND is_active = true', [schoolCode]);
      if (s.rows.length > 0) {
        school = s.rows[0];
      }
    }

    // best-effort: persist a guest session if table exists
    try {
      await query(
        `INSERT INTO guest_sessions (id, school_id, expires_at) VALUES (gen_random_uuid(), $1, NOW() + INTERVAL '7 days')`,
        [school ? school.id : null]
      );
    } catch (_) {}

    return res.json({
      message: 'Guest session created',
      user: {
        id: 'guest',
        role: 'guest',
        firstName: 'Guest',
        lastName: 'User',
        ...(school ? { schoolId: school.id, schoolName: school.name, schoolCode: school.code } : {})
      },
      token,
      limitations: [
        'Read-only access',
        'Limited to public information',
        'Session expires in 7 days'
      ]
    });
  } catch (error) {
    console.error('Guest login error:', error);
    return res.status(500).json({ error: 'Guest login failed' });
  }
});

module.exports = router;
