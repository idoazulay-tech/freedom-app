import { describe, it, expect, vi } from 'vitest';
import * as queries from '../queries';
import { getDb } from '../db';

vi.mock('../db', () => ({
  getDb: vi.fn(),
}));

describe('Cases Router - createDebtProfile', () => {
  it('should return insertId when creating a debt profile', async () => {
    const mockDb = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue({
          insertId: 123,
        }),
      }),
    };

    vi.mocked(getDb).mockResolvedValue(mockDb as any);

    const result = await queries.createDebtProfile(1, {
      totalDebtAmount: '50000',
      debtType: 'credit_card',
      severity: 'medium',
      persona: 'dana',
      status: 'new',
      triageCompletedAt: new Date(),
    });

    expect(result).toBeDefined();
    expect(result.insertId).toBe(123);
    expect(mockDb.insert).toHaveBeenCalled();
  });

  it('should throw error when database is not available', async () => {
    vi.mocked(getDb).mockResolvedValue(null);

    await expect(
      queries.createDebtProfile(1, {
        totalDebtAmount: '50000',
        debtType: 'credit_card',
        severity: 'medium',
        persona: 'dana',
        status: 'new',
        triageCompletedAt: new Date(),
      })
    ).rejects.toThrow('Database not available');
  });
});

describe('Cases Router - getMyCases with JOIN', () => {
  it('should return cases with debt profile details', async () => {
    const mockCaseData = {
      id: 1,
      debtProfileId: 1,
      professionalUserId: null,
      status: 'open',
      matchingScore: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      totalDebtAmount: '50000',
      debtType: 'credit_card',
      severity: 'medium',
      persona: 'dana',
    };

    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([mockCaseData]),
          }),
        }),
      }),
    };

    vi.mocked(getDb).mockResolvedValue(mockDb as any);

    const result = await queries.getCasesByDebtProfileId(1);

    expect(result).toBeDefined();
    expect(result.length).toBe(1);
    expect(result[0]).toHaveProperty('debtType', 'credit_card');
    expect(result[0]).toHaveProperty('totalDebtAmount', '50000');
    expect(result[0]).toHaveProperty('severity', 'medium');
    expect(result[0]).toHaveProperty('persona', 'dana');
  });
});
