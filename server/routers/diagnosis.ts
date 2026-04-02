import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { diagnoses } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

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
});
