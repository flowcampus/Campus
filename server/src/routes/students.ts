import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/students/school/:schoolId
router.get('/school/:schoolId', async (req, res) => {
  const { schoolId } = req.params;
  try {
    const students = await prisma.student.findMany({ where: { schoolId } });
    return res.json(students);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// POST /api/students/school/:schoolId
router.post('/school/:schoolId', async (req, res) => {
  const { schoolId } = req.params;
  const { firstName, lastName, email, classId } = req.body;
  try {
    const student = await prisma.student.create({
      data: { firstName, lastName, email, schoolId, classId },
    });
    return res.json(student);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to create student' });
  }
});

// GET /api/students/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) return res.status(404).json({ error: 'Not found' });
    return res.json(student);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// PUT /api/students/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, classId } = req.body;
  try {
    const student = await prisma.student.update({
      where: { id },
      data: { firstName, lastName, email, classId },
    });
    return res.json(student);
  } catch {
    return res.status(500).json({ error: 'Failed to update student' });
  }
});

export default router;
