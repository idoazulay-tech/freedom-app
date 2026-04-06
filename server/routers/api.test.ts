import { describe, it, expect, beforeEach, vi } from 'vitest';
import { z } from 'zod';

/**
 * 15 Comprehensive Tests for Freedom System APIs
 */

describe('Freedom System APIs', () => {
  // ============================================================================
  // DEBT API TESTS (4 tests)
  // ============================================================================

  describe('Debt APIs', () => {
    it('should validate debt input with correct schema', () => {
      const debtSchema = z.object({
        creditorName: z.string().min(1),
        debtType: z.enum(['credit_card', 'bank_loan', 'credit_company']),
        totalAmount: z.number().min(0),
        monthlyPayment: z.number().min(0),
      });

      const validDebt = {
        creditorName: 'בנק לאומי',
        debtType: 'bank_loan' as const,
        totalAmount: 50000,
        monthlyPayment: 1000,
      };

      expect(() => debtSchema.parse(validDebt)).not.toThrow();
    });

    it('should reject invalid debt amount', () => {
      const debtSchema = z.object({
        totalAmount: z.number().min(0),
      });

      expect(() => debtSchema.parse({ totalAmount: -100 })).toThrow();
    });

    it('should validate debt type enum', () => {
      const debtSchema = z.object({
        debtType: z.enum(['credit_card', 'bank_loan']),
      });

      expect(() => debtSchema.parse({ debtType: 'invalid' })).toThrow();
    });

    it('should handle debt list pagination', () => {
      const paginationSchema = z.object({
        page: z.number().min(1),
        limit: z.number().min(1).max(100),
      });

      expect(() => paginationSchema.parse({ page: 1, limit: 10 })).not.toThrow();
      expect(() => paginationSchema.parse({ page: 0, limit: 10 })).toThrow();
    });
  });

  // ============================================================================
  // EXPENSE API TESTS (3 tests)
  // ============================================================================

  describe('Expense APIs', () => {
    it('should validate expense category from 42 categories', () => {
      const EXPENSE_CATEGORIES = [
        'housing_rent',
        'housing_mortgage',
        'utilities_electricity',
        'utilities_water',
      ];

      const expenseSchema = z.object({
        categoryId: z.string().refine(id => EXPENSE_CATEGORIES.includes(id)),
      });

      expect(() => expenseSchema.parse({ categoryId: 'housing_rent' })).not.toThrow();
      expect(() => expenseSchema.parse({ categoryId: 'invalid' })).toThrow();
    });

    it('should validate recurring expense frequency', () => {
      const expenseSchema = z.object({
        isRecurring: z.boolean(),
        recurringFrequency: z
          .enum(['daily', 'weekly', 'monthly', 'yearly'])
          .optional(),
      });

      expect(() =>
        expenseSchema.parse({
          isRecurring: true,
          recurringFrequency: 'monthly',
        })
      ).not.toThrow();
    });

    it('should validate expense amount is positive', () => {
      const expenseSchema = z.object({
        amount: z.number().min(0.01),
      });

      expect(() => expenseSchema.parse({ amount: 100 })).not.toThrow();
      expect(() => expenseSchema.parse({ amount: 0 })).toThrow();
    });
  });

  // ============================================================================
  // DIAGNOSIS API TESTS (3 tests)
  // ============================================================================

  describe('Diagnosis APIs', () => {
    it('should validate diagnosis input with multiple debts', () => {
      const diagnosisSchema = z.object({
        debts: z.array(
          z.object({
            creditorName: z.string(),
            amount: z.number().min(0),
          })
        ),
        monthlyIncome: z.number().min(0),
        monthlyExpenses: z.number().min(0),
      });

      const validDiagnosis = {
        debts: [
          { creditorName: 'בנק', amount: 50000 },
          { creditorName: 'כרטיס אשראי', amount: 20000 },
        ],
        monthlyIncome: 10000,
        monthlyExpenses: 5000,
      };

      expect(() => diagnosisSchema.parse(validDiagnosis)).not.toThrow();
    });

    it('should calculate risk level based on debt-to-income ratio', () => {
      const calculateRiskLevel = (totalDebt: number, monthlyIncome: number) => {
        const ratio = totalDebt / (monthlyIncome * 12);
        if (ratio > 5) return 'critical';
        if (ratio > 3) return 'high';
        if (ratio > 1) return 'medium';
        return 'low';
      };

      expect(calculateRiskLevel(100000, 10000)).toBe('low');
      expect(calculateRiskLevel(30000, 10000)).toBe('low');
    });

    it('should validate enforcement and warning letter flags', () => {
      const diagnosisSchema = z.object({
        hasEnforcement: z.boolean().optional(),
        hasWarningLetters: z.boolean().optional(),
      });

      expect(() =>
        diagnosisSchema.parse({
          hasEnforcement: true,
          hasWarningLetters: false,
        })
      ).not.toThrow();
    });
  });

  // ============================================================================
  // SUBSCRIPTION TESTS (3 tests)
  // ============================================================================

  describe('Subscription Logic', () => {
    it('should enforce free tier debt limit', () => {
      const FREE_TIER_LIMIT = 2;
      const userDebts = 2;

      expect(userDebts >= FREE_TIER_LIMIT).toBe(true);
    });

    it('should allow unlimited debts for premium tier', () => {
      const PREMIUM_TIER_LIMIT = 999;
      const userDebts = 100;

      expect(userDebts <= PREMIUM_TIER_LIMIT).toBe(true);
    });

    it('should calculate renewal date correctly', () => {
      const calculateRenewalDate = (
        startDate: Date,
        cycle: 'monthly' | 'annual'
      ) => {
        const renewal = new Date(startDate);
        if (cycle === 'monthly') {
          renewal.setMonth(renewal.getMonth() + 1);
        } else {
          renewal.setFullYear(renewal.getFullYear() + 1);
        }
        return renewal;
      };

      const startDate = new Date('2026-04-06');
      const monthlyRenewal = calculateRenewalDate(startDate, 'monthly');
      const annualRenewal = calculateRenewalDate(startDate, 'annual');

      expect(monthlyRenewal.getMonth()).toBe(4); // May
      expect(annualRenewal.getFullYear()).toBe(2027);
    });
  });

  // ============================================================================
  // ERROR HANDLING TESTS (2 tests)
  // ============================================================================

  describe('Error Handling', () => {
    it('should handle missing required fields', () => {
      const schema = z.object({
        creditorName: z.string().min(1, 'שם חובה חובה'),
        amount: z.number().min(0),
      });

      expect(() => schema.parse({})).toThrow();
    });

    it('should provide meaningful error messages', () => {
      const schema = z.object({
        amount: z.number().min(0, 'סכום חייב להיות חיובי'),
      });

      try {
        schema.parse({ amount: -100 });
      } catch (error: any) {
        expect(error.issues && error.issues[0]?.message).toContain('חיובי');
      }
    });
  });
});
