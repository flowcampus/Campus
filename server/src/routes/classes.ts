import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/classes/school/:schoolId
router.get('/school/:schoolId', async (req, res) => {
  const { schoolId } = req.params;
  try {
    const classes = await prisma.classRoom.findMany({ where: { schoolId } });
    return res.json(classes);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// POST /api/classes/school/:schoolId
router.post('/school/:schoolId', async (req, res) => {
  const { schoolId } = req.params;
  const { name, capacity } = req.body;
  try {
    const classRoom = await prisma.classRoom.create({
      data: { name, capacity: capacity ?? 40, schoolId },
    });
    return res.json(classRoom);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to create class' });
  }
});

// GET /api/classes/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const classRoom = await prisma.classRoom.findUnique({ where: { id } });
    if (!classRoom) return res.status(404).json({ error: 'Not found' });
    return res.json(classRoom);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch class' });
  }
});

// PUT /api/classes/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, capacity } = req.body;
  try {
    const classRoom = await prisma.classRoom.update({
      where: { id },
      data: { name, capacity },
    });
    return res.json(classRoom);
  } catch {
    return res.status(500).json({ error: 'Failed to update class' });
  }
});

export default router;
