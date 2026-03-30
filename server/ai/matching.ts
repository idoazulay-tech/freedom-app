import { invokeLLM } from '../_core/llm';

export interface MatchingResult {
  recommendedSpecialties: string[];
  matchingScore: number;
  reasoning: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * התאמה חכמה בין חייב למומחה לפי סוג ורמת החוב
 */
export async function matchDebtorToProfessional(input: {
  severity: 'low' | 'medium' | 'high' | 'critical';
  persona: 'yossi' | 'dana' | 'avi';
  debtType: string;
  totalDebtAmount: string;
  hasLegalNotices: boolean;
  hasCollectionActions: boolean;
  additionalContext?: string;
}): Promise<MatchingResult> {
  const prompt = `
אתה מומחה בניהול חובות בישראל ובהתאמה בין חייבים לבעלי מקצוע.

פרטי החייב:
- רמת חומרה: ${input.severity}
- פרסונה: ${input.persona}
- סוג חוב: ${input.debtType}
- סכום חוב: ${input.totalDebtAmount} ש"ח
- יש מכתבים משפטיים: ${input.hasLegalNotices ? 'כן' : 'לא'}
- יש פעולות גבייה: ${input.hasCollectionActions ? 'כן' : 'לא'}
- הקשר נוסף: ${input.additionalContext || 'אין'}

בחר את התמחויות המתאימות ביותר מהרשימה:
- עורך דין (חדלות פירעון) - עבור חובות משפטיים וחוקיים
- יועץ כלכלי - עבור תכנון תקציב והסדרת חובות
- רואה חשבון / יועץ מס - עבור חובות מס וניהול כלכלי
- מלווה שיקום כלכלי - עבור ליווי ארוך טווח
- מומחה בנכסים - עבור בעיות משכנתא ונכסים
- מתווך הסדרות - עבור משא ומתן עם נושים

קבע את רמת הדחיפות:
- Low: יש זמן, אפשר לתכנן
- Medium: צריך לפעול בשבועות הקרובים
- High: צריך לפעול בימים הקרובים
- Critical: צריך לפעול מיידית

תן תשובה בפורמט JSON:
{
  "recommendedSpecialties": ["תמחות 1", "תמחות 2"],
  "matchingScore": 85,
  "reasoning": "הסבר למה בחרת בתמחויות אלה",
  "urgencyLevel": "high"
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
        name: 'matching_result',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            recommendedSpecialties: {
              type: 'array',
              items: { type: 'string' },
              description: 'התמחויות המומלצות',
            },
            matchingScore: {
              type: 'number',
              description: 'ניקוד התאמה מ-0 ל-100',
              minimum: 0,
              maximum: 100,
            },
            reasoning: {
              type: 'string',
              description: 'הסבר להחלטה',
            },
            urgencyLevel: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
              description: 'רמת הדחיפות',
            },
          },
          required: ['recommendedSpecialties', 'matchingScore', 'reasoning', 'urgencyLevel'],
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

    const result = JSON.parse(content) as MatchingResult;
    return result;
  } catch (error) {
    console.error('שגיאה בהתאמה:', error);
    throw new Error('שגיאה בהתאמה בין חייב למומחה');
  }
}
