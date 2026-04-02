import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getDb } from '../db';
import { diagnoses } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('Diagnosis Router', () => {
  let db: any;
  const testUserId = 999999;

  beforeAll(async () => {
    db = await getDb();
  });

  afterAll(async () => {
    // Clean up test data
    if (db) {
      await db.delete(diagnoses).where(eq(diagnoses.userId, testUserId));
    }
  });

  it('should save diagnosis with correct data types', async () => {
    if (!db) throw new Error('Database not available');

    const testData = {
      userId: testUserId,
      totalRiskScore: 125,
      riskLevel: 'גבוה',
      totalDebt: 97000,
      monthlyIncome: 10000,
      monthlyExpenses: 8000,
      availableForDebt: 2000,
      creditorCount: 3,
      hasEnforcement: false,
      hasWarningLetters: true,
      debtsData: JSON.stringify([
        {
          category: 'credit_card',
          amount: 30000,
          monthsLate: 3,
          legalStatus: 'overdue',
        },
      ]),
      actionsData: JSON.stringify([
        {
          title: 'Contact creditor',
          description: 'Reach out to negotiate',
          priority: 'high',
        },
      ]),
    };

    // Insert test data
    await db.insert(diagnoses).values(testData);

    // Retrieve and verify
    const result = await db
      .select()
      .from(diagnoses)
      .where(eq(diagnoses.userId, testUserId));

    expect(result).toHaveLength(1);
    const saved = result[0];

    // Verify types and values
    expect(typeof saved.totalRiskScore).toBe('number');
    expect(saved.totalRiskScore).toBe(125);
    expect(saved.riskLevel).toBe('גבוה');
    expect(typeof saved.totalDebt).toBe('number');
    expect(saved.totalDebt).toBe(97000);
    expect(typeof saved.monthlyIncome).toBe('number');
    expect(saved.monthlyIncome).toBe(10000);
    expect(typeof saved.monthlyExpenses).toBe('number');
    expect(saved.monthlyExpenses).toBe(8000);
    expect(typeof saved.availableForDebt).toBe('number');
    expect(saved.availableForDebt).toBe(2000);
    expect(typeof saved.creditorCount).toBe('number');
    expect(saved.creditorCount).toBe(3);
    expect(typeof saved.hasEnforcement).toBe('boolean');
    expect(saved.hasEnforcement).toBe(false);
    expect(typeof saved.hasWarningLetters).toBe('boolean');
    expect(saved.hasWarningLetters).toBe(true);
  });

  it('should parse JSON data correctly', async () => {
    if (!db) throw new Error('Database not available');

    const debtsData = [
      {
        category: 'credit_card',
        amount: 30000,
        monthsLate: 3,
        legalStatus: 'overdue',
      },
      {
        category: 'tax_debt',
        amount: 50000,
        monthsLate: 6,
        legalStatus: 'demand_letter',
      },
    ];

    const testData = {
      userId: testUserId + 1,
      totalRiskScore: 150,
      riskLevel: 'קריטי',
      totalDebt: 80000,
      monthlyIncome: 8000,
      monthlyExpenses: 7000,
      availableForDebt: 1000,
      creditorCount: 2,
      hasEnforcement: true,
      hasWarningLetters: true,
      debtsData: JSON.stringify(debtsData),
      actionsData: JSON.stringify([]),
    };

    await db.insert(diagnoses).values(testData);

    const result = await db
      .select()
      .from(diagnoses)
      .where(eq(diagnoses.userId, testUserId + 1));

    expect(result).toHaveLength(1);
    const saved = result[0];

    const parsedDebts = JSON.parse(saved.debtsData);
    expect(parsedDebts).toHaveLength(2);
    expect(parsedDebts[0].amount).toBe(30000);
    expect(parsedDebts[1].amount).toBe(50000);
  });

  it('should handle edge cases', async () => {
    if (!db) throw new Error('Database not available');

    const testData = {
      userId: testUserId + 2,
      totalRiskScore: 0,
      riskLevel: 'נמוך',
      totalDebt: 0,
      monthlyIncome: 1,
      monthlyExpenses: 0,
      availableForDebt: 1,
      creditorCount: 1,
      hasEnforcement: false,
      hasWarningLetters: false,
      debtsData: JSON.stringify([]),
      actionsData: JSON.stringify([]),
    };

    await db.insert(diagnoses).values(testData);

    const result = await db
      .select()
      .from(diagnoses)
      .where(eq(diagnoses.userId, testUserId + 2));

    expect(result).toHaveLength(1);
    const saved = result[0];

    expect(saved.totalRiskScore).toBe(0);
    expect(saved.totalDebt).toBe(0);
    expect(saved.availableForDebt).toBe(1);
  });

  it('should handle maximum values', async () => {
    if (!db) throw new Error('Database not available');

    const testData = {
      userId: testUserId + 3,
      totalRiskScore: 200,
      riskLevel: 'קריטי',
      totalDebt: 9999999,
      monthlyIncome: 999999,
      monthlyExpenses: 999999,
      availableForDebt: 999999,
      creditorCount: 999,
      hasEnforcement: true,
      hasWarningLetters: true,
      debtsData: JSON.stringify([]),
      actionsData: JSON.stringify([]),
    };

    await db.insert(diagnoses).values(testData);

    const result = await db
      .select()
      .from(diagnoses)
      .where(eq(diagnoses.userId, testUserId + 3));

    expect(result).toHaveLength(1);
    const saved = result[0];

    expect(saved.totalRiskScore).toBe(200);
    expect(saved.totalDebt).toBe(9999999);
    expect(saved.creditorCount).toBe(999);
  });
});
