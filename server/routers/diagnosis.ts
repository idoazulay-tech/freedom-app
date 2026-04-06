import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { diagnoses } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { matchDebtorToProfessional } from "../ai/matching";

// Mock professionals database
const PROFESSIONALS = [
  {
    id: 1,
    name: 'עו"ד דוד כהן',
    specialty: 'עורך דין (חדלות פירעון)',
    phone: '050-1234567',
    email: 'david@law.co.il',
    rating: 4.8,
    reviews: 42,
    experience: 15,
    description: 'מתמחה בחדלות פירעון והליכים משפטיים',
  },
  {
    id: 2,
    name: 'יועץ כלכלי - מוטי לוי',
    specialty: 'יועץ כלכלי',
    phone: '050-2345678',
    email: 'moti@financial.co.il',
    rating: 4.6,
    reviews: 38,
    experience: 12,
    description: 'ייעוץ בתכנון תקציב והסדרת חובות',
  },
  {
    id: 3,
    name: 'רו"ח שרה משה',
    specialty: 'רואה חשבון / יועץ מס',
    phone: '050-3456789',
    email: 'sara@accounting.co.il',
    rating: 4.7,
    reviews: 35,
    experience: 18,
    description: 'מומחית בחובות מס וניהול כלכלי',
  },
  {
    id: 4,
    name: 'מלווה שיקום - אלי גרין',
    specialty: 'מלווה שיקום כלכלי',
    phone: '050-4567890',
    email: 'eli@coaching.co.il',
    rating: 4.5,
    reviews: 28,
    experience: 10,
    description: 'ליווי ארוך טווח בשיקום כלכלי',
  },
  {
    id: 5,
    name: 'מומחה בנכסים - רות כרמל',
    specialty: 'מומחה בנכסים',
    phone: '050-5678901',
    email: 'rut@assets.co.il',
    rating: 4.9,
    reviews: 45,
    experience: 20,
    description: 'מומחית בבעיות משכנתא ונכסים',
  },
  {
    id: 6,
    name: 'מתווך הסדרות - יוסי בן',
    specialty: 'מתווך הסדרות',
    phone: '050-6789012',
    email: 'yosi@mediation.co.il',
    rating: 4.4,
    reviews: 32,
    experience: 14,
    description: 'משא ומתן עם נושים והסדרות',
  },
];

export const diagnosisRouter = router({
  save: protectedProcedure
    .input(
      z.object({
        riskScore: z.number(),
        riskLevel: z.string(),
        totalDebt: z.number(),
        monthlyIncome: z.number(),
        monthlyExpenses: z.number(),
        availableForDebt: z.number(),
        creditorCount: z.number(),
        hasEnforcement: z.boolean(),
        hasWarningLetters: z.boolean(),
        debts: z.array(z.any()),
        actions: z.array(z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .insert(diagnoses)
        .values({
          userId: ctx.user.id,
          totalRiskScore: input.riskScore,
          riskLevel: input.riskLevel,
          totalDebt: input.totalDebt,
          monthlyIncome: input.monthlyIncome,
          monthlyExpenses: input.monthlyExpenses,
          availableForDebt: input.availableForDebt,
          creditorCount: input.creditorCount,
          hasEnforcement: input.hasEnforcement,
          hasWarningLetters: input.hasWarningLetters,
          debtsData: JSON.stringify(input.debts),
          actionsData: JSON.stringify(input.actions),
        });

      return { success: true };
    }),

  getMine: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const result = await db
      .select()
      .from(diagnoses)
      .where(eq(diagnoses.userId, ctx.user.id))
      .orderBy(diagnoses.createdAt)
      .limit(1);

    return result[0] || null;
  }),

  hasProfile: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return false;

    const result = await db
      .select()
      .from(diagnoses)
      .where(eq(diagnoses.userId, ctx.user.id))
      .limit(1);

    return result.length > 0;
  }),

  // Get matched professionals based on diagnosis
  getMatchedProfessionals: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const diagnosis = await db
      .select()
      .from(diagnoses)
      .where(eq(diagnoses.userId, ctx.user.id))
      .orderBy(diagnoses.createdAt)
      .limit(1);

    if (!diagnosis.length) return [];

    const diag = diagnosis[0];

    try {
      // Call AI matching engine
      const matching = await matchDebtorToProfessional({
        severity: (diag.riskLevel as 'low' | 'medium' | 'high' | 'critical') || 'medium',
        persona: 'dana', // Default persona
        debtType: 'mixed',
        totalDebtAmount: diag.totalDebt.toString(),
        hasLegalNotices: diag.hasWarningLetters || false,
        hasCollectionActions: diag.hasEnforcement || false,
      });

      // Filter professionals based on matching recommendations
      const matchedProfessionals = PROFESSIONALS.filter((prof) =>
        matching.recommendedSpecialties.some((spec) =>
          prof.specialty.toLowerCase().includes(spec.toLowerCase())
        )
      ).map((prof) => ({
        ...prof,
        matchScore: matching.matchingScore,
        urgency: matching.urgencyLevel,
      } as any));

      return (matchedProfessionals.length > 0
        ? matchedProfessionals
        : PROFESSIONALS.slice(0, 3)) as any; // Return top 3 if no match
    } catch (error) {
      console.error('Error in professional matching:', error);
      return PROFESSIONALS.slice(0, 3); // Return top 3 as fallback
    }
  }),

  // Get all available professionals
  getAllProfessionals: protectedProcedure.query(() => {
    return PROFESSIONALS;
  }),

  // Request professional contact
  requestProfessional: protectedProcedure
    .input(
      z.object({
        professionalId: z.number(),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // In a real app, this would create a request record and send notifications
      return {
        success: true,
        message: `בקשה נשלחה ל-${PROFESSIONALS.find((p) => p.id === input.professionalId)?.name}`,
      };
    }),
});
