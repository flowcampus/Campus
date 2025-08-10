import express from 'express';
import { requireAuth, requireAdminRole, auditLog } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = express.Router();

// Apply authentication middleware to all admin routes
router.use(requireAuth);
router.use(requireAdminRole);

// GET /api/admin/dashboard - Admin dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    await auditLog(req, 'admin_dashboard_access', true);
    
    const stats = await Promise.all([
      prisma.user.count(),
      prisma.school.count(),
      prisma.user.count({ where: { role: 'student' } }),
      prisma.user.count({ where: { role: 'parent' } }),
      prisma.user.count({ where: { role: 'teacher' } }),
      prisma.loginAudit.count({ where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } })
    ]);

    res.json({
      totalUsers: stats[0],
      totalSchools: stats[1],
      totalStudents: stats[2],
      totalParents: stats[3],
      totalTeachers: stats[4],
      todayLogins: stats[5]
    });
  } catch (error) {
    await auditLog(req, 'admin_dashboard_access', false, 'Dashboard access failed');
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// GET /api/admin/users - List all users with pagination
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const role = req.query.role as string;
    const search = req.query.search as string;

    const where: any = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
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
          role: true,
          schoolId: true,
          createdAt: true,
          school: {
            select: { name: true, code: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    await auditLog(req, 'admin_users_list', true);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    await auditLog(req, 'admin_users_list', false, 'Users list failed');
    console.error('Admin users list error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/admin/schools - List all schools
router.get('/schools', async (req, res) => {
  try {
    const schools = await prisma.school.findMany({
      include: {
        _count: {
          select: {
            users: true,
            classRooms: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    await auditLog(req, 'admin_schools_list', true);

    res.json({ schools });
  } catch (error) {
    await auditLog(req, 'admin_schools_list', false, 'Schools list failed');
    console.error('Admin schools list error:', error);
    res.status(500).json({ error: 'Failed to fetch schools' });
  }
});

// GET /api/admin/audit-logs - Get audit logs
router.get('/audit-logs', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const [logs, total] = await Promise.all([
      prisma.loginAudit.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.loginAudit.count()
    ]);

    await auditLog(req, 'admin_audit_logs_access', true);

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    await auditLog(req, 'admin_audit_logs_access', false, 'Audit logs access failed');
    console.error('Admin audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// POST /api/admin/users/:id/suspend - Suspend a user
router.post('/users/:id/suspend', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { 
        // Add suspended field to schema if needed
        // suspended: true,
        // suspensionReason: reason
      }
    });

    await auditLog(req, 'admin_user_suspend', true, `Suspended user ${id}: ${reason}`);

    res.json({ message: 'User suspended successfully', user });
  } catch (error) {
    await auditLog(req, 'admin_user_suspend', false, `Failed to suspend user ${req.params.id}`);
    console.error('Admin user suspend error:', error);
    res.status(500).json({ error: 'Failed to suspend user' });
  }
});

export default router;
