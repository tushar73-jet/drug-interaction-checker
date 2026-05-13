import prisma from '../db/prismaClient';

/**
 * HIPAA-compliant audit logger for tracking clinical data access and mutations.
 */
export const auditLog = async (
  action: string,
  resource: string,
  clerkId?: string,
  payload?: any,
  ipAddress?: string
) => {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        resource,
        clerkId,
        payload,
        ipAddress
      }
    });
  } catch (error) {
    // Audit logging failures should not block the main operation,
    // but should be logged to the console for infrastructure monitoring.
    console.error('CRITICAL: Audit logging failed:', error);
  }
};
