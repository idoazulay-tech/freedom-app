import { invokeLLM } from '../_core/llm';

export interface TriageResult {
  severity: 'low' | 'medium' | 'high' | 'critical';
  persona: 'yossi' | 'dana' | 'avi';
  reasoning: string;
  recommendations: string[];
}

/**
 * סיווג חוב לפי חומרה ופרסונה
 * - Yossi: חוב התחלתי, פחד, צריך הכוונה ראשונית
 * - Dana: חוב מתקדם, כמה התחייבויות, בלבול
 * - Avi: חוב משברי, הוצאה לפועל, מכתבים משפטיים
 */
export async function triageDebt(input: {
  totalDebtAmount: string;
  debtType: string;
  monthlyIncome?: string;
  monthlyExpenses?: string;
  paymentHistory?: string;
  collectionActions?: string;
  additionalContext?: string;
}): Promise<TriageResult> {
  const prompt = `
אתה מומחה בניהול חובות בישראל. סווג את מצב החוב הבא לפי חומרה ופרסונה.

פרטי החוב:
- סכום חוב כולל: ${input.totalDebtAmount} ש"ח
- סוג חוב: ${input.debtType}
- הכנסה חודשית: ${input.monthlyIncome || 'לא ידוע'}
- הוצאות חודשיות: ${input.monthlyExpenses || 'לא ידוע'}
- היסטוריית תשלומים: ${input.paymentHistory || 'לא ידוע'}
- פעולות גבייה: ${input.collectionActions || 'לא ידוע'}
- הקשר נוסף: ${input.additionalContext || 'אין'}

בחר את הפרסונה המתאימה ביותר:
1. Yossi (התחלתי): חוב ראשון, פחד, צריך הכוונה ראשונית וסדר
2. Dana (מתקדם): כמה חובות, בלבול, צריך ארגון וניהול
3. Avi (משברי): הוצאה לפועל, מכתבים משפטיים, צריך עו"ד ודחיפות

קבע את רמת החומרה:
- Low: חוב קטן, תשלומים בזמן, אין פעולות משפטיות
- Medium: חוב בינוני, כמה פיגורים, אך אפשר להסדיר
- High: חוב גדול, פיגורים משמעותיים, פעולות גבייה
- Critical: הוצאה לפועל, מכתבים משפטיים, סכנה של הליך משפטי

תן תשובה בפורמט JSON:
{
  "severity": "low|medium|high|critical",
  "persona": "yossi|dana|avi",
  "reasoning": "הסבר קצר למה בחרת בפרסונה וחומרה זו",
  "recommendations": ["המלצה 1", "המלצה 2", "המלצה 3"]
}
`;

  const response = await invokeLLM({
    messages: [
      {
        role: 'system',
        content: 'אתה מומחה בניהול חובות בישראל. תשובותיך תמיד בעברית ובפורמט JSON תקין.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'triage_result',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            severity: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
              description: 'רמת חומרת החוב',
            },
            persona: {
              type: 'string',
              enum: ['yossi', 'dana', 'avi'],
              description: 'הפרסונה המתאימה',
            },
            reasoning: {
              type: 'string',
              description: 'הסבר להחלטה',
            },
            recommendations: {
              type: 'array',
              items: { type: 'string' },
              description: 'המלצות לצעדים הבאים',
            },
          },
          required: ['severity', 'persona', 'reasoning', 'recommendations'],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = response.choices[0]?.message.content;
    if (!content || typeof content !== 'string') {
      throw new Error('לא קיבלנו תשובה מה-AI');
    }

    const result = JSON.parse(content) as TriageResult;
    return result;
  } catch (error) {
    console.error('שגיאה בפירוש תשובת ה-AI:', error);
    throw new Error('שגיאה בסיווג החוב');
  }
}
