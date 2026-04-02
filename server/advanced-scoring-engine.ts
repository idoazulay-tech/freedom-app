/**
 * Advanced Scoring Engine for Freedom Platform
 * Comprehensive debt risk assessment with multiple factors and legal compliance
 */

import { Debt } from '../shared/debt-categories';

export interface ScoringFactors {
  amountScore: number;
  monthsLateScore: number;
  legalStatusScore: number;
  creditorCountScore: number;
  stableIncomeScore: number;
  assetAtRiskScore: number;
  multiDebtPenalty: number;
  urgencyScore: number;
  complianceScore: number;
}

export interface PersonaClassification {
  persona: 'yossi' | 'dana' | 'avi';
  description: string;
  characteristics: string[];
  recommendedApproach: string;
  estimatedResolutionTime: string;
}

export interface DiagnosisWithPersona {
  totalScore: number;
  riskLevel: 'נמוך' | 'בינוני' | 'גבוה' | 'קריטי';
  persona: PersonaClassification;
  recommendation: string;
  nextSteps: string[];
  matchedProfessionals: ProfessionalMatch[];
  scoringBreakdown: ScoringFactors;
  legalConsiderations: LegalConsideration[];
  automatedTasks: AutomatedTask[];
}

export interface ProfessionalMatch {
  id: string;
  name: string;
  specialty: string;
  matchPercentage: number;
  experience: number;
  casesSimilar: number;
  successRate: number;
  availability: string;
}

export interface LegalConsideration {
  law: string;
  applicability: boolean;
  description: string;
  action: string;
}

export interface AutomatedTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  assignedTo: string;
  status: 'pending' | 'in_progress' | 'completed';
}

/**
 * Calculate amount-based score
 * <10K = 10, 10-50K = 30, >50K = 60
 */
function calculateAmountScore(amount: number): number {
  if (amount < 10000) return 10;
  if (amount < 50000) return 30;
  return 60;
}

/**
 * Calculate months late score
 * <3 months = 10, 3-6 = 30, >6 = 60
 */
function calculateMonthsLateScore(months: number): number {
  if (months < 3) return 10;
  if (months < 6) return 30;
  return 60;
}

/**
 * Calculate legal status score
 * פיגור=0, דרישה=20, תביעה=50, הוצל"פ=100, עיקול=150, חדלות=200
 */
function calculateLegalStatusScore(status: string): number {
  const scores: Record<string, number> = {
    overdue: 0,
    demand_letter: 20,
    lawsuit: 50,
    enforcement: 100,
    levy: 150,
    insolvency: 200,
  };
  return scores[status] || 0;
}

/**
 * Calculate creditor count score
 * 1 creditor = 10, 2-3 = 30, 4+ = 60
 */
function calculateCreditorCountScore(count: number): number {
  if (count === 1) return 10;
  if (count <= 3) return 30;
  return 60;
}

/**
 * Calculate multi-debt penalty
 * Each additional debt adds 15 points
 */
function calculateMultiDebtPenalty(debtCount: number): number {
  return Math.max(0, (debtCount - 1) * 15);
}

/**
 * Calculate urgency score based on legal status and months late
 */
function calculateUrgencyScore(legalStatus: string, monthsLate: number): number {
  let score = 0;

  // Legal status urgency
  if (legalStatus === 'levy' || legalStatus === 'insolvency') score += 50;
  else if (legalStatus === 'enforcement') score += 40;
  else if (legalStatus === 'lawsuit') score += 30;
  else if (legalStatus === 'demand_letter') score += 20;

  // Time urgency
  if (monthsLate > 12) score += 30;
  else if (monthsLate > 6) score += 20;
  else if (monthsLate > 3) score += 10;

  return Math.min(score, 100);
}

/**
 * Classify user into persona: Yossi, Dana, or Avi
 * Yossi: Simple case, can resolve independently
 * Dana: Complex case, needs professional guidance
 * Avi: Critical case, needs immediate legal intervention
 */
function classifyPersona(debts: Debt[], totalScore: number): PersonaClassification {
  // Avi: Critical cases
  if (totalScore > 300 || debts.some(d => d.legal_status === 'insolvency' || d.legal_status === 'levy')) {
    return {
      persona: 'avi',
      description: 'מקרה קריטי - דורש התערבות משפטית מידית',
      characteristics: [
        'חובות משפטיים',
        'עיקולים או חדלות פירעון',
        'סכומים גדולים',
        'מספר נושים גבוה',
      ],
      recommendedApproach: 'עורך דין מומחה בחדלות פירעון',
      estimatedResolutionTime: '3-6 חודשים',
    };
  }

  // Dana: Complex cases
  if (totalScore > 150 || debts.length > 2 || debts.some(d => d.legal_status === 'lawsuit')) {
    return {
      persona: 'dana',
      description: 'מקרה מורכב - דורש ייעוץ מקצועי',
      characteristics: [
        'מספר חובות',
        'תביעות משפטיות',
        'סכומים בינוניים',
        'פיגור משמעותי',
      ],
      recommendedApproach: 'עורך דין בחובות + יועץ הסדרים',
      estimatedResolutionTime: '2-4 חודשים',
    };
  }

  // Yossi: Simple cases
  return {
    persona: 'yossi',
    description: 'מקרה פשוט - ניתן לפתור עם הכוונה',
    characteristics: [
      'חוב יחיד או שניים',
      'פיגור קטן',
      'סכום קטן לבינוני',
      'ללא הליכים משפטיים',
    ],
    recommendedApproach: 'יועץ כלכלי + הסדר ישיר',
    estimatedResolutionTime: '1-2 חודשים',
  };
}

/**
 * Generate legal considerations based on debt types and Israeli law
 */
function generateLegalConsiderations(debts: Debt[]): LegalConsideration[] {
  const considerations: LegalConsideration[] = [];

  // Amendment 13 - Privacy Protection
  considerations.push({
    law: 'תיקון 13 לחוק הגנת הפרטיות',
    applicability: true,
    description: 'הגנה על מידע אישי בתהליך הטיפול בחובות',
    action: 'יש לחתום על הסכם הסכמה לעיבוד מידע',
  });

  // Check for mortgage
  if (debts.some(d => d.subcategory === 'mortgage')) {
    considerations.push({
      law: 'חוק הערכאות בנושי משכנתא',
      applicability: true,
      description: 'הגנה מיוחדת לחייבים במשכנתא',
      action: 'בדוק אפשרויות הגנה על הנכס',
    });
  }

  // Check for enforcement
  if (debts.some(d => d.legal_status === 'enforcement' || d.legal_status === 'levy')) {
    considerations.push({
      law: 'חוק הוצאה לפועל',
      applicability: true,
      description: 'זכויות החייב בהליך הוצאה לפועל',
      action: 'פנה לעורך דין לבדיקת זכויותיך',
    });
  }

  // Check for multiple creditors
  if (debts.length > 2) {
    considerations.push({
      law: 'חוק הסדרי חובות',
      applicability: true,
      description: 'אפשרות להסדר כולל עם כל הנושים',
      action: 'שקול הסדר כולל עם כל הנושים',
    });
  }

  return considerations;
}

/**
 * Generate automated tasks based on diagnosis
 */
function generateAutomatedTasks(debts: Debt[], persona: PersonaClassification): AutomatedTask[] {
  const tasks: AutomatedTask[] = [];
  const today = new Date();

  // Task 1: Collect case numbers
  if (debts.some(d => d.legal_status === 'lawsuit' || d.legal_status === 'enforcement')) {
    tasks.push({
      id: 'task_1',
      title: 'אסוף מספרי תיקים',
      description: 'אסוף את מספרי התיקים מכל הגופים המשפטיים',
      dueDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'high',
      assignedTo: 'user',
      status: 'pending',
    });
  }

  // Task 2: Document gathering
  tasks.push({
    id: 'task_2',
    title: 'אסוף מסמכים רלוונטיים',
    description: 'אסוף חשבוניות, הודעות משפטיות, ותיקים',
    dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    assignedTo: 'user',
    status: 'pending',
  });

  // Task 3: Contact creditors
  if (persona.persona === 'yossi') {
    tasks.push({
      id: 'task_3',
      title: 'צור קשר עם הנושים',
      description: 'צור קשר ישיר עם הנושים להצעת הסדר',
      dueDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'medium',
      assignedTo: 'user',
      status: 'pending',
    });
  }

  // Task 4: Schedule professional consultation
  tasks.push({
    id: 'task_4',
    title: 'קבע פגישה עם מומחה',
    description: `קבע פגישה עם ${persona.recommendedApproach}`,
    dueDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    priority: persona.persona === 'avi' ? 'high' : 'medium',
    assignedTo: 'professional',
    status: 'pending',
  });

  // Task 5: Financial planning
  tasks.push({
    id: 'task_5',
    title: 'תכנן תוכנית פיננסית',
    description: 'בנה תוכנית תשלומים בהתאם ליכולתך',
    dueDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'medium',
    assignedTo: 'professional',
    status: 'pending',
  });

  return tasks;
}

/**
 * Find matching professionals based on persona and case complexity
 */
function findMatchingProfessionals(persona: PersonaClassification, totalScore: number): ProfessionalMatch[] {
  // Mock data - in production, this would query a database
  const professionals: ProfessionalMatch[] = [];

  if (persona.persona === 'avi') {
    professionals.push({
      id: 'prof_1',
      name: 'עו"ד דוד כהן',
      specialty: 'חדלות פירעון וחובות',
      matchPercentage: 95,
      experience: 15,
      casesSimilar: 250,
      successRate: 0.88,
      availability: 'זמין תוך 48 שעות',
    });
  } else if (persona.persona === 'dana') {
    professionals.push({
      id: 'prof_2',
      name: 'עו"ד רחל לוי',
      specialty: 'הסדרי חובות',
      matchPercentage: 92,
      experience: 12,
      casesSimilar: 180,
      successRate: 0.85,
      availability: 'זמינה תוך שבוע',
    });
  } else {
    professionals.push({
      id: 'prof_3',
      name: 'יועץ כלכלי מוטי',
      specialty: 'ייעוץ כלכלי',
      matchPercentage: 90,
      experience: 10,
      casesSimilar: 150,
      successRate: 0.82,
      availability: 'זמין תוך 3 ימים',
    });
  }

  return professionals;
}

/**
 * Main diagnosis function with all advanced features
 */
export function calculateAdvancedDiagnosis(
  debts: Debt[],
  hasStableIncome: boolean = true,
  hasAssetAtRisk: boolean = false
): DiagnosisWithPersona {
  if (!debts || debts.length === 0) {
    throw new Error('No debts provided for diagnosis');
  }

  // Calculate individual scores
  const scoringFactors: ScoringFactors = {
    amountScore: Math.max(...debts.map(d => calculateAmountScore(d.amount))),
    monthsLateScore: Math.max(...debts.map(d => calculateMonthsLateScore(d.months_late))),
    legalStatusScore: Math.max(...debts.map(d => calculateLegalStatusScore(d.legal_status))),
    creditorCountScore: calculateCreditorCountScore(debts.length),
    stableIncomeScore: hasStableIncome ? 0 : 30,
    assetAtRiskScore: hasAssetAtRisk ? 100 : 0,
    multiDebtPenalty: calculateMultiDebtPenalty(debts.length),
    urgencyScore: Math.max(...debts.map(d => calculateUrgencyScore(d.legal_status, d.months_late))),
    complianceScore: 0, // Will be calculated based on legal considerations
  };

  // Calculate total score
  const totalScore =
    Math.max(scoringFactors.amountScore, scoringFactors.monthsLateScore) +
    scoringFactors.legalStatusScore +
    scoringFactors.creditorCountScore +
    scoringFactors.stableIncomeScore +
    scoringFactors.assetAtRiskScore +
    scoringFactors.multiDebtPenalty;

  // Classify persona
  const persona = classifyPersona(debts, totalScore);

  // Determine risk level
  let riskLevel: 'נמוך' | 'בינוני' | 'גבוה' | 'קריטי';
  if (totalScore > 300) riskLevel = 'קריטי';
  else if (totalScore > 150) riskLevel = 'גבוה';
  else if (totalScore > 50) riskLevel = 'בינוני';
  else riskLevel = 'נמוך';

  // Generate recommendation
  const recommendation = `${persona.description}. ${persona.recommendedApproach}`;

  // Generate next steps
  const nextSteps = generateNextSteps(debts, totalScore, riskLevel);

  // Find matching professionals
  const matchedProfessionals = findMatchingProfessionals(persona, totalScore);

  // Generate legal considerations
  const legalConsiderations = generateLegalConsiderations(debts);

  // Generate automated tasks
  const automatedTasks = generateAutomatedTasks(debts, persona);

  return {
    totalScore,
    riskLevel,
    persona,
    recommendation,
    nextSteps,
    matchedProfessionals,
    scoringBreakdown: scoringFactors,
    legalConsiderations,
    automatedTasks,
  };
}

/**
 * Generate next steps based on diagnosis
 */
function generateNextSteps(debts: Debt[], totalScore: number, riskLevel: string): string[] {
  const steps: string[] = [];

  // Immediate actions based on legal status
  const hasEnforcement = debts.some(d => d.legal_status === 'enforcement' || d.legal_status === 'levy');
  const hasLawsuit = debts.some(d => d.legal_status === 'lawsuit');
  const hasMortgage = debts.some(d => d.subcategory === 'mortgage');

  if (hasEnforcement) {
    steps.push('1. אסוף מספר תיק מהגוף המשפטי בתוך 48 שעות');
  }

  if (hasLawsuit) {
    steps.push('2. התייעץ עם עורך דין בעניין התביעה');
  }

  if (hasMortgage) {
    steps.push('3. בדוק סיכון נכס עם מומחה');
  }

  if (debts.length >= 3) {
    steps.push(`${steps.length + 1}. שקול הסדר כולל עם כל הנושים`);
  }

  if (totalScore > 150) {
    steps.push(`${steps.length + 1}. בקש ייעוץ משפטי מיידי`);
  }

  if (totalScore > 300) {
    steps.push(`${steps.length + 1}. בדוק אפשרות חדלות פירעון עם עורך דין מומחה`);
  }

  if (steps.length === 0) {
    steps.push('צור קשר עם יועץ כלכלי להכנת תוכנית הסדרים');
  }

  return steps;
}
