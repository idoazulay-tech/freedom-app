/**
 * Debt Priority Ranking Algorithm
 * דירוג עדיפויות חובות לפי סיכון וחומרה
 */

export interface Debt {
  id: string;
  category: string;
  amount: number;
  creditorName: string;
  certainty: 'known' | 'estimated' | 'unknown';
  urgency: 'immediate' | 'medium' | 'low';
  interest: number;
  startDate: string;
  paymentStatus: 'current' | 'delayed' | 'default' | 'enforcement';
}

export interface DebtPriority {
  debt: Debt;
  priorityScore: number;
  rank: number;
  reason: string;
  recommendation: string;
}

/**
 * חשב ניקוד עדיפות לחוב
 * ניקוד גבוה יותר = עדיפות גבוהה יותר
 */
export function calculateDebtPriority(debt: Debt): number {
  let score = 0;

  // 1. סטטוס תשלום (משקל: 40%)
  switch (debt.paymentStatus) {
    case 'enforcement':
      score += 40; // הוצאה לפועל - דחוף!
      break;
    case 'default':
      score += 30; // בחדלות פירעון
      break;
    case 'delayed':
      score += 20; // בעיכוב
      break;
    case 'current':
      score += 5; // עדכני
      break;
  }

  // 2. דחיפות (משקל: 30%)
  switch (debt.urgency) {
    case 'immediate':
      score += 30;
      break;
    case 'medium':
      score += 15;
      break;
    case 'low':
      score += 5;
      break;
  }

  // 3. ריבית (משקל: 20%)
  // ריבית גבוהה = עלות גבוהה = עדיפות גבוהה
  if (debt.interest > 15) {
    score += 20;
  } else if (debt.interest > 8) {
    score += 12;
  } else if (debt.interest > 0) {
    score += 5;
  }

  // 4. גודל החוב (משקל: 10%)
  // חוב גדול = השפעה גדולה יותר
  // הנחה: חוב ממוצע הוא 50,000
  const debtRatio = Math.min(debt.amount / 50000, 2);
  score += debtRatio * 10;

  return Math.round(score);
}

/**
 * דרג חובות לפי עדיפות
 */
export function rankDebts(debts: Debt[]): DebtPriority[] {
  const priorities = debts.map((debt) => {
    const priorityScore = calculateDebtPriority(debt);
    const reason = getDebtReason(debt);
    const recommendation = getDebtRecommendation(debt, priorityScore);

    return {
      debt,
      priorityScore,
      rank: 0, // יעודכן אחרי מיון
      reason,
      recommendation,
    };
  });

  // מיין לפי ניקוד (גבוה לנמוך)
  priorities.sort((a, b) => b.priorityScore - a.priorityScore);

  // הוסף דירוג
  priorities.forEach((p, idx) => {
    p.rank = idx + 1;
  });

  return priorities;
}

/**
 * קבל הסבר למה החוב חשוב
 */
function getDebtReason(debt: Debt): string {
  if (debt.paymentStatus === 'enforcement') {
    return 'בהוצאה לפועל - סכנה גבוהה מאוד!';
  }
  if (debt.paymentStatus === 'default') {
    return 'בחדלות פירעון - סכנה גבוהה';
  }
  if (debt.paymentStatus === 'delayed') {
    return 'בעיכוב - סכנה בינונית';
  }
  if (debt.interest > 15) {
    return 'ריבית גבוהה מאוד - עלות גבוהה';
  }
  if (debt.urgency === 'immediate') {
    return 'דחוף - דרוש פעולה מיידית';
  }
  return 'חוב רגיל - יש זמן';
}

/**
 * קבל המלצה מה לעשות
 */
function getDebtRecommendation(debt: Debt, score: number): string {
  if (score >= 80) {
    return 'פנה לעורך דין או מתווך הסדרות מיד!';
  }
  if (score >= 60) {
    return 'התחל משא ומתן עם הנושה בהקדם';
  }
  if (score >= 40) {
    return 'תכננ תוכנית תשלום עם הנושה';
  }
  return 'עדכן את הנתונים ובדוק אפשרויות';
}

/**
 * קבל סיכום של החובות לפי עדיפות
 */
export function getDebtSummary(debts: Debt[]): {
  critical: DebtPriority[];
  high: DebtPriority[];
  medium: DebtPriority[];
  low: DebtPriority[];
} {
  const ranked = rankDebts(debts);

  return {
    critical: ranked.filter((p) => p.priorityScore >= 80),
    high: ranked.filter((p) => p.priorityScore >= 60 && p.priorityScore < 80),
    medium: ranked.filter((p) => p.priorityScore >= 40 && p.priorityScore < 60),
    low: ranked.filter((p) => p.priorityScore < 40),
  };
}
