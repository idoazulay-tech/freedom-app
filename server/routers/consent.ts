import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import * as queries from '../queries';
import { logConsentEvent } from '../audit';

export const consentRouter = router({
  // רישום הסכמה
  recordConsent: protectedProcedure
    .input(
      z.object({
        consentType: z.enum(['data_processing', 'ai_analysis', 'professional_sharing', 'communication']),
        consentGiven: z.boolean(),
        consentText: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await queries.recordConsent({
          userId: ctx.user.id,
          consentType: input.consentType,
          consentGiven: input.consentGiven,
          consentText: input.consentText,
          expiresAt: input.consentGiven ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null,
        });

        await logConsentEvent(
          ctx.user.id,
          input.consentType,
          input.consentGiven,
          ctx.req.ip,
          ctx.req.headers['user-agent'] as string
        );

        return { success: true, consentId: result.insertId };
      } catch (error) {
        console.error('שגיאה ברישום הסכמה:', error);
        throw error;
      }
    }),

  // קבלת הסכמות של המשתמש
  getMyConsents: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await queries.getUserConsentRecords(ctx.user.id);
    } catch (error) {
      console.error('שגיאה בשליפת הסכמות:', error);
      throw error;
    }
  }),

  // בדיקה אם למשתמש יש הסכמה מסוימת
  hasConsent: protectedProcedure
    .input(
      z.object({
        consentType: z.enum(['data_processing', 'ai_analysis', 'professional_sharing', 'communication']),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const hasConsent = await queries.hasUserConsent(ctx.user.id, input.consentType);
        return { hasConsent };
      } catch (error) {
        console.error('שגיאה בבדיקת הסכמה:', error);
        throw error;
      }
    }),

  // שלילת הסכמה
  revokeConsent: protectedProcedure
    .input(
      z.object({
        consentType: z.enum(['data_processing', 'ai_analysis', 'professional_sharing', 'communication']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // רישום שלילת הסכמה
        const result = await queries.recordConsent({
          userId: ctx.user.id,
          consentType: input.consentType,
          consentGiven: false,
          consentText: `שלילת הסכמה ל-${input.consentType}`,
          expiresAt: null,
        });

        await logConsentEvent(
          ctx.user.id,
          input.consentType,
          false,
          ctx.req.ip,
          ctx.req.headers['user-agent'] as string
        );

        return { success: true };
      } catch (error) {
        console.error('שגיאה בשלילת הסכמה:', error);
        throw error;
      }
    }),

  // קבלת טקסט הסכמה (עבור תצוגה בממשק)
  getConsentText: protectedProcedure
    .input(
      z.object({
        consentType: z.enum(['data_processing', 'ai_analysis', 'professional_sharing', 'communication']),
      })
    )
    .query(async ({ ctx, input }) => {
      const consentTexts: Record<string, string> = {
        data_processing: `אני מסכים לעיבוד הנתונים האישיים שלי על ידי Freedom לצורך ניהול החוב שלי בהתאם לחוק הגנת הפרטיות, תיקון 13 (2024). הנתונים יישמרו בצורה מוצפנת וישמשו רק לצורך הטיפול בתיק שלי.`,
        ai_analysis: `אני מסכים לשימוש בטכנולוגיות AI (בינה מלאכותית) לניתוח המסמכים שלי, חילוץ משימות, וייצור סיכומים. ניתוח זה יעזור לי להבין טוב יותר את מצב החוב שלי.`,
        professional_sharing: `אני מסכים לשיתוף הנתונים שלי עם איש המקצוע (עורך דין, יועץ כלכלי) שהוקצה לתיק שלי. איש המקצוע יוכל לגשת למסמכים ולמשימות שלי כדי לספק לי שירות טוב יותר.`,
        communication: `אני מסכים לקבל התראות ותזכורות דרך WhatsApp, דוא"ל וערוצי תקשורת אחרים בנוגע למשימות, דדליינים ועדכונים בתיק שלי.`,
      };

      return {
        consentType: input.consentType,
        consentText: consentTexts[input.consentType] || '',
      };
    }),
});
