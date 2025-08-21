import { Router } from 'express';
import prisma from '../lib/prisma';
import { hashPassword } from '../utils/password';

const router = Router();

// POST /api/schools - Public endpoint to create a new school and owner admin
router.post('/', async (req, res) => {
  try {
    const {
      name,
      code,
      country,
      city,
      address,
      locale,
      levels,
      owner,
    } = req.body as {
      name: string;
      code: string;
      country?: string;
      city?: string;
      address?: string;
      locale?: string;
      levels?: string[];
      owner: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone?: string;
      };
    };

    if (!name || !code || !owner?.email || !owner?.password || !owner?.firstName || !owner?.lastName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Ensure school code is unique
    const existingSchool = await prisma.school.findUnique({ where: { code } });
    if (existingSchool) {
      return res.status(409).json({ error: 'School code already exists' });
    }

    // Ensure owner email not already used
    const existingOwner = await prisma.user.findUnique({ where: { email: owner.email } });
    if (existingOwner) {
      return res.status(409).json({ error: 'Owner email already in use' });
    }

    const school = await prisma.school.create({
      data: {
        name,
        code,
        country: country || null,
        city: city || null,
        address: address || null,
        locale: locale || null,
        features: {},
      },
    });

    const passwordHash = await hashPassword(owner.password);
    const admin = await prisma.user.create({
      data: {
        email: owner.email,
        password: passwordHash,
        firstName: owner.firstName,
        lastName: owner.lastName,
        phone: owner.phone || null,
        role: 'school_admin',
        schoolId: school.id,
      },
    });

    return res.status(201).json({
      school: { id: school.id, name: school.name, code: school.code },
      owner: { id: admin.id, email: admin.email, role: admin.role },
      message: 'School created successfully',
    });
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error('Create school error:', e);
    return res.status(500).json({ error: 'Failed to create school' });
  }
});

// GET /api/schools/search/public?q=
router.get('/search/public', async (req, res) => {
  try {
    const q = (req.query.q as string) || '';
    const schools = await prisma.school.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { code: { contains: q, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { name: 'asc' },
      take: 20,
    });
    return res.json({ schools });
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error('Search schools error:', e);
    return res.status(500).json({ error: 'Failed to search schools' });
  }
});

export default router;
