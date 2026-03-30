import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import * as queries from '../queries';

export const tasksRouter = router({
  // יצירת משימה חדשה
  createTask: protectedProcedure
    .input(
      z.object({
        caseId: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
        dueDate: z.date().optional(),
        assignedToUserId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // בדיקת הרשאה
        const caseData = await queries.getCaseById(input.caseId);
        if (!caseData) {
          throw new Error('התיק לא נמצא');
        }

        // רק איש המקצוע או החייב יכולים ליצור משימות
        const debtProfile = await queries.getDebtProfileByUserId(ctx.user.id);
        if (debtProfile?.id !== caseData.debtProfileId && caseData.professionalUserId !== ctx.user.id) {
          throw new Error('אין לך הרשאה ליצור משימות בתיק זה');
        }

        const result = await queries.createTask({
          caseId: input.caseId,
          title: input.title,
          description: input.description,
          priority: input.priority || 'medium',
          dueDate: input.dueDate,
          assignedToUserId: input.assignedToUserId || caseData.professionalUserId,
          createdByUserId: ctx.user.id,
        });

        return { success: true, taskId: result.insertId };
      } catch (error) {
        console.error('שגיאה ביצירת משימה:', error);
        throw error;
      }
    }),

  // קבלת משימות של תיק
  getTasksByCaseId: protectedProcedure
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
          throw new Error('אין לך הרשאה לגשת למשימות של תיק זה');
        }

        return await queries.getTasksByCaseId(input.caseId);
      } catch (error) {
        console.error('שגיאה בשליפת משימות:', error);
        throw error;
      }
    }),

  // קבלת משימות שהוקצו למשתמש
  getMyTasks: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await queries.getTasksByAssignedUser(ctx.user.id);
    } catch (error) {
      console.error('שגיאה בשליפת המשימות שלי:', error);
      throw error;
    }
  }),

  // עדכון סטטוס משימה
  updateTaskStatus: protectedProcedure
    .input(
      z.object({
        taskId: z.number(),
        status: z.enum(['pending', 'in_progress', 'completed', 'blocked']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await queries.updateTaskStatus(input.taskId, input.status);
        return { success: true };
      } catch (error) {
        console.error('שגיאה בעדכון סטטוס משימה:', error);
        throw error;
      }
    }),
});
