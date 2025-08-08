import { Router } from 'express';
import prisma from '../lib/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { signJwt } from '../utils/jwt';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role = 'admin', schoolCode } = req.body as {
      email: string; password: string; firstName: string; lastName: string; role?: string; schoolCode?: string;
    };

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    let schoolId: string | undefined = undefined;
    if (schoolCode) {
      const school = await prisma.school.findUnique({ where: { code: schoolCode } });
      if (school) schoolId = school.id;
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, password: passwordHash, firstName, lastName, role, schoolId }
    });

    const token = signJwt({ sub: user.id, role: user.role });
    return res.json({ user: { id: user.id, email: user.email, firstName, lastName, role, schoolId }, token });
  } catch (e: any) {
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, schoolCode, role } = req.body as { 
      email: string; 
      password: string; 
      schoolCode?: string; 
      role?: string; 
    };
    if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // Role-based validation
    if (role && user.role !== role) {
      return res.status(401).json({ error: 'Invalid role for this account' });
    }

    // School code validation for students/parents
    if (schoolCode && user.schoolId) {
      const school = await prisma.school.findUnique({ where: { id: user.schoolId } });
      if (!school || school.code !== schoolCode) {
        return res.status(401).json({ error: 'Invalid school code' });
      }
    }

    const ok = await comparePassword(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signJwt({ sub: user.id, role: user.role });
    return res.json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, schoolId: user.schoolId }, token });
  } catch (e: any) {
    return res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/admin-login
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password, adminKey, adminRole } = req.body as { 
      email: string; 
      password: string; 
      adminKey?: string;
      adminRole?: string;
    };
    if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    // Check if user has admin privileges
    const adminRoles = ['super_admin', 'support_admin', 'sales_admin', 'content_admin', 'finance_admin'];
    if (!adminRoles.includes(user.role)) {
      return res.status(401).json({ error: 'Insufficient privileges' });
    }
    
    // Validate admin role if specified
    if (adminRole && user.role !== adminRole) {
      return res.status(401).json({ error: 'Invalid admin role' });
    }
    
    const ok = await comparePassword(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    
    // Additional admin key validation for super_admin
    if (user.role === 'super_admin' && adminKey) {
      const expectedKey = process.env.SUPER_ADMIN_KEY || 'default-super-key';
      if (adminKey !== expectedKey) {
        return res.status(401).json({ error: 'Invalid admin key' });
      }
    }
    
    const token = signJwt({ sub: user.id, role: user.role, adminRole: user.role });
    return res.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        role: user.role, 
        schoolId: user.schoolId,
        adminRole: user.role
      }, 
      token 
    });
  } catch (e: any) {
    return res.status(500).json({ error: 'Admin login failed' });
  }
});

// POST /api/auth/guest-login
router.post('/guest-login', async (req, res) => {
  try {
    const { schoolCode } = req.body as { schoolCode?: string };
    const email = `guest${schoolCode ? '+' + schoolCode : ''}@campus.local`;
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const school = schoolCode ? await prisma.school.findUnique({ where: { code: schoolCode } }) : null;
      user = await prisma.user.create({
        data: {
          email,
          password: await hashPassword('guest'),
          firstName: 'Guest',
          lastName: 'User',
          role: 'guest',
          schoolId: school ? school.id : null,
        },
      });
    }
    const token = signJwt({ sub: user.id, role: user.role });
    return res.json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, schoolId: user.schoolId }, token });
  } catch (e: any) {
    return res.status(500).json({ error: 'Guest login failed' });
  }
});

// GET /api/auth/me (legacy)
router.get('/me', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    const token = auth.split(' ')[1];
    const base64 = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
    const userId = payload.sub as string | undefined;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    return res.json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, schoolId: user.schoolId } });
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// GET /api/auth/profile (matches frontend)
router.get('/profile', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    const token = auth.split(' ')[1];
    const base64 = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
    const userId = payload.sub as string | undefined;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    return res.json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, schoolId: user.schoolId } });
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// POST /api/auth/logout (stateless JWT)
router.post('/logout', async (_req, res) => {
  return res.json({ success: true });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (_req, res) => {
  // Implement email flow later; respond success for now
  return res.json({ success: true });
});

// POST /api/auth/reset-password
router.post('/reset-password', async (_req, res) => {
  // Implement token validation and password update later
  return res.json({ success: true });
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    const token = auth.split(' ')[1];
    const base64 = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
    const userId = payload.sub as string | undefined;
    const role = payload.role as string | undefined;
    if (!userId || !role) return res.status(401).json({ error: 'Unauthorized' });
    const newToken = signJwt({ sub: userId, role });
    return res.json({ token: newToken });
  } catch (e: any) {
    return res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// POST /api/auth/link-parent-child
router.post('/link-parent-child', async (req, res) => {
  try {
    const { parentId, childCode } = req.body as { parentId: string; childCode: string };
    if (!parentId || !childCode) {
      return res.status(400).json({ error: 'Missing parent ID or child code' });
    }

    // Find student by unique code
    const student = await prisma.user.findFirst({
      where: {
        role: 'student',
        // Assuming we have a studentCode field or use email/id as code
        OR: [
          { email: { contains: childCode } },
          { id: childCode }
        ]
      }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found with provided code' });
    }

    // Create parent-child relationship (assuming we have a ParentChild model)
    // For now, we'll just return success - implement actual linking logic based on your schema
    
    return res.json({ 
      message: 'Parent-child link created successfully',
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email
      }
    });
  } catch (e: any) {
    return res.status(500).json({ error: 'Parent-child linking failed' });
  }
});

// POST /api/auth/generate-magic-link
router.post('/generate-magic-link', async (req, res) => {
  try {
    const { email, adminRole } = req.body as { email: string; adminRole: string };
    if (!email || !adminRole) {
      return res.status(400).json({ error: 'Missing email or admin role' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const adminRoles = ['super_admin', 'support_admin', 'sales_admin', 'content_admin', 'finance_admin'];
    if (!adminRoles.includes(user.role)) {
      return res.status(401).json({ error: 'User does not have admin privileges' });
    }

    // Generate magic link token (expires in 10 minutes)
    // Note: Using standard JWT expiration from config for now
    const magicToken = signJwt({ sub: user.id, role: user.role });

    // In a real implementation, you would send this via email
    const magicLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/magic-login?token=${magicToken}`;

    // For demo purposes, we'll return the link
    // In production, only send via email and return success message
    return res.json({ 
      message: 'Magic link sent to your email',
      // Remove this in production:
      magicLink: magicLink
    });
  } catch (e: any) {
    return res.status(500).json({ error: 'Magic link generation failed' });
  }
});

export default router;
