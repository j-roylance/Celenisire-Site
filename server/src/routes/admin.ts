import { Router } from 'express';
import { z } from 'zod';
import {
  DonationStatus,
  MessageStatus,
  ProjectStatus,
  TransactionCategory,
  TransactionType,
  UserRole,
} from '@prisma/client';
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { logActivity } from '../services/activityLog.js';

const router = Router();

router.use(requireAuth);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Dashboard
router.get('/dashboard', requireRole(UserRole.ADMIN, UserRole.EDITOR, UserRole.ACCOUNTANT, UserRole.VIEWER), async (_req, res) => {
  const [
    pledgeCount,
    pledgeSum,
    subscriberCount,
    messageCount,
    projectCount,
    updateCount,
    recentActivity,
  ] = await Promise.all([
    prisma.donationPledge.count(),
    prisma.donationPledge.aggregate({ _sum: { amount: true } }),
    prisma.subscriber.count(),
    prisma.contactMessage.count({ where: { status: MessageStatus.new } }),
    prisma.project.count({ where: { status: { in: [ProjectStatus.active, ProjectStatus.researching, ProjectStatus.prototyping] } } }),
    prisma.updatePost.count({ where: { published: true } }),
    prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } },
    }),
  ]);

  res.json({
    stats: {
      pledgeCount,
      totalPledged: Number(pledgeSum._sum.amount ?? 0),
      subscriberCount,
      newMessageCount: messageCount,
      activeProjectCount: projectCount,
      publishedUpdateCount: updateCount,
    },
    recentActivity,
  });
});

// Users
router.get('/users', requireRole(UserRole.ADMIN), async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ users });
});

const updateUserSchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
});

router.patch('/users/:id', requireRole(UserRole.ADMIN), async (req: AuthRequest, res) => {
  try {
    const body = updateUserSchema.parse(req.body);
    if (req.params.id === req.user!.id && body.isActive === false) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: body,
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    });
    await logActivity('update_user', 'User', user.id, req.user!.id);
    res.json({ user });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Donation pledges
router.get('/donation-pledges', requireRole(UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER), async (_req, res) => {
  const pledges = await prisma.donationPledge.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ pledges });
});

router.patch('/donation-pledges/:id', requireRole(UserRole.ADMIN, UserRole.EDITOR), async (req: AuthRequest, res) => {
  try {
    const body = z.object({ status: z.nativeEnum(DonationStatus) }).parse(req.body);
    const pledge = await prisma.donationPledge.update({
      where: { id: req.params.id },
      data: { status: body.status },
    });
    await logActivity('update_pledge', 'DonationPledge', pledge.id, req.user!.id);
    res.json({ pledge });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
    res.status(500).json({ error: 'Failed to update pledge' });
  }
});

// Subscribers
router.get('/subscribers', requireRole(UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER), async (_req, res) => {
  const subscribers = await prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ subscribers });
});

// Contact messages
router.get('/contact-messages', requireRole(UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER), async (_req, res) => {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ messages });
});

router.patch('/contact-messages/:id', requireRole(UserRole.ADMIN, UserRole.EDITOR), async (req: AuthRequest, res) => {
  try {
    const body = z.object({ status: z.nativeEnum(MessageStatus) }).parse(req.body);
    const message = await prisma.contactMessage.update({
      where: { id: req.params.id },
      data: { status: body.status },
    });
    await logActivity('update_message', 'ContactMessage', message.id, req.user!.id);
    res.json({ message });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
    res.status(500).json({ error: 'Failed to update message' });
  }
});

// Accounting
router.get('/accounting', requireRole(UserRole.ADMIN, UserRole.ACCOUNTANT), async (req, res) => {
  const { type, category, from, to } = req.query;
  const where: Record<string, unknown> = {};
  if (type && typeof type === 'string') where.type = type;
  if (category && typeof category === 'string') where.category = category;
  if (from || to) {
    where.date = {};
    if (from) (where.date as Record<string, Date>).gte = new Date(from as string);
    if (to) (where.date as Record<string, Date>).lte = new Date(to as string);
  }

  const transactions = await prisma.accountingTransaction.findMany({
    where,
    orderBy: { date: 'desc' },
    include: { createdBy: { select: { name: true } } },
  });

  const income = transactions
    .filter((t: { type: TransactionType; amount: unknown }) => t.type === TransactionType.income)
    .reduce((sum: number, t: { amount: unknown }) => sum + Number(t.amount), 0);
  const expenses = transactions
    .filter((t: { type: TransactionType; amount: unknown }) => t.type === TransactionType.expense)
    .reduce((sum: number, t: { amount: unknown }) => sum + Number(t.amount), 0);

  res.json({ transactions, totals: { income, expenses, net: income - expenses } });
});

const transactionSchema = z.object({
  type: z.nativeEnum(TransactionType),
  date: z.coerce.date(),
  amount: z.coerce.number().positive(),
  category: z.nativeEnum(TransactionCategory),
  description: z.string().min(1).max(500),
  vendorOrSource: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
});

router.post('/accounting', requireRole(UserRole.ADMIN, UserRole.ACCOUNTANT), async (req: AuthRequest, res) => {
  try {
    const body = transactionSchema.parse(req.body);
    const transaction = await prisma.accountingTransaction.create({
      data: { ...body, createdById: req.user!.id },
      include: { createdBy: { select: { name: true } } },
    });
    await logActivity('create_transaction', 'AccountingTransaction', transaction.id, req.user!.id);
    res.status(201).json({ transaction });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

router.patch('/accounting/:id', requireRole(UserRole.ADMIN, UserRole.ACCOUNTANT), async (req: AuthRequest, res) => {
  try {
    const body = transactionSchema.partial().parse(req.body);
    const transaction = await prisma.accountingTransaction.update({
      where: { id: req.params.id },
      data: body,
      include: { createdBy: { select: { name: true } } },
    });
    await logActivity('update_transaction', 'AccountingTransaction', transaction.id, req.user!.id);
    res.json({ transaction });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

router.delete('/accounting/:id', requireRole(UserRole.ADMIN, UserRole.ACCOUNTANT), async (req: AuthRequest, res) => {
  await prisma.accountingTransaction.delete({ where: { id: req.params.id } });
  await logActivity('delete_transaction', 'AccountingTransaction', req.params.id, req.user!.id);
  res.json({ ok: true });
});

// Projects
router.get('/projects', requireRole(UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER), async (_req, res) => {
  const projects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ projects });
});

const projectSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).optional(),
  status: z.nativeEnum(ProjectStatus),
  impactArea: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  isPublic: z.boolean(),
});

router.post('/projects', requireRole(UserRole.ADMIN, UserRole.EDITOR), async (req: AuthRequest, res) => {
  try {
    const body = projectSchema.parse(req.body);
    const slug = body.slug || slugify(body.title);
    const project = await prisma.project.create({
      data: { ...body, slug },
    });
    await logActivity('create_project', 'Project', project.id, req.user!.id);
    res.status(201).json({ project });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.patch('/projects/:id', requireRole(UserRole.ADMIN, UserRole.EDITOR), async (req: AuthRequest, res) => {
  try {
    const body = projectSchema.partial().parse(req.body);
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: body,
    });
    await logActivity('update_project', 'Project', project.id, req.user!.id);
    res.json({ project });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
    res.status(500).json({ error: 'Failed to update project' });
  }
});

router.delete('/projects/:id', requireRole(UserRole.ADMIN, UserRole.EDITOR), async (req: AuthRequest, res) => {
  await prisma.project.delete({ where: { id: req.params.id } });
  await logActivity('delete_project', 'Project', req.params.id, req.user!.id);
  res.json({ ok: true });
});

// Updates
router.get('/updates', requireRole(UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER), async (_req, res) => {
  const updates = await prisma.updatePost.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { name: true } } },
  });
  res.json({ updates });
});

const updatePostSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).optional(),
  excerpt: z.string().min(1).max(500),
  body: z.string().min(1).max(50000),
  published: z.boolean(),
});

router.post('/updates', requireRole(UserRole.ADMIN, UserRole.EDITOR), async (req: AuthRequest, res) => {
  try {
    const body = updatePostSchema.parse(req.body);
    const slug = body.slug || slugify(body.title);
    const update = await prisma.updatePost.create({
      data: {
        ...body,
        slug,
        authorId: req.user!.id,
        publishedAt: body.published ? new Date() : null,
      },
      include: { author: { select: { name: true } } },
    });
    await logActivity('create_update', 'UpdatePost', update.id, req.user!.id);
    res.status(201).json({ update });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
    res.status(500).json({ error: 'Failed to create update' });
  }
});

router.patch('/updates/:id', requireRole(UserRole.ADMIN, UserRole.EDITOR), async (req: AuthRequest, res) => {
  try {
    const body = updatePostSchema.partial().parse(req.body);
    const existing = await prisma.updatePost.findUnique({ where: { id: req.params.id } });
    const data: Record<string, unknown> = { ...body };
    if (body.published === true && !existing?.publishedAt) {
      data.publishedAt = new Date();
    }
    if (body.published === false) {
      data.publishedAt = null;
    }
    const update = await prisma.updatePost.update({
      where: { id: req.params.id },
      data,
      include: { author: { select: { name: true } } },
    });
    await logActivity('update_update', 'UpdatePost', update.id, req.user!.id);
    res.json({ update });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
    res.status(500).json({ error: 'Failed to update post' });
  }
});

router.delete('/updates/:id', requireRole(UserRole.ADMIN, UserRole.EDITOR), async (req: AuthRequest, res) => {
  await prisma.updatePost.delete({ where: { id: req.params.id } });
  await logActivity('delete_update', 'UpdatePost', req.params.id, req.user!.id);
  res.json({ ok: true });
});

export default router;
