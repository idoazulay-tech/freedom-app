// Scoring Engine for Multi-Debt Diagnosis
// Calculates risk scores based on comprehensive factors

import { Debt, LEGAL_STATUS_OPTIONS, SCORING_FACTORS, RISK_LEVELS } from '../shared/debt-categories';

export interface DebtScore {
  debt_id: string;
  amount_score: number;
  months_late_score: number;
  legal_status_score: number;
  individual_risk: number;
}

export interface DiagnosisResult {
  total_debts: number;
  total_amount: number;
  debts_scores: DebtScore[];
  max_individual_risk: number;
  creditor_count_score: number;
  stable_income_score: number;
  asset_at_risk_score: number;
  total_risk_score: number;
  risk_level: string;
  recommendation: string;
  next_steps: string[];
  summary: string;
}

/**
 * Calculate score for debt amount
 */
function calculateAmountScore(amount: number): number {
  const ranges = SCORING_FACTORS.AMOUNT.ranges;
  for (const range of ranges) {
    if (amount >= range.min && amount < range.max) {
      return range.score;
    }
  }
  return ranges[ranges.length - 1].score; // Return highest score if exceeds all ranges
}

/**
 * Calculate score for months late
 */
function calculateMonthsLateScore(months: number): number {
  const ranges = SCORING_FACTORS.MONTHS_LATE.ranges;
  for (const range of ranges) {
    if (months >= range.min && months < range.max) {
      return range.score;
    }
  }
  return ranges[ranges.length - 1].score;
}

/**
 * Get legal status score
 */
function getLegalStatusScore(legalStatus: string): number {
  const status = LEGAL_STATUS_OPTIONS.find((s: any) => s.value === legalStatus);
  return status?.score || 0;
}

/**
 * Calculate individual debt risk score
 * Formula: MAX(amount_score, months_late_score) + legal_status_score
 */
function calculateIndividualRisk(debt: Debt): number {
  const amountScore = calculateAmountScore(debt.amount);
  const monthsScore = calculateMonthsLateScore(debt.months_late);
  const legalScore = getLegalStatusScore(debt.legal_status);

  // Take the maximum of amount and months, then add legal status
  return Math.max(amountScore, monthsScore) + legalScore;
}

/**
 * Calculate creditor count score
 */
function calculateCreditorCountScore(debtCount: number): number {
  const ranges = SCORING_FACTORS.CREDITOR_COUNT.ranges;
  for (const range of ranges) {
    if (debtCount >= range.min && debtCount <= range.max) {
      return range.score;
    }
  }
  return ranges[ranges.length - 1].score;
}

/**
 * Main diagnosis calculation
 * Formula: MAX(all individual risks) + creditor_count_score + additional_factors
 */
export function calculateDiagnosis(
  debts: Debt[],
  hasStableIncome: boolean = true,
  hasAssetAtRisk: boolean = false
): DiagnosisResult {
  if (!debts || debts.length === 0) {
    throw new Error('No debts provided for diagnosis');
  }

  // Calculate individual scores for each debt
  const debtsScores: DebtScore[] = debts.map(debt => {
    const amountScore = calculateAmountScore(debt.amount);
    const monthsLateScore = calculateMonthsLateScore(debt.months_late);
    const legalStatusScore = getLegalStatusScore(debt.legal_status);
    const individualRisk = calculateIndividualRisk(debt);

    return {
      debt_id: debt.id,
      amount_score: amountScore,
      months_late_score: monthsLateScore,
      legal_status_score: legalStatusScore,
      individual_risk: individualRisk,
    };
  });

  // Calculate total debt amount
  const totalAmount = debts.reduce((sum, debt) => sum + debt.amount, 0);

  // Get maximum individual risk
  const maxIndividualRisk = Math.max(...debtsScores.map(s => s.individual_risk));

  // Calculate creditor count score
  const creditorCountScore = calculateCreditorCountScore(debts.length);

  // Calculate additional factors
  const stableIncomeScore = hasStableIncome ? 0 : SCORING_FACTORS.STABLE_INCOME.score;
  const assetAtRiskScore = hasAssetAtRisk ? SCORING_FACTORS.ASSET_AT_RISK.score : 0;

  // Total risk score formula
  const totalRiskScore = maxIndividualRisk + creditorCountScore + stableIncomeScore + assetAtRiskScore;

  // Get risk level
  const riskLevelObj = RISK_LEVELS.find((level: any) => totalRiskScore >= level.min && totalRiskScore <= level.max);
  const riskLevel = riskLevelObj?.level || 'קריטי';
  const recommendation = riskLevelObj?.recommendation || 'עו"ד חדלות פירעון';

  // Generate next steps based on debts and risk
  const nextSteps = generateNextSteps(debts, totalRiskScore, riskLevel);

  // Generate summary
  const summary = generateSummary(debts, totalRiskScore, riskLevel, recommendation);

  return {
    total_debts: debts.length,
    total_amount: totalAmount,
    debts_scores: debtsScores,
    max_individual_risk: maxIndividualRisk,
    creditor_count_score: creditorCountScore,
    stable_income_score: stableIncomeScore,
    asset_at_risk_score: assetAtRiskScore,
    total_risk_score: totalRiskScore,
    risk_level: riskLevel,
    recommendation,
    next_steps: nextSteps,
    summary,
  };
}

/**
 * Generate next steps based on diagnosis
 */
function generateNextSteps(debts: Debt[], totalRiskScore: number, riskLevel: string): string[] {
  const steps: string[] = [];

  // Check for enforcement debts
  const hasEnforcement = debts.some(d => d.legal_status === 'enforcement' || d.legal_status === 'levy');
  if (hasEnforcement) {
    steps.push('אסוף מספר תיק מהגוף המשפטי');
  }

  // Check for lawsuits
  const hasLawsuit = debts.some(d => d.legal_status === 'lawsuit');
  if (hasLawsuit) {
    steps.push('התייעץ עם עורך דין בעניין התביעה');
  }

  // Check for mortgage
  const hasMortgage = debts.some(d => d.subcategory === 'mortgage');
  if (hasMortgage) {
    steps.push('בדוק סיכון נכס עם מומחה');
  }

  // Check for multiple debts
  if (debts.length >= 3) {
    steps.push('שקול הסדר כולל עם כל הנושים');
  }

  // Risk-based recommendations
  if (totalRiskScore > 150) {
    steps.push('בקש ייעוץ משפטי מיידי');
  }

  if (totalRiskScore > 300) {
    steps.push('בדוק אפשרות חדלות פירעון עם עורך דין מומחה');
  }

  // Add generic next step
  if (steps.length === 0) {
    steps.push('צור קשר עם יועץ כלכלי להכנת תוכנית הסדרים');
  }

  return steps;
}

/**
 * Generate human-readable summary
 */
function generateSummary(debts: Debt[], totalRiskScore: number, riskLevel: string, recommendation: string): string {
  const debtList = debts.map(d => `${d.entity} - ${d.amount.toLocaleString('he-IL')} ₪`).join(', ');
  
  return `
אבחון חובות מלא:
${debts.length} חובות בסך ${debts.reduce((sum, d) => sum + d.amount, 0).toLocaleString('he-IL')} ₪

חובותיך: ${debtList}

סיכון כולל: ${totalRiskScore} נקודות
רמת סיכון: ${riskLevel}
המלצה: ${recommendation}

עליך לפעול בהקדם האפשרי כדי למנוע הליכים משפטיים נוספים.
  `.trim();
}

/**
 * Format diagnosis result for display
 */
export function formatDiagnosisForDisplay(diagnosis: DiagnosisResult) {
  return {
    risk_icon: RISK_LEVELS.find((l: any) => l.level === diagnosis.risk_level)?.icon || '❓',
    risk_level: diagnosis.risk_level,
    total_score: diagnosis.total_risk_score,
    recommendation: diagnosis.recommendation,
    debts_count: diagnosis.total_debts,
    total_amount: diagnosis.total_amount.toLocaleString('he-IL'),
    next_steps: diagnosis.next_steps,
    summary: diagnosis.summary,
  };
}
