import { getDb } from './db';
import { auditLogs } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import type { InsertAuditLog } from '../drizzle/schema';

/**
 * Log an audit event
 * Non-sensitive operation metadata only - no personal data in logs
 */
export async function logAuditEvent(
  userId: number | null,
  actionType: string,
  resourceType: string | null,
  resourceId: string | null,
  result: 'success' | 'failure' | 'denied',
  actionDetails?: Record<string, unknown>,
  errorMessage?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn('[Audit] Database not available');
      return;
    }

    const auditEntry: InsertAuditLog = {
      userId: userId || null,
      actionType,
      resourceType: resourceType || null,
      resourceId: resourceId || null,
      actionDetails: actionDetails || null,
      result,
      errorMessage: errorMessage || null,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    };

    await db.insert(auditLogs).values(auditEntry);
  } catch (error) {
    console.error('[Audit] Failed to log audit event:', error);
    // Don't throw - audit logging should not break the application
  }
}

/**
 * Log authentication event
 */
export async function logAuthEvent(
  userId: number | null,
  actionType: 'login' | 'logout' | 'login_failed' | '2fa_enabled' | '2fa_disabled' | 'webauthn_registered',
  result: 'success' | 'failure' | 'denied',
  ipAddress?: string,
  userAgent?: string,
  errorMessage?: string
): Promise<void> {
  await logAuditEvent(
    userId,
    `auth.${actionType}`,
    'user',
    userId?.toString() || null,
    result,
    { actionType },
    errorMessage,
    ipAddress,
    userAgent
  );
}

/**
 * Log document access event
 */
export async function logDocumentAccess(
  userId: number,
  documentId: number,
  action: 'view' | 'download' | 'upload' | 'delete',
  result: 'success' | 'failure' | 'denied',
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAuditEvent(
    userId,
    `document.${action}`,
    'document',
    documentId.toString(),
    result,
    { action },
    undefined,
    ipAddress,
    userAgent
  );
}

/**
 * Log case access event
 */
export async function logCaseAccess(
  userId: number,
  caseId: number,
  action: 'view' | 'update' | 'create' | 'delete',
  result: 'success' | 'failure' | 'denied',
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAuditEvent(
    userId,
    `case.${action}`,
    'case',
    caseId.toString(),
    result,
    { action },
    undefined,
    ipAddress,
    userAgent
  );
}

/**
 * Log consent event
 */
export async function logConsentEvent(
  userId: number,
  consentType: string,
  consentGiven: boolean,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAuditEvent(
    userId,
    'consent.recorded',
    'consent',
    consentType,
    'success',
    { consentType, consentGiven },
    undefined,
    ipAddress,
    userAgent
  );
}

/**
 * Log data access event for compliance
 */
export async function logDataAccess(
  userId: number,
  dataType: string,
  targetUserId: number,
  reason: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAuditEvent(
    userId,
    'data.access',
    dataType,
    targetUserId.toString(),
    'success',
    { dataType, reason },
    undefined,
    ipAddress,
    userAgent
  );
}

/**
 * Log AI operation event
 */
export async function logAIOperation(
  userId: number,
  operationType: string,
  resourceType: string,
  resourceId: string,
  result: 'success' | 'failure',
  ipAddress?: string,
  userAgent?: string,
  errorMessage?: string
): Promise<void> {
  await logAuditEvent(
    userId,
    `ai.${operationType}`,
    resourceType,
    resourceId,
    result,
    { operationType },
    errorMessage,
    ipAddress,
    userAgent
  );
}

/**
 * Get audit logs for a specific resource (for compliance review)
 */
export async function getResourceAuditLogs(
  resourceType: string,
  resourceId: string,
  limit: number = 100
): Promise<any[]> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn('[Audit] Database not available');
      return [];
    }

    const logs = await db
      .select()
      .from(auditLogs)
      .where(and(eq(auditLogs.resourceType, resourceType), eq(auditLogs.resourceId, resourceId)))
      .limit(limit);

    return logs;
  } catch (error) {
    console.error('[Audit] Failed to retrieve audit logs:', error);
    return [];
  }
}

/**
 * Get audit logs for a specific user
 */
export async function getUserAuditLogs(
  userId: number,
  limit: number = 100
): Promise<any[]> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn('[Audit] Database not available');
      return [];
    }

    const logs = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .limit(limit);

    return logs;
  } catch (error) {
    console.error('[Audit] Failed to retrieve audit logs:', error);
    return [];
  }
}
