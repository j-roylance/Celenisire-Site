import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './lib/env.js';
import authRoutes from './routes/auth.js';
import donationPledgeRoutes from './routes/donationPledges.js';
import subscriberRoutes from './routes/subscribers.js';
import contactMessageRoutes from './routes/contactMessages.js';
import projectRoutes from './routes/projects.js';
import updateRoutes from './routes/updates.js';
import financialReportRoutes from './routes/financialReports.js';
import researchPublicationRoutes from './routes/researchPublications.js';
import adminRoutes from './routes/admin.js';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/donation-pledges', donationPledgeRoutes);
  app.use('/api/subscribers', subscriberRoutes);
  app.use('/api/contact-messages', contactMessageRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/updates', updateRoutes);
  app.use('/api/financial-reports', financialReportRoutes);
  app.use('/api/research-publications', researchPublicationRoutes);
  app.use('/api/admin', adminRoutes);

  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
