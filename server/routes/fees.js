const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, transaction } = require('../config/database');
const { authenticateToken, requireSchoolAccess, requireRole } = require('../middleware/auth');

const router = express.Router();

// Create fee structure
router.post('/structure/school/:schoolId', authenticateToken, requireSchoolAccess, requireRole(['super_admin', 'school_admin']), [
  body('academicTermId').isUUID(),
  body('feeType').trim().isLength({ min: 1 }),
  body('amount').isNumeric(),
  body('dueDate').optional().isISO8601(),
  body('isMandatory').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { schoolId } = req.params;
    const { classId, academicTermId, feeType, amount, dueDate, isMandatory, description } = req.body;

    const result = await query(
      `INSERT INTO fee_structures (school_id, class_id, academic_term_id, fee_type, amount, due_date, is_mandatory, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [schoolId, classId, academicTermId, feeType, amount, dueDate, isMandatory || true, description]
    );

    res.status(201).json({
      message: 'Fee structure created successfully',
      feeStructure: result.rows[0]
    });

  } catch (error) {
    console.error('Fee structure creation error:', error);
    res.status(500).json({ error: 'Failed to create fee structure' });
  }
});

// Get fee structures for a school
router.get('/structure/school/:schoolId', authenticateToken, requireSchoolAccess, async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { termId, classId } = req.query;

    let whereClause = 'WHERE fs.school_id = $1';
    const params = [schoolId];
    let paramCount = 1;

    if (termId) {
      paramCount++;
      whereClause += ` AND fs.academic_term_id = $${paramCount}`;
      params.push(termId);
    }

    if (classId) {
      paramCount++;
      whereClause += ` AND fs.class_id = $${paramCount}`;
      params.push(classId);
    }

    const feeStructuresResult = await query(
      `SELECT fs.*, at.name as term_name, c.name as class_name, c.level as class_level
       FROM fee_structures fs
       JOIN academic_terms at ON fs.academic_term_id = at.id
       LEFT JOIN classes c ON fs.class_id = c.id
       ${whereClause}
       ORDER BY at.start_date DESC, c.level, fs.fee_type`,
      params
    );

    res.json({ feeStructures: feeStructuresResult.rows });

  } catch (error) {
    console.error('Fee structures fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch fee structures' });
  }
});

// Record fee payment
router.post('/payment', authenticateToken, requireRole(['super_admin', 'school_admin', 'teacher']), [
  body('studentId').isUUID(),
  body('feeStructureId').isUUID(),
  body('amountPaid').isNumeric(),
  body('paymentMethod').isIn(['cash', 'bank_transfer', 'card', 'mobile_money', 'smartsave']),
  body('paymentReference').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { studentId, feeStructureId, amountPaid, paymentMethod, paymentReference, paymentDate } = req.body;

    const result = await query(
      `INSERT INTO fee_payments (student_id, fee_structure_id, amount_paid, payment_method, payment_reference, payment_date, recorded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [studentId, feeStructureId, amountPaid, paymentMethod, paymentReference, paymentDate || new Date(), req.user.id]
    );

    res.status(201).json({
      message: 'Fee payment recorded successfully',
      payment: result.rows[0]
    });

  } catch (error) {
    console.error('Fee payment recording error:', error);
    res.status(500).json({ error: 'Failed to record fee payment' });
  }
});

// Get student fee status
router.get('/student/:studentId/status', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { termId } = req.query;

    let termFilter = '';
    const params = [studentId];
    let paramCount = 1;

    if (termId) {
      paramCount++;
      termFilter = ` AND fs.academic_term_id = $${paramCount}`;
      params.push(termId);
    }

    const feeStatusResult = await query(
      `SELECT fs.*, 
              COALESCE(SUM(fp.amount_paid), 0) as total_paid,
              (fs.amount - COALESCE(SUM(fp.amount_paid), 0)) as balance,
              CASE 
                WHEN COALESCE(SUM(fp.amount_paid), 0) >= fs.amount THEN 'paid'
                WHEN COALESCE(SUM(fp.amount_paid), 0) > 0 THEN 'partial'
                ELSE 'unpaid'
              END as payment_status,
              at.name as term_name, c.name as class_name
       FROM fee_structures fs
       JOIN academic_terms at ON fs.academic_term_id = at.id
       LEFT JOIN classes c ON fs.class_id = c.id
       LEFT JOIN fee_payments fp ON fs.id = fp.fee_structure_id AND fp.student_id = $1 AND fp.status = 'completed'
       WHERE (fs.class_id IS NULL OR fs.class_id = (SELECT class_id FROM students WHERE id = $1))
       AND fs.school_id = (SELECT school_id FROM students WHERE id = $1)
       ${termFilter}
       GROUP BY fs.id, at.id, c.id
       ORDER BY fs.due_date ASC`,
      params
    );

    res.json({ feeStatus: feeStatusResult.rows });

  } catch (error) {
    console.error('Student fee status error:', error);
    res.status(500).json({ error: 'Failed to fetch student fee status' });
  }
});

// Get fee payments for a student
router.get('/student/:studentId/payments', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const paymentsResult = await query(
      `SELECT fp.*, fs.fee_type, fs.amount as fee_amount, at.name as term_name,
              u.first_name as recorded_by_first_name, u.last_name as recorded_by_last_name
       FROM fee_payments fp
       JOIN fee_structures fs ON fp.fee_structure_id = fs.id
       JOIN academic_terms at ON fs.academic_term_id = at.id
       JOIN users u ON fp.recorded_by = u.id
       WHERE fp.student_id = $1
       ORDER BY fp.payment_date DESC, fp.created_at DESC
       LIMIT $2 OFFSET $3`,
      [studentId, limit, offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) FROM fee_payments WHERE student_id = $1',
      [studentId]
    );

    res.json({
      payments: paymentsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });

  } catch (error) {
    console.error('Student payments fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch student payments' });
  }
});

// Get school fee summary
router.get('/school/:schoolId/summary', authenticateToken, requireSchoolAccess, async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { termId } = req.query;

    let termFilter = '';
    const params = [schoolId];
    let paramCount = 1;

    if (termId) {
      paramCount++;
      termFilter = ` AND fs.academic_term_id = $${paramCount}`;
      params.push(termId);
    }

    const summaryResult = await query(
      `SELECT 
        SUM(fs.amount) as total_expected,
        COALESCE(SUM(fp.amount_paid), 0) as total_collected,
        COUNT(DISTINCT CASE WHEN fp.amount_paid >= fs.amount THEN s.id END) as students_paid,
        COUNT(DISTINCT s.id) as total_students,
        (SUM(fs.amount) - COALESCE(SUM(fp.amount_paid), 0)) as outstanding_balance
       FROM fee_structures fs
       LEFT JOIN students s ON (fs.class_id IS NULL OR fs.class_id = s.class_id) AND s.school_id = fs.school_id AND s.status = 'active'
       LEFT JOIN fee_payments fp ON fs.id = fp.fee_structure_id AND fp.student_id = s.id AND fp.status = 'completed'
       WHERE fs.school_id = $1 ${termFilter}`,
      params
    );

    const summary = summaryResult.rows[0];
    const collectionRate = summary.total_expected > 0 
      ? (summary.total_collected / summary.total_expected * 100).toFixed(2)
      : 0;

    res.json({
      summary: {
        totalExpected: parseFloat(summary.total_expected || 0),
        totalCollected: parseFloat(summary.total_collected || 0),
        outstandingBalance: parseFloat(summary.outstanding_balance || 0),
        studentsPaid: parseInt(summary.students_paid || 0),
        totalStudents: parseInt(summary.total_students || 0),
        collectionRate: parseFloat(collectionRate)
      }
    });

  } catch (error) {
    console.error('Fee summary error:', error);
    res.status(500).json({ error: 'Failed to fetch fee summary' });
  }
});

module.exports = router;
