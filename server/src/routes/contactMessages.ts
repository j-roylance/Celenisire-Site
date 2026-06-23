import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const router = Router();

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  topic: z.string().min(1).max(100),
  message: z.string().min(1).max(5000),
});

router.post('/', async (req, res) => {
  try {
    const body = contactSchema.parse(req.body);
    const message = await prisma.contactMessage.create({ data: body });
    res.status(201).json({ message: { id: message.id, status: 'Message received' } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
