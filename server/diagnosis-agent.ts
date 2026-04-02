import { invokeLLM } from './_core/llm';
import {
  getDebtTypeInfo,
  getProfessionalRouting,
  calculateDebtTypeRiskScore,
  DEBT_TYPES,
} from './lib/debtResearchDatabase';
import {
  calculatePersonalizedSolutions,
  PaymentPlan,
} from './lib/personalizedSolutionEngine';
import {
  findMatchingProfessionals,
  MatchingResult,
} from './lib/professionalMatchingEngine';

export interface DiagnosisInput {
  debts: Array<{
    category: string;
    amount: number;
    monthsLate: number;
    legalStatus: string;
  }>;
  monthlyIncome: number;
  monthlyExpenses: number;
  creditorCount: number;
  hasEnforcement: boolean;
  hasWarningLetters: boolean;
}

export interface DiagnosisResult {
  persona: 'Yossi' | 'Dana' | 'Avi';
  personaDescription: string;
  riskScore: number;
  riskLevel: 'נמוך' | 'בינוני' | 'גבוה' | 'קריטי';
  totalDebt: number;
  monthlyAvailable: number;
  debtToIncomeRatio: number;
  recommendations: string[];
  legalConsiderations: string[];
  warningSigns: string[];
  solutions: Array<{
    name: string;
    description: string;
    difficulty: string;
    timeframe: string;
  }>;
  automatedTasks: Array<{ title: string; description: string; priority: string }>;
  matchedProfessionals: Array<{
    name: string;
    specialty: string;
    matchPercentage: number;
    successRate: number;
    experience: number;
  }>;
  nextSteps: string[];
  debtBreakdown: Array<{
    type: string;
    amount: number;
    riskScore: number;
    solutions: string[];
  }>;
  paymentPlan?: PaymentPlan;
  professionalMatches?: MatchingResult[];
}

/**
 * Diagnosis Agent - מבצע אבחון מלא של מצב החוב
 * משתמש ב-LLM כדי לנתח את הנתונים ולתת המלצות
 * משתמש ב-Research Database לנתונים מדויקים
 */
export async function performDiagnosis(input: DiagnosisInput): Promise<DiagnosisResult> {
  // Calculate basic metrics
  const totalDebt = input.debts.reduce((sum, debt) => sum + debt.amount, 0);
  const monthlyAvailable = Math.max(0, input.monthlyIncome - input.monthlyExpenses);
  const debtToIncomeRatio = input.monthlyIncome > 0 ? totalDebt / (input.monthlyIncome * 12) : 0;

  // Calculate risk score (0-200) using research-backed data
  const riskScore = calculateRiskScore(input, totalDebt, monthlyAvailable);
  const riskLevel = getRiskLevel(riskScore);

  // Classify persona (Yossi/Dana/Avi)
  const persona = classifyPersona(input, riskScore, monthlyAvailable);

  // Get debt breakdown with research data
  const debtBreakdown = getDebtBreakdown(input);

  // Get warning signs from research database
  const warningSigns = extractWarningSigns(input);

  // Get solutions from research database
  const solutions = extractSolutions(input);

  // Get LLM-based analysis
  const llmAnalysis = await getLLMAnalysis(input, totalDebt, persona, riskScore, debtBreakdown);

  // Generate matched professionals based on research routing and matching engine
  const matchedProfessionals = generateMatchedProfessionals(persona, riskLevel, input);
  
  // Calculate personalized solutions
  const paymentPlan = calculatePersonalizedSolutions(
    input.debts.map(d => ({
      type: getDebtTypeInfo(d.category)?.hebrewName || d.category,
      amount: d.amount,
      monthlyPayment: d.amount / 60, // Estimate
      interestRate: getDebtTypeInfo(d.category)?.interestRate.max || 10,
      monthsLate: d.monthsLate,
      legalStatus: d.legalStatus,
    })),
    input.monthlyIncome,
    input.monthlyExpenses
  );
  
  // Find matching professionals using advanced matching engine
  const debtTypeIds = input.debts.map(d => d.category);
  const professionalMatches = findMatchingProfessionals(
    debtTypeIds,
    riskLevel,
    input.hasEnforcement,
    input.hasWarningLetters,
    input.debts.length > 1,
    input.monthlyIncome - input.monthlyExpenses
  );

  // Generate automated tasks based on research data
  const automatedTasks = generateAutomatedTasks(riskLevel, input, persona, debtBreakdown);

  return {
    persona,
    personaDescription: getPersonaDescription(persona),
    riskScore,
    riskLevel,
    totalDebt,
    monthlyAvailable,
    debtToIncomeRatio,
    recommendations: llmAnalysis.recommendations,
    legalConsiderations: llmAnalysis.legalConsiderations,
    warningSigns,
    solutions,
    automatedTasks,
    matchedProfessionals,
    nextSteps: llmAnalysis.nextSteps,
    debtBreakdown,
    paymentPlan,
    professionalMatches,
  };
}

/**
 * Get debt breakdown with research data
 */
function getDebtBreakdown(
  input: DiagnosisInput
): Array<{
  type: string;
  amount: number;
  riskScore: number;
  solutions: string[];
}> {
  return input.debts.map(debt => {
    const debtTypeInfo = getDebtTypeInfo(debt.category);
    const riskScore = calculateDebtTypeRiskScore(debt.category, debt.amount, debt.monthsLate, debt.legalStatus);

    return {
      type: debtTypeInfo?.hebrewName || debt.category,
      amount: debt.amount,
      riskScore,
      solutions: debtTypeInfo?.solutions.map(s => s.name) || [],
    };
  });
}

/**
 * Extract warning signs from research database
 */
function extractWarningSigns(input: DiagnosisInput): string[] {
  const signs = new Set<string>();

  for (const debt of input.debts) {
    const debtTypeInfo = getDebtTypeInfo(debt.category);
    if (!debtTypeInfo) continue;

    // Determine severity based on months late and legal status
    let severity: 'critical' | 'medium' | 'low' = 'low';

    if (debt.legalStatus === 'enforcement' || debt.legalStatus === 'levy' || debt.legalStatus === 'insolvency') {
      severity = 'critical';
    } else if (debt.monthsLate >= 6 || debt.legalStatus === 'lawsuit') {
      severity = 'medium';
    }

    // Add warning signs based on severity
    if (severity === 'critical') {
      debtTypeInfo.warningSigns.critical.forEach(sign => signs.add(`⚠️ ${sign}`));
    } else if (severity === 'medium') {
      debtTypeInfo.warningSigns.medium.forEach(sign => signs.add(`⚠️ ${sign}`));
    } else {
      debtTypeInfo.warningSigns.low.forEach(sign => signs.add(`⚠️ ${sign}`));
    }
  }

  // Add general warning signs
  if (input.hasEnforcement) {
    signs.add('⚠️ יש הוצאה לפועל פעילה');
  }

  if (input.hasWarningLetters) {
    signs.add('⚠️ יש הודעות משפטיות');
  }

  if (input.creditorCount > 3) {
    signs.add(`⚠️ יש ${input.creditorCount} נושים שונים`);
  }

  if (input.monthlyIncome <= input.monthlyExpenses) {
    signs.add('⚠️ הכנסה נמוכה מהוצאות');
  }

  return Array.from(signs);
}

/**
 * Extract solutions from research database
 */
function extractSolutions(
  input: DiagnosisInput
): Array<{
  name: string;
  description: string;
  difficulty: string;
  timeframe: string;
}> {
  const solutions = new Map<string, { name: string; description: string; difficulty: string; timeframe: string }>();

  for (const debt of input.debts) {
    const debtTypeInfo = getDebtTypeInfo(debt.category);
    if (!debtTypeInfo) continue;

    // Add solutions from research database
    for (const solution of debtTypeInfo.solutions) {
      if (!solutions.has(solution.name)) {
        solutions.set(solution.name, {
          name: solution.name,
          description: solution.description,
          difficulty: solution.difficulty,
          timeframe: solution.timeframe,
        });
      }
    }
  }

  // Sort by difficulty (easy first)
  const difficultyOrder = { easy: 0, medium: 1, hard: 2 };
  return Array.from(solutions.values()).sort(
    (a, b) => (difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 0) - (difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 0)
  );
}

/**
 * Calculate risk score (0-200 scale) using research-backed data
 */
function calculateRiskScore(input: DiagnosisInput, totalDebt: number, monthlyAvailable: number): number {
  let score = 0;

  // Debt amount score (0-60)
  if (totalDebt < 10000) score += 10;
  else if (totalDebt < 50000) score += 30;
  else if (totalDebt < 100000) score += 45;
  else score += 60;

  // Months late score (0-60)
  const maxMonthsLate = Math.max(...input.debts.map(d => d.monthsLate), 0);
  if (maxMonthsLate < 3) score += 10;
  else if (maxMonthsLate < 6) score += 30;
  else if (maxMonthsLate < 12) score += 45;
  else score += 60;

  // Legal status score (0-200) - using research-backed scores
  const legalScores = input.debts.map(debt => {
    const debtTypeInfo = getDebtTypeInfo(debt.category);
    if (!debtTypeInfo) {
      // Default scores if debt type not found
      switch (debt.legalStatus) {
        case 'overdue': return 0;
        case 'demand_letter': return 20;
        case 'lawsuit': return 50;
        case 'enforcement': return 100;
        case 'levy': return 150;
        case 'insolvency': return 200;
        default: return 0;
      }
    }

    // Use research-backed enforcement speed
    const speedPenalties: Record<string, number> = {
      slow: 0,
      medium: 10,
      fast: 30,
      very_fast: 50,
    };

    let baseScore = 0;
    switch (debt.legalStatus) {
      case 'overdue': baseScore = 0; break;
      case 'demand_letter': baseScore = 20; break;
      case 'lawsuit': baseScore = 50; break;
      case 'enforcement': baseScore = 100; break;
      case 'levy': baseScore = 150; break;
      case 'insolvency': baseScore = 200; break;
      default: baseScore = 0;
    }

    return baseScore + speedPenalties[debtTypeInfo.riskFactors.enforcementSpeed] || 0;
  });

  score += Math.max(...legalScores, 0);

  // Creditor count score (0-60)
  if (input.creditorCount === 1) score += 10;
  else if (input.creditorCount <= 3) score += 30;
  else score += 60;

  // Multi-debt penalty (0-90)
  if (input.debts.length > 1) {
    score += Math.min((input.debts.length - 1) * 15, 90);
  }

  // Income stability score (0-30)
  if (input.monthlyIncome > 0) {
    const debtToIncomeRatio = totalDebt / (input.monthlyIncome * 12);
    if (debtToIncomeRatio < 2) score -= 10;
    else if (debtToIncomeRatio < 5) score -= 5;
  }

  // Enforcement penalty
  if (input.hasEnforcement) score += 50;
  if (input.hasWarningLetters) score += 20;

  // Normalize to 0-200
  return Math.max(0, Math.min(200, score));
}

/**
 * Get risk level based on score
 */
function getRiskLevel(score: number): 'נמוך' | 'בינוני' | 'גבוה' | 'קריטי' {
  if (score < 50) return 'נמוך';
  if (score < 100) return 'בינוני';
  if (score < 150) return 'גבוה';
  return 'קריטי';
}

/**
 * Classify persona (Yossi/Dana/Avi)
 */
function classifyPersona(input: DiagnosisInput, riskScore: number, monthlyAvailable: number): 'Yossi' | 'Dana' | 'Avi' {
  // Yossi: Low risk, stable income, can pay
  if (riskScore < 50 && monthlyAvailable > 0) return 'Yossi';

  // Dana: Medium risk, some income, needs help
  if (riskScore < 100 && input.monthlyIncome > 0) return 'Dana';

  // Avi: High risk, critical situation, needs urgent help
  return 'Avi';
}

/**
 * Get persona description
 */
function getPersonaDescription(persona: 'Yossi' | 'Dana' | 'Avi'): string {
  const descriptions: Record<'Yossi' | 'Dana' | 'Avi', string> = {
    Yossi: 'יוסי - מצב יציב עם יכולת תשלום. צריך תוכנית מסודרת.',
    Dana: 'דנה - מצב בינוני עם אתגרים. צריך ליווי מקצועי.',
    Avi: 'אבי - מצב קריטי דורש התערבות דחופה. צריך עזרה מיידית.',
  };
  return descriptions[persona];
}

/**
 * Get LLM-based analysis using research data
 */
async function getLLMAnalysis(
  input: DiagnosisInput,
  totalDebt: number,
  persona: string,
  riskScore: number,
  debtBreakdown: Array<{ type: string; amount: number; riskScore: number; solutions: string[] }>
): Promise<{
  recommendations: string[];
  legalConsiderations: string[];
  nextSteps: string[];
}> {
  const debtTypesInfo = input.debts
    .map(d => {
      const info = getDebtTypeInfo(d.category);
      return `- ${info?.hebrewName || d.category}: ₪${d.amount}, ${d.monthsLate} חודשים בפיגור, סטטוס: ${d.legalStatus}`;
    })
    .join('\n');

  const prompt = `
אתה יועץ פיננסי-משפטי מנוסה בהטיפול בחובות בישראל. בחן את המצב הבא ותן המלצות ספציפיות ומעשיות:

מצב החוב:
- סה"כ חובות: ₪${totalDebt}
- חובות:
${debtTypesInfo}

מצב פיננסי:
- הכנסה חודשית: ₪${input.monthlyIncome}
- הוצאות חודשיות: ₪${input.monthlyExpenses}
- זמין לתשלום חובות: ₪${Math.max(0, input.monthlyIncome - input.monthlyExpenses)}

מצב משפטי:
- מספר נושים: ${input.creditorCount}
- יש הוצאה לפועל: ${input.hasEnforcement ? 'כן' : 'לא'}
- יש הודעות משפטיות: ${input.hasWarningLetters ? 'כן' : 'לא'}

סיווג:
- סוג Persona: ${persona}
- ניקוד סיכון: ${riskScore}/200

בחן את המצב בהתאם לחוקים בישראל ותן המלצות ברורות, מעשיות וממוקדות.

ענה בפורמט JSON עם השדות הבאים:
{
  "recommendations": ["המלצה 1 - ספציפית ומעשית", "המלצה 2", ...],
  "legalConsiderations": ["שיקול משפטי 1 - בהתאם לחוקים בישראל", "שיקול משפטי 2", ...],
  "nextSteps": ["צעד הבא 1 - מה לעשות היום", "צעד הבא 2 - מה לעשות בשבוע", ...]
}

תן לפחות 3 המלצות, 3 שיקולים משפטיים ו-3 צעדים הבאים.
  `;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'אתה יועץ פיננסי-משפטי מנוסה בהטיפול בחובות בישראל. תן המלצות ברורות, מעשיות וממוקדות בהתאם לחוקים בישראל.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'diagnosis_analysis',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              recommendations: {
                type: 'array',
                items: { type: 'string' },
                description: 'רשימת המלצות ספציפיות ומעשיות',
              },
              legalConsiderations: {
                type: 'array',
                items: { type: 'string' },
                description: 'שיקולים משפטיים בהתאם לחוקים בישראל',
              },
              nextSteps: {
                type: 'array',
                items: { type: 'string' },
                description: 'צעדים הבאים - מה לעשות היום, בשבוע, בחודשים הקרובים',
              },
            },
            required: ['recommendations', 'legalConsiderations', 'nextSteps'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    if (typeof content === 'string') {
      return JSON.parse(content);
    }
    // If content is not a string, it's an array of content objects
    if (Array.isArray(content) && content.length > 0) {
      const textContent = content.find((c: any) => c.type === 'text');
      if (textContent && 'text' in textContent) {
        return JSON.parse(textContent.text);
      }
    }
    return getDefaultAnalysis();
  } catch (error) {
    console.error('Error getting LLM analysis:', error);
    return getDefaultAnalysis();
  }
}

/**
 * Get default analysis if LLM fails
 */
function getDefaultAnalysis() {
  return {
    recommendations: [
      'פנה לעורך דין המתמחה בדיני חובות',
      'בנה תוכנית תשלומים מפורטת',
      'אסוף את כל המסמכים הרלוונטיים',
    ],
    legalConsiderations: [
      'בדוק את זכויותיך לפי חוק הגנת הצרכן',
      'שמור על כל התיקיות והמסמכים',
      'דע את הגבלות החוקיות על גבייה',
    ],
    nextSteps: [
      'קבע פגישה עם מומחה בשבוע הקרוב',
      'הכן רשימה של כל החובות וסכומיהם',
      'תכנן תוכנית תשלומים בהתאם ליכולתך',
    ],
  };
}

/**
 * Generate matched professionals based on research routing
 */
function generateMatchedProfessionals(
  persona: string,
  riskLevel: string,
  input: DiagnosisInput
): Array<{
  name: string;
  specialty: string;
  matchPercentage: number;
  successRate: number;
  experience: number;
}> {
  // Determine which professionals are needed based on research routing
  const needsLawyer = input.debts.some(d => {
    const routing = getProfessionalRouting(d.category);
    return routing.needsLawyer && (d.legalStatus === 'enforcement' || d.legalStatus === 'levy' || d.legalStatus === 'lawsuit');
  });

  const needsFinancialAdvisor = input.debts.some(d => {
    const routing = getProfessionalRouting(d.category);
    return routing.needsFinancialAdvisor;
  });

  const needsNGO = input.debts.some(d => {
    const routing = getProfessionalRouting(d.category);
    return routing.needsNGO;
  });

  const professionals = [];

  if (needsLawyer) {
    professionals.push({
      name: 'עו"ד דוד כהן',
      specialty: 'דיני חובות ופשיטת רגל',
      matchPercentage: 95,
      successRate: 92,
      experience: 15,
    });
  }

  if (needsFinancialAdvisor) {
    professionals.push({
      name: 'יועץ פיננסי אברהם שמעון',
      specialty: 'תכניות תשלומים וסידור חובות',
      matchPercentage: 85,
      successRate: 90,
      experience: 10,
    });
  }

  if (needsNGO) {
    professionals.push({
      name: 'עמותת עזרה בחובות',
      specialty: 'ייעוץ חינם וייצוג משפטי',
      matchPercentage: 80,
      successRate: 85,
      experience: 20,
    });
  }

  // If no specific professionals needed, add general ones
  if (professionals.length === 0) {
    professionals.push({
      name: 'עו"ד שרה לוי',
      specialty: 'משא ומתן עם נושים',
      matchPercentage: 88,
      successRate: 87,
      experience: 12,
    });
  }

  return professionals.slice(0, 3); // Return top 3 matches
}

/**
 * Generate automated tasks based on research data
 */
function generateAutomatedTasks(
  riskLevel: string,
  input: DiagnosisInput,
  persona: string,
  debtBreakdown: Array<{ type: string; amount: number; riskScore: number; solutions: string[] }>
): Array<{ title: string; description: string; priority: string }> {
  const tasks = [];

  // Always add these tasks
  tasks.push({
    title: 'אסוף מסמכים',
    description: 'אסוף חשבוניות, הודעות משפטיות, תיקים, הסכמים',
    priority: 'high',
  });

  tasks.push({
    title: 'בדוק זכויות',
    description: 'בדוק את זכויותיך לפי חוק הגנת הצרכן וחוקים רלוונטיים',
    priority: 'high',
  });

  // Risk-specific tasks
  if (input.hasEnforcement) {
    tasks.push({
      title: 'פנה לעורך דין דחוף',
      description: 'פנה לעורך דין בעניין הוצאה לפועל פעילה',
      priority: 'high',
    });
  }

  if (riskLevel === 'קריטי') {
    tasks.push({
      title: 'קבע פגישה דחופה',
      description: 'קבע פגישה דחופה עם מומחה בתוך 48 שעות',
      priority: 'high',
    });
  }

  // Debt-specific tasks
  for (const debt of input.debts) {
    const debtTypeInfo = getDebtTypeInfo(debt.category);
    if (debtTypeInfo && debt.legalStatus === 'enforcement') {
      tasks.push({
        title: `טפל בהוצאה לפועל - ${debtTypeInfo.hebrewName}`,
        description: `יש הוצאה לפועל פעילה בגין ${debtTypeInfo.hebrewName}. דרוש טיפול דחוף.`,
        priority: 'high',
      });
    }
  }

  tasks.push({
    title: 'בנה תוכנית תשלומים',
    description: 'בנה תוכנית תשלומים מפורטת בהתאם ליכולתך',
    priority: 'medium',
  });

  tasks.push({
    title: 'עקוב אחרי התקדמות',
    description: 'עקוב אחרי התקדמות הטיפול וההודעות משפטיות',
    priority: 'medium',
  });

  return tasks;
}


