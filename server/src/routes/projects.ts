import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.get('/public', async (_req, res) => {
  const projects = await prisma.project.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ projects });
});

export default router;
