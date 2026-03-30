import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import * as queries from '../queries';
import { logCaseAccess } from '../audit';

export const casesRouter = router({
  // יצירת פרופיל חוב חדש (נקודת כניסה ל-Triage)
  createDebtProfile: protectedProcedure
    .input(
      z.object({
        totalDebtAmount: z.string().min(1),
        debtType: z.enum(['bank', 'credit_card', 'personal_loan', 'mortgage', 'tax', 'other']),
        severity: z.enum(['low', 'medium', 'high', 'critical']),
        persona: z.enum(['yossi', 'dana', 'avi']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await queries.createDebtProfile(ctx.user.id, {
          ...input,
          status: 'new',
          triageCompletedAt: new Date(),
        });

        if (!result?.insertId) {
          throw new Error('Failed to create debt profile - no insert ID returned');
        }

        await logCaseAccess(
          ctx.user.id,
          result.insertId,
          'create',
          'success',
          ctx.req.ip,
          ctx.req.headers['user-agent'] as string
        );

        return { success: true, debtProfileId: result.insertId };
      } catch (error) {
        console.error('שגיאה ביצירת פרופיל חוב:', error);
        await logCaseAccess(ctx.user.id, 0, 'create', 'failure', ctx.req.ip, ctx.req.headers['user-agent'] as string);
        throw error;
      }
    }),

  // קבלת פרופיל החוב של המשתמש
  getMyDebtProfile: protectedProcedure.query(async ({ ctx }) => {
    try {
      const profile = await queries.getDebtProfileByUserId(ctx.user.id);
      return profile;
    } catch (error) {
      console.error('שגיאה בשליפת פרופיל חוב:', error);
      throw error;
    }
  }),

  // קבלת תיק לפי ID
  getCaseById: protectedProcedure
    .input(z.object({ caseId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const caseData = await queries.getCaseById(input.caseId);

        if (!caseData) {
          throw new Error('התיק לא נמצא');
        }

        // בדיקת הרשאה
        const debtProfile = await queries.getDebtProfileByUserId(ctx.user.id);
        if (debtProfile?.id !== caseData.debtProfileId && caseData.professionalUserId !== ctx.user.id) {
          throw new Error('אין לך הרשאה לגשת לתיק זה');
        }

        await logCaseAccess(
          ctx.user.id,
          input.caseId,
          'view',
          'success',
          ctx.req.ip,
          ctx.req.headers['user-agent'] as string
        );
        return caseData;
      } catch (error) {
        console.error('שגיאה בשליפת תיק:', error);
        await logCaseAccess(
          ctx.user.id,
          input.caseId,
          'view',
          'failure',
          ctx.req.ip,
          ctx.req.headers['user-agent'] as string
        );
        throw error;
      }
    }),

  // קבלת כל התיקים של המשתמש
  getMyCases: protectedProcedure.query(async ({ ctx }) => {
    try {
      const debtProfile = await queries.getDebtProfileByUserId(ctx.user.id);

      if (debtProfile) {
        // המשתמש הוא חייב
        return await queries.getCasesByDebtProfileId(debtProfile.id);
      } else {
        // המשתמש הוא איש מקצוע
        return await queries.getCasesByProfessionalId(ctx.user.id);
      }
    } catch (error) {
      console.error('שגיאה בשליפת תיקים:', error);
      throw error;
    }
  }),

  // עדכון סטטוס התיק
  updateCaseStatus: protectedProcedure
    .input(
      z.object({
        caseId: z.number(),
        status: z.enum(['open', 'in_progress', 'closed', 'on_hold']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const caseData = await queries.getCaseById(input.caseId);

        if (!caseData) {
          throw new Error('התיק לא נמצא');
        }

        // רק איש המקצוע שהוקצה לתיק יכול לעדכן את הסטטוס
        if (caseData.professionalUserId !== ctx.user.id) {
          throw new Error('אין לך הרשאה לעדכן תיק זה');
        }

        await queries.updateCaseStatus(input.caseId, input.status);
        await logCaseAccess(
          ctx.user.id,
          input.caseId,
          'update',
          'success',
          ctx.req.ip,
          ctx.req.headers['user-agent'] as string
        );

        return { success: true };
      } catch (error) {
        console.error('שגיאה בעדכון סטטוס תיק:', error);
        await logCaseAccess(
          ctx.user.id,
          input.caseId,
          'update',
          'failure',
          ctx.req.ip,
          ctx.req.headers['user-agent'] as string
        );
        throw error;
      }
    }),
});
