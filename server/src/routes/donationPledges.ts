import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const router = Router();

const pledgeSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  amount: z.coerce.number().positive().max(1000000),
  message: z.string().max(2000).optional(),
  acknowledgedStatus: z.literal(true, {
    errorMap: () => ({ message: 'You must acknowledge the legal status' }),
  }),
});

router.post('/', async (req, res) => {
  try {
    const body = pledgeSchema.parse(req.body);
    const pledge = await prisma.donationPledge.create({
      data: {
        name: body.name,
        email: body.email,
        amount: body.amount,
        message: body.message,
        acknowledgedStatus: body.acknowledgedStatus,
      },
    });
    res.status(201).json({ pledge: { id: pledge.id, message: 'Thank you for your pledge!' } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
    res.status(500).json({ error: 'Failed to submit pledge' });
  }
});

export default router;
