import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { EXPENSE_CATEGORIES_42 } from '../lib/expenseCategories';

/**
 * 12 APIs for Freedom System
 * All with JSON Schema validation and comprehensive error handling
 */

// ============================================================================
// DEBT APIs (4 endpoints)
// ============================================================================

export const debtRouter = router({
  // 1. POST /api/debts/add
  add: protectedProcedure
    .input(
      z.object({
        creditorName: z.string().min(1, 'שם המחויב חובה'),
        debtType: z.enum([
          'credit_card',
          'bank_loan',
          'credit_company',
          'credit_line',
          'mortgage',
          'tax',
          'municipal',
          'utility',
          'medical',
          'insurance',
        ]),
        totalAmount: z.number().min(0, 'סכום חוב'),
        monthlyPayment: z.number().min(0),
        monthsInArrears: z.number().min(0).default(0),
        interestRate: z.number().min(0).default(0),
        dueDate: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Save to database
        return {
          success: true,
          debtId: Math.random(),
          message: 'חוב נוסף בהצלחה',
        };
      } catch (error) {
        throw new Error(`Failed to add debt: ${error}`);
      }
    }),

  // 2. GET /api/debts/list
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        sortBy: z.enum(['createdAt', 'amount', 'dueDate']).default('createdAt'),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // TODO: Fetch from database
        return {
          debts: [],
          total: 0,
          page: input.page,
          limit: input.limit,
        };
      } catch (error) {
        throw new Error(`Failed to list debts: ${error}`);
      }
    }),

  // 3. PUT /api/debts/:id
  update: protectedProcedure
    .input(
      z.object({
        debtId: z.number(),
        creditorName: z.string().optional(),
        totalAmount: z.number().optional(),
        monthlyPayment: z.number().optional(),
        monthsInArrears: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Update in database
        return {
          success: true,
          message: 'חוב עודכן בהצלחה',
        };
      } catch (error) {
        throw new Error(`Failed to update debt: ${error}`);
      }
    }),

  // 4. DELETE /api/debts/:id
  delete: protectedProcedure
    .input(z.object({ debtId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Soft delete from database
        return {
          success: true,
          message: 'חוב הוסר בהצלחה',
        };
      } catch (error) {
        throw new Error(`Failed to delete debt: ${error}`);
      }
    }),
});

// ============================================================================
// EXPENSE APIs (2 endpoints)
// ============================================================================

export const expenseRouter = router({
  // 5. POST /api/expenses/add
  add: protectedProcedure
    .input(
      z.object({
        categoryId: z.string().refine(
          id => EXPENSE_CATEGORIES_42.some(cat => cat.id === id),
          'קטגוריה לא חוקית'
        ),
        amount: z.number().min(0, 'סכום הוצאה'),
        date: z.string().datetime(),
        description: z.string().optional(),
        isRecurring: z.boolean().default(false),
        recurringFrequency: z
          .enum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'])
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Save to database
        return {
          success: true,
          expenseId: Math.random(),
          message: 'הוצאה נוספה בהצלחה',
        };
      } catch (error) {
        throw new Error(`Failed to add expense: ${error}`);
      }
    }),

  // 6. GET /api/expenses/list
  list: protectedProcedure
    .input(
      z.object({
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        categoryId: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // TODO: Fetch from database with filters
        return {
          expenses: [],
          total: 0,
          totalAmount: 0,
          page: input.page,
          limit: input.limit,
        };
      } catch (error) {
        throw new Error(`Failed to list expenses: ${error}`);
      }
    }),
});

// ============================================================================
// DIAGNOSIS APIs (2 endpoints)
// ============================================================================

export const diagnosisRouter = router({
  // 7. POST /api/diagnosis/perform
  perform: protectedProcedure
    .input(
      z.object({
        debts: z.array(
          z.object({
            creditorName: z.string(),
            debtType: z.string(),
            amount: z.number(),
            monthlyPayment: z.number(),
            monthsInArrears: z.number(),
          })
        ),
        monthlyIncome: z.number().min(0),
        monthlyExpenses: z.number().min(0),
        hasEnforcement: z.boolean().default(false),
        hasWarningLetters: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Run AI diagnosis
        return {
          success: true,
          diagnosisId: Math.random(),
          riskScore: 0,
          riskLevel: 'low',
          persona: 'yossi',
          message: 'אבחון הושלם בהצלחה',
        };
      } catch (error) {
        throw new Error(`Failed to perform diagnosis: ${error}`);
      }
    }),

  // 8. GET /api/diagnosis/history
  history: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // TODO: Fetch from database
        return {
          diagnoses: [],
          total: 0,
          page: input.page,
          limit: input.limit,
        };
      } catch (error) {
        throw new Error(`Failed to fetch diagnosis history: ${error}`);
      }
    }),
});

// ============================================================================
// PROFESSIONAL APIs (2 endpoints)
// ============================================================================

export const professionalRouter = router({
  // 9. POST /api/professionals/match
  match: protectedProcedure
    .input(
      z.object({
        diagnosisId: z.number(),
        debtType: z.string(),
        riskLevel: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Run matching algorithm
        return {
          success: true,
          professionals: [],
          message: 'מומחים התאימו בהצלחה',
        };
      } catch (error) {
        throw new Error(`Failed to match professionals: ${error}`);
      }
    }),

  // 10. GET /api/professionals/list
  list: protectedProcedure
    .input(
      z.object({
        specialization: z.string().optional(),
        minRating: z.number().min(0).max(5).default(0),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // TODO: Fetch from database
        return {
          professionals: [],
          total: 0,
          page: input.page,
          limit: input.limit,
        };
      } catch (error) {
        throw new Error(`Failed to list professionals: ${error}`);
      }
    }),
});

// ============================================================================
// PAYMENT PLAN APIs (1 endpoint)
// ============================================================================

export const paymentPlanRouter = router({
  // 11. POST /api/payment-plan/generate
  generate: protectedProcedure
    .input(
      z.object({
        debts: z.array(
          z.object({
            amount: z.number(),
            monthlyPayment: z.number(),
            interestRate: z.number(),
          })
        ),
        monthlyIncome: z.number(),
        monthlyExpenses: z.number(),
        strategy: z.enum(['snowball', 'avalanche', 'balanced']).default('balanced'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Generate payment plan
        return {
          success: true,
          paymentPlanId: Math.random(),
          monthlyPayment: 0,
          totalMonths: 0,
          totalInterest: 0,
          schedule: [],
          message: 'תוכנית תשלומים נוצרה בהצלחה',
        };
      } catch (error) {
        throw new Error(`Failed to generate payment plan: ${error}`);
      }
    }),
});

// ============================================================================
// TASKS APIs (1 endpoint)
// ============================================================================

export const taskRouter = router({
  // 12. POST /api/tasks/create
  create: protectedProcedure
    .input(
      z.object({
        diagnosisId: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
        dueDate: z.string().datetime().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Save to database
        return {
          success: true,
          taskId: Math.random(),
          message: 'משימה נוצרה בהצלחה',
        };
      } catch (error) {
        throw new Error(`Failed to create task: ${error}`);
      }
    }),
});

// ============================================================================
// Export all routers
// ============================================================================

export const apiRouter = router({
  debts: debtRouter,
  expenses: expenseRouter,
  diagnosis: diagnosisRouter,
  professionals: professionalRouter,
  paymentPlan: paymentPlanRouter,
  tasks: taskRouter,
});
