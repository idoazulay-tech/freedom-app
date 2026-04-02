/**
 * Personalized Solution Engine - חישוב פתרונות אופטימאליים לכל מקרה
 * מחשב: תוכנית תשלומים, חיסכון, זמן לפתרון, עדיפויות
 */

export interface PersonalizedSolution {
  solutionName: string;
  description: string;
  monthlyPayment: number;
  totalPayment: number;
  timeframeMonths: number;
  totalSavings: number;
  savingsPercentage: number;
  difficulty: 'easy' | 'medium' | 'hard';
  successRate: number;
  pros: string[];
  cons: string[];
  steps: string[];
  timeline: Array<{
    phase: string;
    duration: string;
    actions: string[];
  }>;
}

export interface DebtPriority {
  debtType: string;
  amount: number;
  monthlyPayment: number;
  priority: number;
  reason: string;
  urgency: 'immediate' | 'high' | 'medium' | 'low';
}

export interface PaymentPlan {
  totalDebt: number;
  monthlyAvailable: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  debtPriorities: DebtPriority[];
  recommendedSolutions: PersonalizedSolution[];
  paymentSchedule: Array<{
    month: number;
    totalPayment: number;
    principalPayment: number;
    interestPayment: number;
    remainingDebt: number;
  }>;
  estimatedCompletionMonths: number;
  estimatedCompletionDate: string;
  totalInterestCost: number;
  potentialSavings: number;
}

/**
 * Calculate personalized solutions for a debt situation
 */
export function calculatePersonalizedSolutions(
  debts: Array<{
    type: string;
    amount: number;
    monthlyPayment: number;
    interestRate: number;
    monthsLate: number;
    legalStatus: string;
  }>,
  monthlyIncome: number,
  monthlyExpenses: number,
  availableCapital: number = 0
): PaymentPlan {
  const totalDebt = debts.reduce((sum, d) => sum + d.amount, 0);
  const monthlyAvailable = Math.max(0, monthlyIncome - monthlyExpenses);

  // Calculate debt priorities
  const debtPriorities = calculateDebtPriorities(debts, monthlyAvailable);

  // Generate recommended solutions
  const recommendedSolutions = generateRecommendedSolutions(
    debts,
    totalDebt,
    monthlyAvailable,
    monthlyIncome,
    monthlyExpenses,
    availableCapital
  );

  // Generate payment schedule
  const paymentSchedule = generatePaymentSchedule(
    debts,
    monthlyAvailable,
    debtPriorities
  );

  // Calculate completion timeline
  const estimatedCompletionMonths = paymentSchedule.length;
  const estimatedCompletionDate = calculateCompletionDate(estimatedCompletionMonths);

  // Calculate costs
  const totalInterestCost = paymentSchedule.reduce((sum, p) => sum + p.interestPayment, 0);
  const potentialSavings = calculatePotentialSavings(debts, recommendedSolutions);

  return {
    totalDebt,
    monthlyAvailable,
    monthlyIncome,
    monthlyExpenses,
    debtPriorities,
    recommendedSolutions,
    paymentSchedule,
    estimatedCompletionMonths,
    estimatedCompletionDate,
    totalInterestCost,
    potentialSavings,
  };
}

/**
 * Calculate debt priorities based on urgency and risk
 */
function calculateDebtPriorities(
  debts: Array<{
    type: string;
    amount: number;
    monthlyPayment: number;
    interestRate: number;
    monthsLate: number;
    legalStatus: string;
  }>,
  monthlyAvailable: number
): DebtPriority[] {
  const priorities: DebtPriority[] = [];

  for (const debt of debts) {
    let priority = 0;
    let urgency: 'immediate' | 'high' | 'medium' | 'low' = 'low';
    let reason = '';

    // Legal status urgency
    if (debt.legalStatus === 'enforcement' || debt.legalStatus === 'levy') {
      priority += 100;
      urgency = 'immediate';
      reason = 'יש הוצאה לפועל או עיקול פעיל';
    } else if (debt.legalStatus === 'lawsuit') {
      priority += 80;
      urgency = 'high';
      reason = 'יש תביעה משפטית';
    } else if (debt.legalStatus === 'demand_letter') {
      priority += 60;
      urgency = 'high';
      reason = 'יש דרישה משפטית';
    } else if (debt.monthsLate > 6) {
      priority += 50;
      urgency = 'high';
      reason = 'בפיגור משמעותי';
    } else if (debt.monthsLate > 3) {
      priority += 30;
      urgency = 'medium';
      reason = 'בפיגור';
    }

    // Interest rate urgency
    if (debt.interestRate > 15) {
      priority += 40;
      reason = reason ? reason + ' + ריבית גבוהה מאוד' : 'ריבית גבוהה מאוד';
    } else if (debt.interestRate > 10) {
      priority += 20;
      reason = reason ? reason + ' + ריבית גבוהה' : 'ריבית גבוהה';
    }

    // Amount urgency (larger debts get higher priority)
    const amountFactor = Math.min((debt.amount / 100000) * 20, 20);
    priority += amountFactor;

    priorities.push({
      debtType: debt.type,
      amount: debt.amount,
      monthlyPayment: debt.monthlyPayment,
      priority,
      reason,
      urgency,
    });
  }

  // Sort by priority (highest first)
  return priorities.sort((a, b) => b.priority - a.priority);
}

/**
 * Generate recommended solutions
 */
function generateRecommendedSolutions(
  debts: Array<{
    type: string;
    amount: number;
    monthlyPayment: number;
    interestRate: number;
    monthsLate: number;
    legalStatus: string;
  }>,
  totalDebt: number,
  monthlyAvailable: number,
  monthlyIncome: number,
  monthlyExpenses: number,
  availableCapital: number
): PersonalizedSolution[] {
  const solutions: PersonalizedSolution[] = [];

  // Solution 1: Structured Payment Plan
  if (monthlyAvailable > 0) {
    const monthsToPayoff = Math.ceil(totalDebt / monthlyAvailable);
    solutions.push({
      solutionName: 'תוכנית תשלומים מובנית',
      description: 'תוכנית תשלומים קבועה בהתאם ליכולתך',
      monthlyPayment: monthlyAvailable,
      totalPayment: totalDebt + calculateInterestCost(debts, monthsToPayoff),
      timeframeMonths: monthsToPayoff,
      totalSavings: 0,
      savingsPercentage: 0,
      difficulty: 'easy',
      successRate: 75,
      pros: [
        'קל להטמעה',
        'ברור ומובן',
        'אפשר להתחיל מיד',
      ],
      cons: [
        'זמן ארוך לפתרון',
        'ריבית גבוהה',
      ],
      steps: [
        'בנה רשימה של כל החובות',
        'קבע סדר עדיפויות',
        'התחל בתשלומים קבועים',
      ],
      timeline: [
        {
          phase: 'הכנה',
          duration: '1 שבוע',
          actions: [
            'אסוף מסמכים',
            'בנה תוכנית',
          ],
        },
        {
          phase: 'ביצוע',
          duration: `${monthsToPayoff} חודשים`,
          actions: [
            'תשלומים קבועים',
            'עקיבה שוטפת',
          ],
        },
      ],
    });
  }

  // Solution 2: Debt Consolidation (if multiple debts)
  if (debts.length > 1) {
    const consolidatedRate = calculateAverageInterestRate(debts);
    const monthsToPayoff = Math.ceil(totalDebt / monthlyAvailable);
    const savingsAmount = calculateInterestCost(debts, monthsToPayoff) - 
                          (totalDebt * (consolidatedRate / 100 / 12) * monthsToPayoff);
    
    solutions.push({
      solutionName: 'איחוד חובות',
      description: 'איחוד כל החובות להלוואה אחת בריבית נמוכה יותר',
      monthlyPayment: monthlyAvailable,
      totalPayment: totalDebt + (totalDebt * (consolidatedRate / 100 / 12) * monthsToPayoff),
      timeframeMonths: monthsToPayoff,
      totalSavings: Math.max(0, savingsAmount),
      savingsPercentage: Math.max(0, (savingsAmount / (totalDebt + calculateInterestCost(debts, monthsToPayoff))) * 100),
      difficulty: 'medium',
      successRate: 65,
      pros: [
        'תשלום חודשי יחיד',
        'ריבית נמוכה יותר',
        'חיסכון משמעותי',
      ],
      cons: [
        'צריך הסכמה של כל הנושים',
        'תהליך מורכב',
      ],
      steps: [
        'פנה לבנק לבדיקת אפשרות',
        'השווה בין הצעות',
        'בחר בהצעה הטובה ביותר',
      ],
      timeline: [
        {
          phase: 'משא ומתן',
          duration: '2-4 שבועות',
          actions: [
            'פנייה לנושים',
            'משא ומתן',
          ],
        },
        {
          phase: 'ביצוע',
          duration: `${monthsToPayoff} חודשים`,
          actions: [
            'תשלומים קבועים',
          ],
        },
      ],
    });
  }

  // Solution 3: Debt Settlement (if in critical situation)
  const hasEnforcement = debts.some(d => d.legalStatus === 'enforcement' || d.legalStatus === 'levy');
  if (hasEnforcement && availableCapital > 0) {
    const settlementAmount = Math.max(totalDebt * 0.6, availableCapital);
    solutions.push({
      solutionName: 'סידור חוב',
      description: 'משא ומתן עם נושים להפחתת סכום החוב',
      monthlyPayment: settlementAmount / 12,
      totalPayment: settlementAmount,
      timeframeMonths: 12,
      totalSavings: totalDebt - settlementAmount,
      savingsPercentage: ((totalDebt - settlementAmount) / totalDebt) * 100,
      difficulty: 'hard',
      successRate: 50,
      pros: [
        'הפחתה משמעותית של החוב',
        'סיום מהיר',
        'הסרת לחץ משפטי',
      ],
      cons: [
        'צריך הון זמין',
        'השפעה על אשראי',
        'משא ומתן קשה',
      ],
      steps: [
        'בדוק את ההון הזמין',
        'פנה לעורך דין',
        'התחל משא ומתן',
      ],
      timeline: [
        {
          phase: 'משא ומתן',
          duration: '4-8 שבועות',
          actions: [
            'פנייה לנושים',
            'משא ומתן',
            'הסכם',
          ],
        },
        {
          phase: 'תשלום',
          duration: '12 חודשים',
          actions: [
            'תשלומים קבועים',
          ],
        },
      ],
    });
  }

  // Solution 4: Bankruptcy (if in severe situation)
  const totalMonthlyPayment = debts.reduce((sum, d) => sum + d.monthlyPayment, 0);
  if (monthlyAvailable < 0 || (monthlyAvailable > 0 && monthlyAvailable < totalMonthlyPayment * 0.3)) {
    solutions.push({
      solutionName: 'פשיטת רגל',
      description: 'הליך משפטי לביטול חובות בעת אי-יכולת לשלם',
      monthlyPayment: 0,
      totalPayment: 0,
      timeframeMonths: 12,
      totalSavings: totalDebt,
      savingsPercentage: 100,
      difficulty: 'hard',
      successRate: 70,
      pros: [
        'ביטול חובות',
        'התחלה מחדש',
        'הסרת לחץ משפטי',
      ],
      cons: [
        'השפעה משמעותית על אשראי (7 שנים)',
        'הליך ממושך',
        'עלויות משפטיות',
      ],
      steps: [
        'פנה לעורך דין מומחה',
        'הכן מסמכים',
        'הגש בקשה לבית משפט',
      ],
      timeline: [
        {
          phase: 'הכנה',
          duration: '2-4 שבועות',
          actions: [
            'פנייה לעורך דין',
            'הכנת מסמכים',
          ],
        },
        {
          phase: 'הליך משפטי',
          duration: '6-12 חודשים',
          actions: [
            'הגשת בקשה',
            'דיונים בבית משפט',
            'אישור פשיטת רגל',
          ],
        },
      ],
    });
  }

  return solutions;
}

/**
 * Generate payment schedule
 */
function generatePaymentSchedule(
  debts: Array<{
    type: string;
    amount: number;
    monthlyPayment: number;
    interestRate: number;
    monthsLate: number;
    legalStatus: string;
  }>,
  monthlyAvailable: number,
  debtPriorities: DebtPriority[]
): Array<{
  month: number;
  totalPayment: number;
  principalPayment: number;
  interestPayment: number;
  remainingDebt: number;
}> {
  const schedule: Array<{
    month: number;
    totalPayment: number;
    principalPayment: number;
    interestPayment: number;
    remainingDebt: number;
  }> = [];

  let remainingDebts = debts.map(d => ({ ...d }));
  let month = 0;

  while (remainingDebts.some(d => d.amount > 0) && month < 360) {
    month++;
    let monthlyInterest = 0;
    let monthlyPrincipal = 0;

    // Calculate interest for this month
    for (const debt of remainingDebts) {
      monthlyInterest += debt.amount * (debt.interestRate / 100 / 12);
    }

    // Allocate available funds to debts by priority
    let availableFunds = monthlyAvailable;

    for (const priority of debtPriorities) {
      const debt = remainingDebts.find(d => d.type === priority.debtType);
      if (!debt || debt.amount <= 0) continue;

      const debtInterest = debt.amount * (debt.interestRate / 100 / 12);
      const minPayment = debtInterest + (debt.amount * 0.01); // At least interest + 1% of principal

      if (availableFunds >= minPayment) {
        const payment = Math.min(availableFunds, debt.amount + debtInterest);
        const principal = Math.max(0, payment - debtInterest);
        
        debt.amount = Math.max(0, debt.amount - principal);
        monthlyPrincipal += principal;
        availableFunds -= payment;
      }
    }

    const totalRemaining = remainingDebts.reduce((sum, d) => sum + d.amount, 0);

    schedule.push({
      month,
      totalPayment: monthlyAvailable,
      principalPayment: monthlyPrincipal,
      interestPayment: monthlyInterest,
      remainingDebt: Math.max(0, totalRemaining),
    });

    if (totalRemaining <= 0) break;
  }

  return schedule;
}

/**
 * Calculate interest cost
 */
function calculateInterestCost(
  debts: Array<{
    type: string;
    amount: number;
    monthlyPayment: number;
    interestRate: number;
    monthsLate: number;
    legalStatus: string;
  }>,
  months: number
): number {
  let totalInterest = 0;

  for (const debt of debts) {
    // Simple interest calculation
    totalInterest += debt.amount * (debt.interestRate / 100 / 12) * months;
  }

  return totalInterest;
}

/**
 * Calculate average interest rate
 */
function calculateAverageInterestRate(
  debts: Array<{
    type: string;
    amount: number;
    monthlyPayment: number;
    interestRate: number;
    monthsLate: number;
    legalStatus: string;
  }>
): number {
  const totalDebt = debts.reduce((sum, d) => sum + d.amount, 0);
  if (totalDebt === 0) return 0;

  const weightedRate = debts.reduce((sum, d) => sum + (d.amount * d.interestRate), 0) / totalDebt;
  return Math.max(3, weightedRate * 0.8); // Assume 20% reduction through negotiation
}

/**
 * Calculate completion date
 */
function calculateCompletionDate(months: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toLocaleDateString('he-IL');
}

/**
 * Calculate potential savings
 */
function calculatePotentialSavings(
  debts: Array<{
    type: string;
    amount: number;
    monthlyPayment: number;
    interestRate: number;
    monthsLate: number;
    legalStatus: string;
  }>,
  solutions: PersonalizedSolution[]
): number {
  // Find the solution with highest savings
  const maxSavings = Math.max(...solutions.map(s => s.totalSavings), 0);
  return maxSavings;
}
