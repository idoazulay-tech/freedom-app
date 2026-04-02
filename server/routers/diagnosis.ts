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
          amount: z.number().positive(),
          monthsLate: z.number().nonnegative(),
          legalStatus: z.string(),
        })),
        monthlyIncome: z.number().positive(),
        monthlyExpenses: z.number().nonnegative(),
        creditorCount: z.number().int().positive(),
        hasEnforcement: z.boolean(),
        hasWarningLetters: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.user || !ctx.user.id) {
          throw new Error("User not authenticated");
        }

        // Run diagnosis agent
        const diagnosisResult = await performDiagnosis(input);

        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Ensure all values are properly typed and rounded
        const valuesToInsert = {
          userId: ctx.user.id,
          totalRiskScore: Math.max(0, Math.min(200, Math.round(diagnosisResult.riskScore))),
          riskLevel: String(diagnosisResult.riskLevel),
          totalDebt: Math.round(Math.max(0, diagnosisResult.totalDebt)),
          monthlyIncome: Math.round(Math.max(0, input.monthlyIncome)),
          monthlyExpenses: Math.round(Math.max(0, input.monthlyExpenses)),
          availableForDebt: Math.round(Math.max(0, diagnosisResult.monthlyAvailable)),
          creditorCount: Math.max(1, Math.round(input.creditorCount)),
          hasEnforcement: Boolean(input.hasEnforcement),
          hasWarningLetters: Boolean(input.hasWarningLetters),
          debtsData: JSON.stringify(input.debts),
          actionsData: JSON.stringify(diagnosisResult.automatedTasks),
        };

        // Save to database
        await db
          .insert(diagnoses)
          .values(valuesToInsert);

        return {
          success: true,
          diagnosis: diagnosisResult,
          message: 'Diagnosis saved successfully',
        };
      } catch (error) {
        console.error('Diagnosis error:', error);
        throw error;
      }
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
      try {
        if (!ctx.user || !ctx.user.id) {
          throw new Error("User not authenticated");
        }

        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const valuesToInsert = {
          userId: ctx.user.id,
          totalRiskScore: Math.round(input.riskScore),
          riskLevel: String(input.riskLevel),
          totalDebt: Math.round(input.totalDebt),
          monthlyIncome: Math.round(input.monthlyIncome),
          monthlyExpenses: Math.round(input.monthlyExpenses),
          availableForDebt: Math.round(input.availableForDebt),
          creditorCount: Math.round(input.creditorCount),
          hasEnforcement: Boolean(input.hasEnforcement),
          hasWarningLetters: Boolean(input.hasWarningLetters),
          debtsData: JSON.stringify(input.debts),
          actionsData: JSON.stringify(input.actions),
        };

        await db
          .insert(diagnoses)
          .values(valuesToInsert);

        return { success: true };
      } catch (error) {
        console.error('Save diagnosis error:', error);
        throw error;
      }
    }),

  getMine: protectedProcedure.query(async ({ ctx }) => {
    try {
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
    } catch (error) {
      console.error('Get diagnosis error:', error);
      throw error;
    }
  }),

  hasProfile: protectedProcedure.query(async ({ ctx }) => {
    try {
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
    } catch (error) {
      console.error('Has profile error:', error);
      return false;
    }
  }),
});
