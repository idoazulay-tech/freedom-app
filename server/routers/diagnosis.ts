import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { diagnoses } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { performDiagnosis } from "../diagnosis-agent";

export const diagnosisRouter = router({
  // Complete diagnosis with AI analysis
  performDiagnosis: protectedProcedure
    .input(
      z.object({
        debts: z.array(z.object({
          category: z.string(),
          amount: z.number(),
          monthsLate: z.number(),
          legalStatus: z.string(),
        })),
        monthlyIncome: z.number(),
        monthlyExpenses: z.number(),
        creditorCount: z.number(),
        hasEnforcement: z.boolean(),
        hasWarningLetters: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || !ctx.user.id) {
        throw new Error("User not authenticated");
      }

      // Run diagnosis agent
      const diagnosisResult = await performDiagnosis(input);

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Save to database
      await db
        .insert(diagnoses)
        .values({
          userId: ctx.user.id,
          totalRiskScore: Math.round(diagnosisResult.riskScore),
          riskLevel: diagnosisResult.riskLevel,
          totalDebt: Math.round(diagnosisResult.totalDebt),
          monthlyIncome: Math.round(input.monthlyIncome),
          monthlyExpenses: Math.round(input.monthlyExpenses),
          availableForDebt: Math.round(diagnosisResult.monthlyAvailable),
          creditorCount: input.creditorCount,
          hasEnforcement: input.hasEnforcement,
          hasWarningLetters: input.hasWarningLetters,
          debtsData: JSON.stringify(input.debts),
          actionsData: JSON.stringify(diagnosisResult.automatedTasks),
        });

      return {
        success: true,
        diagnosis: diagnosisResult,
        message: 'Diagnosis saved successfully',
      };
    }),

  // Legacy save method for backward compatibility
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
      if (!ctx.user || !ctx.user.id) {
        throw new Error("User not authenticated");
      }

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
    if (!ctx.user || !ctx.user.id) {
      throw new Error("User not authenticated");
    }

    const db = await getDb();
    if (!db) return null;

    const result = await db
      .select()
      .from(diagnoses)
      .where(eq(diagnoses.userId, ctx.user.id))
      .orderBy(desc(diagnoses.createdAt))
      .limit(1);

    if (!result.length) return null;

    const diagnosis = result[0];
    return {
      id: diagnosis.id,
      totalRiskScore: diagnosis.totalRiskScore,
      riskLevel: diagnosis.riskLevel,
      totalDebt: diagnosis.totalDebt,
      monthlyIncome: diagnosis.monthlyIncome,
      monthlyExpenses: diagnosis.monthlyExpenses,
      availableForDebt: diagnosis.availableForDebt,
      creditorCount: diagnosis.creditorCount,
      hasEnforcement: diagnosis.hasEnforcement,
      hasWarningLetters: diagnosis.hasWarningLetters,
      debts: diagnosis.debtsData ? JSON.parse(diagnosis.debtsData) : [],
      actions: diagnosis.actionsData ? JSON.parse(diagnosis.actionsData) : [],
      createdAt: diagnosis.createdAt,
    };
  }),

  hasProfile: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user || !ctx.user.id) {
      return false;
    }

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
