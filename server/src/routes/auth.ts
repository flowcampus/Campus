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
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

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
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== 'admin') return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await comparePassword(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signJwt({ sub: user.id, role: user.role });
    return res.json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, schoolId: user.schoolId }, token });
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

export default router;
