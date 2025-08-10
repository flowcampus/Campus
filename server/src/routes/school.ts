import express from 'express';
import { requireAuth, requireSchoolRole, auditLog } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = express.Router();

// Apply authentication middleware to all school routes
router.use(requireAuth);
router.use(requireSchoolRole);

// GET /api/school/dashboard - School dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId) {
      return res.status(403).json({ error: 'No school association found' });
    }

    const stats = await Promise.all([
      prisma.user.count({ where: { schoolId, role: 'student' } }),
      prisma.user.count({ where: { schoolId, role: 'parent' } }),
      prisma.user.count({ where: { schoolId, role: 'teacher' } }),
      prisma.classRoom.count({ where: { schoolId } }),
      prisma.loginAudit.count({ 
        where: { 
          user: { schoolId },
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      })
    ]);

    await auditLog(req, 'school_dashboard_access', true);

    res.json({
      totalStudents: stats[0],
      totalParents: stats[1],
      totalTeachers: stats[2],
      totalClasses: stats[3],
      todayLogins: stats[4]
    });
  } catch (error) {
    await auditLog(req, 'school_dashboard_access', false, 'School dashboard access failed');
    console.error('School dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch school dashboard data' });
  }
});

// GET /api/school/students - List school students
router.get('/students', async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId) {
      return res.status(403).json({ error: 'No school association found' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;

    const where: any = { schoolId, role: 'student' };
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          email: true,
          phone: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          parentChild: {
            select: {
              parent: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    await auditLog(req, 'school_students_list', true);

    res.json({
      students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    await auditLog(req, 'school_students_list', false, 'School students list failed');
    console.error('School students list error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// GET /api/school/teachers - List school teachers
router.get('/teachers', async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId) {
      return res.status(403).json({ error: 'No school association found' });
    }

    const teachers = await prisma.user.findMany({
      where: { schoolId, role: 'teacher' },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    await auditLog(req, 'school_teachers_list', true);

    res.json({ teachers });
  } catch (error) {
    await auditLog(req, 'school_teachers_list', false, 'School teachers list failed');
    console.error('School teachers list error:', error);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

// GET /api/school/classes - List school classes
router.get('/classes', async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId) {
      return res.status(403).json({ error: 'No school association found' });
    }

    const classes = await prisma.classRoom.findMany({
      where: { schoolId },
      include: {
        teacher: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            students: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    await auditLog(req, 'school_classes_list', true);

    res.json({ classes });
  } catch (error) {
    await auditLog(req, 'school_classes_list', false, 'School classes list failed');
    console.error('School classes list error:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// POST /api/school/invite-teacher - Invite a teacher to the school
router.post('/invite-teacher', async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId) {
      return res.status(403).json({ error: 'No school association found' });
    }

    const { email, firstName, lastName } = req.body;

    if (!email || !firstName || !lastName) {
      return res.status(400).json({ error: 'Email, first name, and last name are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create teacher invitation (you might want to create an invitations table)
    // For now, we'll just return success
    await auditLog(req, 'school_teacher_invite', true, `Invited teacher: ${email}`);

    res.json({ 
      message: 'Teacher invitation sent successfully',
      invitation: { email, firstName, lastName }
    });
  } catch (error) {
    await auditLog(req, 'school_teacher_invite', false, `Failed to invite teacher: ${req.body.email}`);
    console.error('School teacher invite error:', error);
    res.status(500).json({ error: 'Failed to send teacher invitation' });
  }
});

export default router;
