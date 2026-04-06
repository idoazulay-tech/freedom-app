/**
 * Advanced Scoring Engine
 * Calculates comprehensive risk score based on 6 factors
 */

export interface ScoringFactors {
  debtRatio: number; // 0-40 points
  enforcementStatus: number; // 0-20 points
  incomeStability: number; // 0-20 points
  creditorDiversity: number; // 0-10 points
  paymentHistory: number; // 0-10 points
  legalComplexity: number; // 0-10 points
}

export interface AdvancedScore {
  totalScore: number; // 0-200
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: ScoringFactors;
  breakdown: ScoreBreakdown;
  recommendations: string[];
  persona: 'yossi' | 'dana' | 'avi';
}

export interface ScoreBreakdown {
  debtRatio: { score: number; label: string; explanation: string };
  enforcementStatus: { score: number; label: string; explanation: string };
  incomeStability: { score: number; label: string; explanation: string };
  creditorDiversity: { score: number; label: string; explanation: string };
  paymentHistory: { score: number; label: string; explanation: string };
  legalComplexity: { score: number; label: string; explanation: string };
}

/**
 * Calculate debt ratio score (0-40 points)
 * Ratio = Total Debt / Monthly Income
 */
function calculateDebtRatioScore(totalDebt: number, monthlyIncome: number): number {
  if (monthlyIncome === 0) return 40; // Worst case

  const ratio = totalDebt / monthlyIncome;

  if (ratio < 3) return 5; // Excellent
  if (ratio < 6) return 10; // Good
  if (ratio < 12) return 20; // Fair
  if (ratio < 24) return 30; // Poor
  return 40; // Critical
}

/**
 * Calculate enforcement status score (0-20 points)
 */
function calculateEnforcementScore(
  hasEnforcement: boolean,
  hasWarningLetters: boolean,
  creditorCount: number
): number {
  let score = 0;

  if (hasEnforcement) score += 15; // Active enforcement
  if (hasWarningLetters) score += 5; // Warning letters

  // Bonus for multiple creditors
  if (creditorCount > 5) score += Math.min(5, creditorCount - 5);

  return Math.min(20, score);
}

/**
 * Calculate income stability score (0-20 points)
 */
function calculateIncomeStabilityScore(
  monthlyIncome: number,
  monthlyExpenses: number,
  availableForDebt: number
): number {
  if (monthlyIncome === 0) return 20; // No income

  const expenseRatio = monthlyExpenses / monthlyIncome;

  if (expenseRatio > 1) return 20; // Spending more than income
  if (expenseRatio > 0.9) return 15; // Very tight budget
  if (expenseRatio > 0.75) return 10; // Tight budget
  if (expenseRatio > 0.6) return 5; // Comfortable
  return 0; // Excellent
}

/**
 * Calculate creditor diversity score (0-10 points)
 */
function calculateCreditorDiversityScore(creditorCount: number): number {
  if (creditorCount === 0) return 10; // No creditors (shouldn't happen)
  if (creditorCount === 1) return 8; // Single creditor
  if (creditorCount <= 3) return 5; // Few creditors
  if (creditorCount <= 5) return 3; // Multiple creditors
  return 0; // Many creditors (better negotiation power)
}

/**
 * Calculate payment history score (0-10 points)
 * This is estimated based on enforcement status
 */
function calculatePaymentHistoryScore(hasEnforcement: boolean, hasWarningLetters: boolean): number {
  if (hasEnforcement) return 10; // Severe payment issues
  if (hasWarningLetters) return 7; // Recent payment issues
  return 0; // Assumed good history
}

/**
 * Calculate legal complexity score (0-10 points)
 */
function calculateLegalComplexityScore(
  hasEnforcement: boolean,
  hasWarningLetters: boolean,
  debtTypes: string[]
): number {
  let score = 0;

  if (hasEnforcement) score += 5; // Enforcement adds complexity
  if (hasWarningLetters) score += 3; // Legal notices add complexity

  // Check for complex debt types
  const complexTypes = ['משכנתא', 'חובות מס', 'חדלות פירעון'];
  const hasComplexDebt = debtTypes.some((type) =>
    complexTypes.some((ct) => type.toLowerCase().includes(ct.toLowerCase()))
  );

  if (hasComplexDebt) score += 2;

  return Math.min(10, score);
}

/**
 * Determine persona based on financial situation
 */
function determinePersona(
  totalDebt: number,
  monthlyIncome: number,
  availableForDebt: number,
  hasEnforcement: boolean
): 'yossi' | 'dana' | 'avi' {
  const debtRatio = totalDebt / monthlyIncome;

  // Yossi: High debt, low income, enforcement active
  if (debtRatio > 12 && hasEnforcement) return 'yossi';

  // Avi: Moderate debt, some income, manageable
  if (debtRatio < 6 && availableForDebt > 0) return 'avi';

  // Dana: Middle ground
  return 'dana';
}

/**
 * Generate recommendations based on score
 */
function generateRecommendations(score: AdvancedScore): string[] {
  const recommendations: string[] = [];

  const factors = score.factors;

  // Debt ratio recommendations
  if (factors.debtRatio > 30) {
    recommendations.push('דחוף: הקטן את היחס חוב/הכנסה - שקול הגדלת הכנסה או הקטנת הוצאות');
  }

  // Enforcement recommendations
  if (factors.enforcementStatus > 10) {
    recommendations.push('יש הוצל"פ פעיל - בקש עזרה משפטית מיידית מעורך דין');
  }

  // Income stability recommendations
  if (factors.incomeStability > 15) {
    recommendations.push('מצב כלכלי קשה - שקול הגדלת הכנסה או הקטנת הוצאות בדחיפות');
  }

  // Creditor diversity recommendations
  if (factors.creditorDiversity > 5) {
    recommendations.push('חייב יחיד - שקול משא ומתן ישיר עם הנושה');
  }

  // Payment history recommendations
  if (factors.paymentHistory > 5) {
    recommendations.push('בעיות בתשלומים - בקש הנחה בריביות בתמורה לתוכנית פירעון מובנית');
  }

  // Legal complexity recommendations
  if (factors.legalComplexity > 5) {
    recommendations.push('מורכבות משפטית גבוהה - בקש ייעוץ משפטי מקצועי');
  }

  // General recommendations based on risk level
  if (score.riskLevel === 'critical') {
    recommendations.push('סטטוס קריטי - פעל בדחיפות עם מומחים');
    recommendations.push('שקול הליך פשרה או הסדר עם נושים');
  } else if (score.riskLevel === 'high') {
    recommendations.push('סיכון גבוה - בקש עזרה מיועץ כלכלי');
    recommendations.push('תכנן תוכנית פירעון מובנית');
  }

  return recommendations;
}

/**
 * Calculate advanced score
 */
export function calculateAdvancedScore(input: {
  totalDebt: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  availableForDebt: number;
  creditorCount: number;
  hasEnforcement: boolean;
  hasWarningLetters: boolean;
  debtTypes?: string[];
}): AdvancedScore {
  // Calculate individual factor scores
  const debtRatioScore = calculateDebtRatioScore(input.totalDebt, input.monthlyIncome);
  const enforcementScore = calculateEnforcementScore(
    input.hasEnforcement,
    input.hasWarningLetters,
    input.creditorCount
  );
  const incomeStabilityScore = calculateIncomeStabilityScore(
    input.monthlyIncome,
    input.monthlyExpenses,
    input.availableForDebt
  );
  const creditorDiversityScore = calculateCreditorDiversityScore(input.creditorCount);
  const paymentHistoryScore = calculatePaymentHistoryScore(
    input.hasEnforcement,
    input.hasWarningLetters
  );
  const legalComplexityScore = calculateLegalComplexityScore(
    input.hasEnforcement,
    input.hasWarningLetters,
    input.debtTypes || []
  );

  const totalScore =
    debtRatioScore +
    enforcementScore +
    incomeStabilityScore +
    creditorDiversityScore +
    paymentHistoryScore +
    legalComplexityScore;

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  if (totalScore > 150) riskLevel = 'critical';
  else if (totalScore > 100) riskLevel = 'high';
  else if (totalScore > 50) riskLevel = 'medium';
  else riskLevel = 'low';

  // Determine persona
  const persona = determinePersona(
    input.totalDebt,
    input.monthlyIncome,
    input.availableForDebt,
    input.hasEnforcement
  );

  // Create breakdown
  const breakdown: ScoreBreakdown = {
    debtRatio: {
      score: debtRatioScore,
      label: `יחס חוב/הכנסה: ${(input.totalDebt / input.monthlyIncome).toFixed(1)}x`,
      explanation:
        debtRatioScore < 10
          ? 'יחס בריא'
          : debtRatioScore < 20
            ? 'יחס סביר'
            : debtRatioScore < 30
              ? 'יחס גבוה'
              : 'יחס קריטי',
    },
    enforcementStatus: {
      score: enforcementScore,
      label: input.hasEnforcement ? 'הוצל"פ פעיל' : 'ללא הוצל"פ',
      explanation: input.hasEnforcement ? 'יש הליכי הוצאה לפועל' : 'אין הליכי הוצאה לפועל',
    },
    incomeStability: {
      score: incomeStabilityScore,
      label: `יחס הוצאות/הכנסה: ${(input.monthlyExpenses / input.monthlyIncome).toFixed(1)}x`,
      explanation:
        incomeStabilityScore === 0
          ? 'מצב כלכלי מעולה'
          : incomeStabilityScore < 10
            ? 'מצב כלכלי סביר'
            : 'מצב כלכלי קשה',
    },
    creditorDiversity: {
      score: creditorDiversityScore,
      label: `מספר נושים: ${input.creditorCount}`,
      explanation:
        input.creditorCount === 1
          ? 'נושה יחיד - קל לנהל'
          : input.creditorCount <= 3
            ? 'מעט נושים'
            : 'הרבה נושים',
    },
    paymentHistory: {
      score: paymentHistoryScore,
      label: input.hasWarningLetters ? 'בעיות בתשלומים' : 'תשלומים תקינים',
      explanation: input.hasWarningLetters
        ? 'קיימות בעיות בתשלומים'
        : 'אין בעיות בתשלומים ידועות',
    },
    legalComplexity: {
      score: legalComplexityScore,
      label: legalComplexityScore > 5 ? 'מורכבות גבוהה' : 'מורכבות נמוכה',
      explanation:
        legalComplexityScore > 5
          ? 'יש מורכבות משפטית'
          : 'מורכבות משפטית נמוכה',
    },
  };

  const factors: ScoringFactors = {
    debtRatio: debtRatioScore,
    enforcementStatus: enforcementScore,
    incomeStability: incomeStabilityScore,
    creditorDiversity: creditorDiversityScore,
    paymentHistory: paymentHistoryScore,
    legalComplexity: legalComplexityScore,
  };

  const score: AdvancedScore = {
    totalScore,
    riskLevel,
    factors,
    breakdown,
    recommendations: [],
    persona,
  };

  score.recommendations = generateRecommendations(score);

  return score;
}
