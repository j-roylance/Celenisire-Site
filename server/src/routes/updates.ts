import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.get('/public', async (_req, res) => {
  const updates = await prisma.updatePost.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
      createdAt: true,
      author: { select: { name: true } },
    },
  });
  res.json({ updates });
});

router.get('/public/:slug', async (req, res) => {
  const update = await prisma.updatePost.findFirst({
    where: { slug: req.params.slug, published: true },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      body: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      author: { select: { name: true } },
    },
  });
  if (!update) {
    return res.status(404).json({ error: 'Update not found' });
  }
  res.json({ update });
});

export default router;
