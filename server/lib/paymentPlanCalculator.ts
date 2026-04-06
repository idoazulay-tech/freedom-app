/**
 * Payment Plan Calculator
 * Calculates monthly payment plans based on diagnosis data
 */

export interface PaymentPlan {
  monthlyPayment: number;
  totalMonths: number;
  totalInterest: number;
  startDate: Date;
  endDate: Date;
  payments: PaymentSchedule[];
  debtReductionPercentage: number;
}

export interface PaymentSchedule {
  month: number;
  date: Date;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

/**
 * Calculate payment plan based on diagnosis data
 */
export function calculatePaymentPlan(input: {
  totalDebt: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  availableForDebt: number;
  creditorCount: number;
  hasEnforcement: boolean;
  riskLevel: string;
}): PaymentPlan {
  const availableForDebt = Math.max(0, input.availableForDebt);

  // Calculate payment based on risk level and available funds
  let monthlyPayment = 0;
  let interestRate = 0;

  switch (input.riskLevel?.toLowerCase()) {
    case 'critical':
      // Critical: 60% of available funds, 12% annual interest
      monthlyPayment = Math.max(availableForDebt * 0.6, input.totalDebt / 60);
      interestRate = 0.12;
      break;
    case 'high':
      // High: 50% of available funds, 9% annual interest
      monthlyPayment = Math.max(availableForDebt * 0.5, input.totalDebt / 48);
      interestRate = 0.09;
      break;
    case 'medium':
      // Medium: 40% of available funds, 6% annual interest
      monthlyPayment = Math.max(availableForDebt * 0.4, input.totalDebt / 36);
      interestRate = 0.06;
      break;
    case 'low':
      // Low: 30% of available funds, 3% annual interest
      monthlyPayment = Math.max(availableForDebt * 0.3, input.totalDebt / 24);
      interestRate = 0.03;
      break;
    default:
      monthlyPayment = availableForDebt * 0.4;
      interestRate = 0.06;
  }

  // If enforcement is active, increase payment requirement
  if (input.hasEnforcement) {
    monthlyPayment *= 1.2; // 20% increase
  }

  // Ensure minimum payment
  monthlyPayment = Math.max(monthlyPayment, input.totalDebt / 120); // At least 10 years

  // Calculate payment schedule
  const payments: PaymentSchedule[] = [];
  let remainingBalance = input.totalDebt;
  let totalInterest = 0;
  const startDate = new Date();
  let currentDate = new Date(startDate);

  let month = 0;
  while (remainingBalance > 0 && month < 360) {
    // Max 30 years
    month++;
    const monthlyInterest = (remainingBalance * interestRate) / 12;
    const principal = Math.min(monthlyPayment - monthlyInterest, remainingBalance);
    const actualPayment = principal + monthlyInterest;

    remainingBalance = Math.max(0, remainingBalance - principal);
    totalInterest += monthlyInterest;

    payments.push({
      month,
      date: new Date(currentDate),
      payment: actualPayment,
      principal,
      interest: monthlyInterest,
      remainingBalance,
    });

    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  const endDate = new Date(currentDate);
  const debtReductionPercentage = (totalInterest / input.totalDebt) * 100;

  return {
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalMonths: month,
    totalInterest: Math.round(totalInterest * 100) / 100,
    startDate,
    endDate,
    payments,
    debtReductionPercentage,
  };
}

/**
 * Get payment plan summary for display
 */
export function getPaymentPlanSummary(plan: PaymentPlan) {
  return {
    monthlyPayment: plan.monthlyPayment,
    totalMonths: plan.totalMonths,
    yearsToPayOff: Math.ceil(plan.totalMonths / 12),
    totalInterest: plan.totalInterest,
    startDate: plan.startDate,
    endDate: plan.endDate,
    nextPaymentDate: plan.payments[0]?.date || new Date(),
    remainingPayments: plan.payments.length,
  };
}

/**
 * Get upcoming payments (next 6 months)
 */
export function getUpcomingPayments(plan: PaymentPlan, months: number = 6) {
  return plan.payments.slice(0, months);
}

/**
 * Get payment progress
 */
export function getPaymentProgress(plan: PaymentPlan, paymentsCompleted: number = 0) {
  const totalPayments = plan.payments.length;
  const progressPercentage = (paymentsCompleted / totalPayments) * 100;
  const remainingPayments = totalPayments - paymentsCompleted;
  const remainingBalance =
    plan.payments[Math.min(paymentsCompleted, totalPayments - 1)]?.remainingBalance || 0;

  return {
    progressPercentage: Math.round(progressPercentage),
    paymentsCompleted,
    remainingPayments,
    remainingBalance: Math.round(remainingBalance * 100) / 100,
    estimatedCompletionDate: plan.payments[Math.min(paymentsCompleted + 1, totalPayments - 1)]
      ?.date,
  };
}
