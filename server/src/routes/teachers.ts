import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/teachers/school/:schoolId
router.get('/school/:schoolId', async (req, res) => {
  const { schoolId } = req.params;
  try {
    const teachers = await prisma.teacher.findMany({ where: { schoolId } });
    return res.json(teachers);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

// POST /api/teachers/school/:schoolId
router.post('/school/:schoolId', async (req, res) => {
  const { schoolId } = req.params;
  const { firstName, lastName, email } = req.body;
  try {
    const teacher = await prisma.teacher.create({
      data: { firstName, lastName, email, schoolId },
    });
    return res.json(teacher);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to create teacher' });
  }
});

// GET /api/teachers/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const teacher = await prisma.teacher.findUnique({ where: { id } });
    if (!teacher) return res.status(404).json({ error: 'Not found' });
    return res.json(teacher);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch teacher' });
  }
});

// PUT /api/teachers/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email } = req.body;
  try {
    const teacher = await prisma.teacher.update({
      where: { id },
      data: { firstName, lastName, email },
    });
    return res.json(teacher);
  } catch {
    return res.status(500).json({ error: 'Failed to update teacher' });
  }
});

export default router;
