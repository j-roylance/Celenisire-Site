import { Router } from 'express';
import { z } from 'zod';
import { InterestArea } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

const router = Router();

const subscriberSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  interestArea: z.nativeEnum(InterestArea),
  message: z.string().max(2000).optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'You must consent to receive updates' }),
  }),
});

router.post('/', async (req, res) => {
  try {
    const body = subscriberSchema.parse(req.body);
    const subscriber = await prisma.subscriber.upsert({
      where: { email: body.email },
      update: {
        name: body.name,
        interestArea: body.interestArea,
        message: body.message,
        consent: body.consent,
      },
      create: body,
    });
    res.status(201).json({ subscriber: { id: subscriber.id, message: 'Successfully subscribed!' } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

export default router;
