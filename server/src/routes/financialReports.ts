import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

const publicSelect = {
  id: true,
  title: true,
  slug: true,
  periodLabel: true,
  summary: true,
  fileUrl: true,
  fileName: true,
  fileSize: true,
  sourceType: true,
  publishedAt: true,
  createdAt: true,
  author: { select: { name: true } },
};

router.get('/public', async (_req, res) => {
  const reports = await prisma.financialReport.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    select: publicSelect,
  });
  res.json({ reports });
});

router.get('/public/:slug', async (req, res) => {
  const report = await prisma.financialReport.findFirst({
    where: { slug: req.params.slug, published: true },
    select: {
      ...publicSelect,
      updatedAt: true,
    },
  });
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }
  res.json({ report });
});

export default router;
