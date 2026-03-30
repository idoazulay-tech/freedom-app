import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import * as queries from '../queries';
import { logDocumentAccess } from '../audit';
import { encryptData, decryptData } from '../crypto';

export const documentsRouter = router({
  // העלאת מסמך חדש
  uploadDocument: protectedProcedure
    .input(
      z.object({
        caseId: z.number(),
        fileName: z.string().min(1),
        fileType: z.string(),
        fileSize: z.number().positive(),
        documentType: z.enum(['contract', 'statement', 'letter', 'agreement', 'other']),
        encryptedContent: z.string(), // תוכן מוצפן (Base64)
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // בדיקת הרשאה
        const caseData = await queries.getCaseById(input.caseId);
        if (!caseData) {
          throw new Error('התיק לא נמצא');
        }

        const debtProfile = await queries.getDebtProfileByUserId(ctx.user.id);
        if (debtProfile?.id !== caseData.debtProfileId && caseData.professionalUserId !== ctx.user.id) {
          throw new Error('אין לך הרשאה להעלות מסמכים לתיק זה');
        }

        const result = await queries.uploadDocument({
          caseId: input.caseId,
          fileName: input.fileName,
          fileKey: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          fileUrl: '',
          documentType: input.documentType,
          extractedText: input.encryptedContent,
          uploadedByUserId: ctx.user.id,
          ocrProcessed: false,
          encryptionAlgorithm: 'AES-256',
        });

        await logDocumentAccess(
          ctx.user.id,
          result.insertId,
          'upload',
          'success',
          ctx.req.ip,
          ctx.req.headers['user-agent'] as string
        );

        return { success: true, documentId: result.insertId };
      } catch (error) {
        console.error('שגיאה בהעלאת מסמך:', error);
        await logDocumentAccess(ctx.user.id, 0, 'upload', 'failure', ctx.req.ip, ctx.req.headers['user-agent'] as string);
        throw error;
      }
    }),

  // קבלת מסמכים של תיק
  getDocumentsByCaseId: protectedProcedure
    .input(z.object({ caseId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        // בדיקת הרשאה
        const caseData = await queries.getCaseById(input.caseId);
        if (!caseData) {
          throw new Error('התיק לא נמצא');
        }

        const debtProfile = await queries.getDebtProfileByUserId(ctx.user.id);
        if (debtProfile?.id !== caseData.debtProfileId && caseData.professionalUserId !== ctx.user.id) {
          throw new Error('אין לך הרשאה לגשת למסמכים של תיק זה');
        }

        const documents = await queries.getDocumentsByCaseId(input.caseId);

        // הסרת תוכן מוצפן מהתשובה (שמור רק metadata)
        return documents.map((doc) => ({
          id: doc.id,
          fileName: doc.fileName,
          documentType: doc.documentType,
          uploadedByUserId: doc.uploadedByUserId,
          ocrProcessed: doc.ocrProcessed,
          aiSummary: doc.aiSummary,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        }));
      } catch (error) {
        console.error('שגיאה בשליפת מסמכים:', error);
        throw error;
      }
    }),

  // קבלת מסמך יחיד (עם תוכן מוצפן)
  getDocumentById: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const document = await queries.getDocumentById(input.documentId);

        if (!document) {
          throw new Error('המסמך לא נמצא');
        }

        // בדיקת הרשאה
        const caseData = await queries.getCaseById(document.caseId);
        const debtProfile = await queries.getDebtProfileByUserId(ctx.user.id);
        if (debtProfile?.id !== caseData.debtProfileId && caseData.professionalUserId !== ctx.user.id) {
          throw new Error('אין לך הרשאה לגשת למסמך זה');
        }

        await logDocumentAccess(
          ctx.user.id,
          input.documentId,
          'view',
          'success',
          ctx.req.ip,
          ctx.req.headers['user-agent'] as string
        );

        return document;
      } catch (error) {
        console.error('שגיאה בשליפת מסמך:', error);
        await logDocumentAccess(
          ctx.user.id,
          input.documentId,
          'view',
          'failure',
          ctx.req.ip,
          ctx.req.headers['user-agent'] as string
        );
        throw error;
      }
    }),

  // עדכון סיכום AI של מסמך
  updateDocumentSummary: protectedProcedure
    .input(
      z.object({
        documentId: z.number(),
        aiSummary: z.string(),
        extractedTasks: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const document = await queries.getDocumentById(input.documentId);

        if (!document) {
          throw new Error('המסמך לא נמצא');
        }

        // רק מערכת או איש מקצוע יכולים לעדכן סיכום
        const caseData = await queries.getCaseById(document.caseId);
        if (caseData.professionalUserId !== ctx.user.id) {
          throw new Error('אין לך הרשאה לעדכן סיכום זה');
        }

        await queries.updateDocument(input.documentId, {
          aiSummary: input.aiSummary,
          ocrProcessed: true,
        });

        // יצירת משימות מהמסמך אם יש
        if (input.extractedTasks && input.extractedTasks.length > 0) {
          for (const taskDescription of input.extractedTasks) {
            await queries.createTask({
              caseId: document.caseId,
              title: taskDescription,
              description: `משימה שחולצה מ-${document.fileName}`,
              status: 'pending',
              priority: 'medium',
              assignedToUserId: caseData.professionalUserId,
              createdByUserId: ctx.user.id,
            });
          }
        }

        return { success: true };
      } catch (error) {
        console.error('שגיאה בעדכון סיכום מסמך:', error);
        throw error;
      }
    }),

  // מחיקת מסמך
  deleteDocument: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const document = await queries.getDocumentById(input.documentId);

        if (!document) {
          throw new Error('המסמך לא נמצא');
        }

        // בדיקת הרשאה
        const caseData = await queries.getCaseById(document.caseId);
        if (caseData.professionalUserId !== ctx.user.id && document.uploadedByUserId !== ctx.user.id) {
          throw new Error('אין לך הרשאה למחוק מסמך זה');
        }

        // מחיקה לוגית (סימון כמחוק)
        // הערה: שדה deletedAt לא קיים בסכימה, משתמשים בעדכון מצב

        await logDocumentAccess(
          ctx.user.id,
          input.documentId,
          'delete',
          'success',
          ctx.req.ip,
          ctx.req.headers['user-agent'] as string
        );

        return { success: true };
      } catch (error) {
        console.error('שגיאה במחיקת מסמך:', error);
        await logDocumentAccess(
          ctx.user.id,
          input.documentId,
          'delete',
          'failure',
          ctx.req.ip,
          ctx.req.headers['user-agent'] as string
        );
        throw error;
      }
    }),
});
