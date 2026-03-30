import { invokeLLM } from '../_core/llm';

export interface DocumentProcessingResult {
  summary: string;
  extractedTasks: string[];
  keyDates: Array<{ date: string; description: string }>;
  actionItems: string[];
  riskFactors: string[];
}

/**
 * עיבוד מסמך: קריאה, סיכום, חילוץ משימות ודדליינים
 */
export async function processDocument(input: {
  documentType: string;
  documentContent: string;
  context?: string;
}): Promise<DocumentProcessingResult> {
  const prompt = `
אתה מומחה בניהול חובות בישראל וקריאת מסמכים משפטיים וכלכליים.

סוג המסמך: ${input.documentType}
הקשר: ${input.context || 'לא ידוע'}

תוכן המסמך:
${input.documentContent}

בצע את הפעולות הבאות:
1. סכם את המסמך בשפה פשוטה (2-3 משפטים)
2. חלץ משימות שצריך לעשות (כל משימה בשורה נפרדת)
3. זהה תאריכים חשובים (דדליינים, תאריכי בדיקה וכו')
4. זהה פעולות שצריך לעשות בהקדם
5. זהה גורמי סיכון או בעיות שצריך להתייחס אליהם

תן תשובה בפורמט JSON:
{
  "summary": "סיכום קצר של המסמך",
  "extractedTasks": ["משימה 1", "משימה 2"],
  "keyDates": [{"date": "YYYY-MM-DD", "description": "תיאור"}],
  "actionItems": ["פעולה 1", "פעולה 2"],
  "riskFactors": ["סיכון 1", "סיכון 2"]
}
`;

  const response = await invokeLLM({
    messages: [
      {
        role: 'system',
        content:
          'אתה מומחה בניהול חובות בישראל וקריאת מסמכים משפטיים. תשובותיך תמיד בעברית ובפורמט JSON תקין.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'document_processing_result',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            summary: {
              type: 'string',
              description: 'סיכום קצר של המסמך',
            },
            extractedTasks: {
              type: 'array',
              items: { type: 'string' },
              description: 'משימות שחולצו מהמסמך',
            },
            keyDates: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: {
                    type: 'string',
                    description: 'תאריך בפורמט YYYY-MM-DD',
                  },
                  description: {
                    type: 'string',
                    description: 'תיאור התאריך',
                  },
                },
                required: ['date', 'description'],
                additionalProperties: false,
              },
              description: 'תאריכים חשובים',
            },
            actionItems: {
              type: 'array',
              items: { type: 'string' },
              description: 'פעולות שצריך לעשות בהקדם',
            },
            riskFactors: {
              type: 'array',
              items: { type: 'string' },
              description: 'גורמי סיכון או בעיות',
            },
          },
          required: ['summary', 'extractedTasks', 'keyDates', 'actionItems', 'riskFactors'],
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

    const result = JSON.parse(content) as DocumentProcessingResult;
    return result;
  } catch (error) {
    console.error('שגיאה בעיבוד המסמך:', error);
    throw new Error('שגיאה בעיבוד המסמך');
  }
}
