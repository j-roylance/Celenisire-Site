import { prisma } from '../lib/prisma.js';

export async function logActivity(
  action: string,
  entityType: string,
  entityId: string | null,
  userId: string | null,
) {
  await prisma.activityLog.create({
    data: { action, entityType, entityId, userId },
  });
}
