import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

const publicSelect = {
  id: true,
  title: true,
  slug: true,
  abstract: true,
  authors: true,
  fileUrl: true,
  fileName: true,
  fileSize: true,
  sourceType: true,
  publishedAt: true,
  createdAt: true,
  author: { select: { name: true } },
};

router.get('/public', async (_req, res) => {
  const publications = await prisma.researchPublication.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    select: publicSelect,
  });
  res.json({ publications });
});

router.get('/public/:slug', async (req, res) => {
  const publication = await prisma.researchPublication.findFirst({
    where: { slug: req.params.slug, published: true },
    select: {
      ...publicSelect,
      updatedAt: true,
    },
  });
  if (!publication) {
    return res.status(404).json({ error: 'Publication not found' });
  }
  res.json({ publication });
});

export default router;
