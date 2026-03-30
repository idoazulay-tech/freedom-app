import { getDb } from './db';
import { eq, and, desc } from 'drizzle-orm';
import {
  debtProfiles,
  cases,
  documents,
  tasks,
  consentRecords,
  professionalProfiles,
  notifications,
} from '../drizzle/schema';
import type {
  InsertDebtProfile,
  InsertCase,
  InsertDocument,
  InsertTask,
  InsertConsentRecord,
  InsertNotification,
} from '../drizzle/schema';

/**
 * Create a new debt profile for a debtor
 */
export async function createDebtProfile(
  userId: number,
  data: Omit<InsertDebtProfile, 'userId'>
): Promise<any> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db.insert(debtProfiles).values({
    userId,
    ...data,
  });

  return result;
}

/**
 * Get debt profile by user ID
 */
export async function getDebtProfileByUserId(userId: number): Promise<any> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db
    .select()
    .from(debtProfiles)
    .where(eq(debtProfiles.userId, userId))
    .limit(1);

  return result[0] || null;
}

/**
 * Update debt profile
 */
export async function updateDebtProfile(
  debtProfileId: number,
  data: Partial<InsertDebtProfile>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db
    .update(debtProfiles)
    .set(data)
    .where(eq(debtProfiles.id, debtProfileId));
}

/**
 * Create a new case (link debtor to professional)
 */
export async function createCase(data: InsertCase): Promise<any> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db.insert(cases).values(data);
  return result;
}

/**
 * Get case by ID
 */
export async function getCaseById(caseId: number): Promise<any> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db
    .select()
    .from(cases)
    .where(eq(cases.id, caseId))
    .limit(1);

  return result[0] || null;
}

/**
 * Get cases by debt profile ID
 */
export async function getCasesByDebtProfileId(debtProfileId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  return await db
    .select()
    .from(cases)
    .where(eq(cases.debtProfileId, debtProfileId));
}

/**
 * Get cases assigned to a professional
 */
export async function getCasesByProfessionalId(professionalUserId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  return await db
    .select()
    .from(cases)
    .where(eq(cases.professionalUserId, professionalUserId));
}

/**
 * Update case status
 */
export async function updateCaseStatus(
  caseId: number,
  status: 'open' | 'in_progress' | 'closed' | 'on_hold'
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db
    .update(cases)
    .set({ status, updatedAt: new Date() })
    .where(eq(cases.id, caseId));
}

/**
 * Upload document
 */
export async function uploadDocument(data: InsertDocument): Promise<any> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db.insert(documents).values(data);
  return result;
}

/**
 * Get documents by case ID
 */
export async function getDocumentsByCaseId(caseId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  return await db
    .select()
    .from(documents)
    .where(eq(documents.caseId, caseId))
    .orderBy(desc(documents.createdAt));
}

/**
 * Get document by ID
 */
export async function getDocumentById(documentId: number): Promise<any> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  return result[0] || null;
}

/**
 * Update document (mark as OCR processed, add summary, etc.)
 */
export async function updateDocument(
  documentId: number,
  data: Partial<InsertDocument>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db
    .update(documents)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(documents.id, documentId));
}

/**
 * Create task
 */
export async function createTask(data: InsertTask): Promise<any> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db.insert(tasks).values(data);
  return result;
}

/**
 * Get tasks by case ID
 */
export async function getTasksByCaseId(caseId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  return await db
    .select()
    .from(tasks)
    .where(eq(tasks.caseId, caseId))
    .orderBy(desc(tasks.dueDate));
}

/**
 * Get tasks assigned to user
 */
export async function getTasksByAssignedUser(userId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  return await db
    .select()
    .from(tasks)
    .where(eq(tasks.assignedToUserId, userId))
    .orderBy(desc(tasks.dueDate));
}

/**
 * Update task status
 */
export async function updateTaskStatus(
  taskId: number,
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const completedAt = status === 'completed' ? new Date() : null;

  await db
    .update(tasks)
    .set({ status, completedAt, updatedAt: new Date() })
    .where(eq(tasks.id, taskId));
}

/**
 * Record consent
 */
export async function recordConsent(data: InsertConsentRecord): Promise<any> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db.insert(consentRecords).values(data);
  return result;
}

/**
 * Get user consent records
 */
export async function getUserConsentRecords(userId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  return await db
    .select()
    .from(consentRecords)
    .where(eq(consentRecords.userId, userId))
    .orderBy(desc(consentRecords.createdAt));
}

/**
 * Check if user has given specific consent
 */
export async function hasUserConsent(
  userId: number,
  consentType: 'data_processing' | 'ai_analysis' | 'professional_sharing' | 'communication'
): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db
    .select()
    .from(consentRecords)
    .where(
      and(
        eq(consentRecords.userId, userId),
        eq(consentRecords.consentType, consentType),
        eq(consentRecords.consentGiven, true)
      )
    )
    .limit(1);

  return result.length > 0;
}

/**
 * Create notification
 */
export async function createNotification(data: InsertNotification): Promise<any> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db.insert(notifications).values(data);
  return result;
}

/**
 * Get user notifications
 */
export async function getUserNotifications(userId: number, limit: number = 50): Promise<any[]> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(eq(notifications.id, notificationId));
}

/**
 * Get professional profile
 */
export async function getProfessionalProfile(userId: number): Promise<any> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db
    .select()
    .from(professionalProfiles)
    .where(eq(professionalProfiles.userId, userId))
    .limit(1);

  return result[0] || null;
}

/**
 * Create or update professional profile
 */
export async function upsertProfessionalProfile(
  userId: number,
  data: Partial<InsertDebtProfile>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const existing = await getProfessionalProfile(userId);

  if (existing) {
    await db
      .update(professionalProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(professionalProfiles.userId, userId));
  } else {
    await db.insert(professionalProfiles).values({
      userId,
      ...data,
    });
  }
}
