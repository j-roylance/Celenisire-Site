import { Router } from 'express';
import { z } from 'zod';
import { loginUser, registerUser } from '../auth/localProvider.js';
import { clearAuthCookie, setAuthCookie } from '../auth/jwt.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// TODO: Restrict admin registration before production
router.post('/register', async (req, res) => {
  try {
    const body = registerSchema.parse(req.body);
    const { user, token } = await registerUser(body.name, body.email, body.password);
    setAuthCookie(res, token);
    res.status(201).json({ user });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
    if (err instanceof Error && err.message === 'Email already registered') {
      return res.status(409).json({ error: err.message });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const body = loginSchema.parse(req.body);
    const { user, token } = await loginUser(body.email, body.password);
    setAuthCookie(res, token);
    res.json({ user });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

router.post('/logout', (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  });
  res.json({ user });
});

export default router;
