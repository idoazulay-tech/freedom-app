import { invokeLLM } from './_core/llm';

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
  automatedTasks: Array<{ title: string; description: string; priority: string }>;
  matchedProfessionals: Array<{
    name: string;
    specialty: string;
    matchPercentage: number;
    successRate: number;
    experience: number;
  }>;
  nextSteps: string[];
}

/**
 * Diagnosis Agent - מבצע אבחון מלא של מצב החוב
 * משתמש ב-LLM כדי לנתח את הנתונים ולתת המלצות
 */
export async function performDiagnosis(input: DiagnosisInput): Promise<DiagnosisResult> {
  // Calculate basic metrics
  const totalDebt = input.debts.reduce((sum, debt) => sum + debt.amount, 0);
  const monthlyAvailable = Math.max(0, input.monthlyIncome - input.monthlyExpenses);
  const debtToIncomeRatio = input.monthlyIncome > 0 ? totalDebt / (input.monthlyIncome * 12) : 0;

  // Calculate risk score (0-200)
  const riskScore = calculateRiskScore(input, totalDebt, monthlyAvailable);
  const riskLevel = getRiskLevel(riskScore);

  // Classify persona (Yossi/Dana/Avi)
  const persona = classifyPersona(input, riskScore, monthlyAvailable);

  // Get LLM-based analysis
  const llmAnalysis = await getLLMAnalysis(input, totalDebt, persona, riskScore);

  // Generate matched professionals
  const matchedProfessionals = generateMatchedProfessionals(persona, riskLevel, input);

  // Generate automated tasks
  const automatedTasks = generateAutomatedTasks(riskLevel, input, persona);

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
    automatedTasks,
    matchedProfessionals,
    nextSteps: llmAnalysis.nextSteps,
  };
}

/**
 * Calculate risk score (0-200 scale)
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

  // Legal status score (0-200)
  const legalScores = input.debts.map(debt => {
    switch (debt.legalStatus) {
      case 'overdue': return 0;
      case 'demand_letter': return 20;
      case 'lawsuit': return 50;
      case 'enforcement': return 100;
      case 'levy': return 150;
      case 'insolvency': return 200;
      default: return 0;
    }
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
 * Get LLM-based analysis
 */
async function getLLMAnalysis(
  input: DiagnosisInput,
  totalDebt: number,
  persona: string,
  riskScore: number
): Promise<{
  recommendations: string[];
  legalConsiderations: string[];
  nextSteps: string[];
}> {
  const prompt = `
אתה יועץ פיננסי-משפטי מנוסה. בחן את המצב הבא ותן המלצות:

מצב החוב:
- סה"כ חובות: ₪${totalDebt}
- מספר נושים: ${input.creditorCount}
- הכנסה חודשית: ₪${input.monthlyIncome}
- הוצאות חודשיות: ₪${input.monthlyExpenses}
- יש הוצאה לפועל: ${input.hasEnforcement ? 'כן' : 'לא'}
- יש הודעות משפטיות: ${input.hasWarningLetters ? 'כן' : 'לא'}
- סוג persona: ${persona}
- ניקוד סיכון: ${riskScore}/200

בחן את המצב וענה בפורמט JSON עם השדות הבאים:
{
  "recommendations": ["המלצה 1", "המלצה 2", ...],
  "legalConsiderations": ["שיקול משפטי 1", "שיקול משפטי 2", ...],
  "nextSteps": ["צעד הבא 1", "צעד הבא 2", ...]
}

תן המלצות ספציפיות, מעשיות וברורות.
  `;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'אתה יועץ פיננסי-משפטי מנוסה בהטיפול בחובות. תן המלצות ברורות ומעשיות.',
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
                description: 'רשימת המלצות',
              },
              legalConsiderations: {
                type: 'array',
                items: { type: 'string' },
                description: 'שיקולים משפטיים',
              },
              nextSteps: {
                type: 'array',
                items: { type: 'string' },
                description: 'צעדים הבאים',
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
    return {
      recommendations: ['פנה לעורך דין', 'בנה תוכנית תשלומים', 'אסוף מסמכים'],
      legalConsiderations: ['בדוק את זכויותיך', 'שמור על תיקיות', 'דע את ההגבלה'],
      nextSteps: ['קבע פגישה', 'הכן מסמכים', 'תכנן תשלומים'],
    }
  } catch (error) {
    console.error('Error getting LLM analysis:', error);
    return {
      recommendations: ['פנה לעורך דין', 'בנה תוכנית תשלומים', 'אסוף מסמכים'],
      legalConsiderations: ['בדוק את זכויותיך', 'שמור על תיקיות', 'דע את ההגבלה'],
      nextSteps: ['קבע פגישה', 'הכן מסמכים', 'תכנן תשלומים'],
    };
  }
}

/**
 * Generate matched professionals
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
  const professionals = [
    {
      name: 'עו"ד דוד כהן',
      specialty: 'דיני חובות ופשיטת רגל',
      matchPercentage: 95,
      successRate: 92,
      experience: 15,
    },
    {
      name: 'עו"ד שרה לוי',
      specialty: 'משא ומתן עם נושים',
      matchPercentage: 88,
      successRate: 87,
      experience: 12,
    },
    {
      name: 'יועץ פיננסי אברהם שמעון',
      specialty: 'תכניות תשלומים',
      matchPercentage: 85,
      successRate: 90,
      experience: 10,
    },
  ];

  // Adjust match based on persona and risk level
  return professionals.map(prof => ({
    ...prof,
    matchPercentage: Math.max(70, prof.matchPercentage - (riskLevel === 'קריטי' ? 5 : 0)),
  }));
}

/**
 * Generate automated tasks
 */
function generateAutomatedTasks(
  riskLevel: string,
  input: DiagnosisInput,
  persona: string
): Array<{ title: string; description: string; priority: string }> {
  const tasks = [];

  // Always add these tasks
  tasks.push({
    title: 'אסוף מסמכים',
    description: 'אסוף חשבוניות, הודעות משפטיות, תיקים',
    priority: 'high',
  });

  tasks.push({
    title: 'בדוק זכויות',
    description: 'בדוק את זכויותיך לפי חוק ההגנה על הצרכן',
    priority: 'high',
  });

  // Risk-specific tasks
  if (input.hasEnforcement) {
    tasks.push({
      title: 'פנה לעורך דין',
      description: 'פנה לעורך דין בעניין הוצאה לפועל',
      priority: 'high',
    });
  }

  if (riskLevel === 'קריטי') {
    tasks.push({
      title: 'קבע פגישה דחופה',
      description: 'קבע פגישה דחופה עם מומחה',
      priority: 'high',
    });
  }

  tasks.push({
    title: 'בנה תוכנית תשלומים',
    description: 'בנה תוכנית תשלומים בהתאם ליכולתך',
    priority: 'medium',
  });

  tasks.push({
    title: 'עקוב אחרי התקדמות',
    description: 'עקוב אחרי התקדמות הטיפול',
    priority: 'medium',
  });

  return tasks;
}
