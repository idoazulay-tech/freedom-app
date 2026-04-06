# Freedom - AI Agents Architecture

**Generated:** 2026-04-03

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Agent 1: Triage Agent](#agent-1-triage-agent)
3. [Agent 2: Matching Agent](#agent-2-matching-agent)
4. [Agent 3: Document Processor Agent](#agent-3-document-processor-agent)
5. [Main Diagnosis Agent (Orchestrator)](#main-diagnosis-agent-orchestrator)
6. [Integration Points](#integration-points)
7. [Data Flow](#data-flow)

---

## Overview

The Freedom system uses **3 specialized AI agents** that work together to provide comprehensive debt diagnosis:

1. **Triage Agent** - Classifies debt severity and user persona
2. **Matching Agent** - Recommends appropriate professionals
3. **Document Processor Agent** - Extracts data from legal/financial documents
4. **Diagnosis Orchestrator** - Coordinates all agents and produces final diagnosis

---

## Agent 1: Triage Agent

**File:** `server/ai/triage.ts`

**Purpose:** Classify the debt situation and determine user persona

**Input:**
```typescript
{
  totalDebtAmount: string;      // Total debt in NIS
  debtType: string;              // Type of debt (e.g., "credit card")
  monthlyIncome?: string;         // Monthly income
  monthlyExpenses?: string;       // Monthly expenses
  paymentHistory?: string;        // Payment history
  collectionActions?: string;     // Collection actions taken
  additionalContext?: string;     // Additional context
}
```

**Output:**
```typescript
{
  severity: 'low' | 'medium' | 'high' | 'critical';  // Debt severity
  persona: 'yossi' | 'dana' | 'avi';                 // User persona
  reasoning: string;                                   // Explanation
  recommendations: string[];                           // Recommendations
}
```

**Personas:**
- **Yossi (Initial):** First debt, fearful, needs initial guidance
- **Dana (Advanced):** Multiple debts, confusion, needs organization
- **Avi (Crisis):** Legal proceedings, urgent need for lawyer

**Code:**

```typescript
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
```

---

## Agent 2: Matching Agent

**File:** `server/ai/matching.ts`

**Purpose:** Match debtor with appropriate professionals

**Input:**
```typescript
{
  severity: 'low' | 'medium' | 'high' | 'critical';
  persona: 'yossi' | 'dana' | 'avi';
  debtType: string;
  totalDebtAmount: string;
  hasLegalNotices: boolean;
  hasCollectionActions: boolean;
  additionalContext?: string;
}
```

**Output:**
```typescript
{
  recommendedSpecialties: string[];  // Recommended professions
  matchingScore: number;              // Match score (0-100)
  reasoning: string;                  // Explanation
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';  // Urgency
}
```

**Specialties:**
- עורך דין (חדלות פירעון) - Lawyer (Insolvency)
- יועץ כלכלי - Financial Advisor
- רואה חשבון / יועץ מס - Accountant / Tax Advisor
- מלווה שיקום כלכלי - Economic Rehabilitation Mentor
- מומחה בנכסים - Asset Specialist
- מתווך הסדרות - Settlement Negotiator

**Code:**

```typescript
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
```

---

## Agent 3: Document Processor Agent

**File:** `server/ai/document-processor.ts`

**Purpose:** Extract data from legal and financial documents

**Input:**
```typescript
{
  documentType: string;      // Type of document (e.g., "legal notice")
  documentContent: string;   // Document content/text
  context?: string;          // Additional context
}
```

**Output:**
```typescript
{
  summary: string;                                    // Document summary
  extractedTasks: string[];                          // Extracted tasks
  keyDates: Array<{ date: string; description: string }>; // Important dates
  actionItems: string[];                             // Action items
  riskFactors: string[];                             // Risk factors
}
```

**Code:**

```typescript
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
```

---

## Main Diagnosis Agent (Orchestrator)

**File:** `server/routers/diagnosis.ts` (should be updated)

**Purpose:** Orchestrate all agents and produce final diagnosis

**Flow:**
1. Receive user input (debts, income, expenses)
2. Call **Triage Agent** → Get severity & persona
3. Call **Matching Agent** → Get professional recommendations
4. Call **Document Processor** (if documents provided)
5. Combine all results → Save to database
6. Return complete diagnosis

**Integration Code (to be added):**

```typescript
import { triageDebt } from '../ai/triage';
import { matchDebtorToProfessional } from '../ai/matching';
import { processDocument } from '../ai/document-processor';

export async function performFullDiagnosis(input: {
  debts: Array<{ type: string; amount: number; monthsOverdue: number }>;
  monthlyIncome: number;
  monthlyExpenses: number;
  documents?: Array<{ type: string; content: string }>;
  additionalContext?: string;
}) {
  // Step 1: Triage
  const triageResult = await triageDebt({
    totalDebtAmount: input.debts.reduce((sum, d) => sum + d.amount, 0).toString(),
    debtType: input.debts.map(d => d.type).join(', '),
    monthlyIncome: input.monthlyIncome.toString(),
    monthlyExpenses: input.monthlyExpenses.toString(),
    additionalContext: input.additionalContext,
  });

  // Step 2: Matching
  const matchingResult = await matchDebtorToProfessional({
    severity: triageResult.severity,
    persona: triageResult.persona,
    debtType: input.debts.map(d => d.type).join(', '),
    totalDebtAmount: input.debts.reduce((sum, d) => sum + d.amount, 0).toString(),
    hasLegalNotices: false, // Extract from documents
    hasCollectionActions: false, // Extract from documents
    additionalContext: input.additionalContext,
  });

  // Step 3: Document Processing (if provided)
  let documentResults = [];
  if (input.documents && input.documents.length > 0) {
    documentResults = await Promise.all(
      input.documents.map(doc =>
        processDocument({
          documentType: doc.type,
          documentContent: doc.content,
        })
      )
    );
  }

  // Step 4: Combine results
  return {
    triageResult,
    matchingResult,
    documentResults,
    timestamp: new Date(),
  };
}
```

---

## Integration Points

### 1. Frontend Integration (ProfessionalDiagnosis.tsx)

```typescript
// Current: Only saves data
const { mutate: saveDiagnosis } = trpc.diagnosis.save.useMutation();

// Should be: Calls full diagnosis
const { mutate: performDiagnosis } = trpc.diagnosis.performFull.useMutation({
  onSuccess: (result) => {
    // result contains: triageResult, matchingResult, documentResults
    console.log('Diagnosis complete:', result);
  },
});
```

### 2. Backend Router Integration (server/routers/diagnosis.ts)

```typescript
// Add new procedure
export const diagnosisRouter = router({
  // Existing
  save: protectedProcedure.input(SaveDiagnosisInput).mutation(async ({ ctx, input }) => {
    // Current implementation
  }),

  // NEW: Full diagnosis with agents
  performFull: protectedProcedure
    .input(PerformDiagnosisInput)
    .mutation(async ({ ctx, input }) => {
      const diagnosis = await performFullDiagnosis(input);
      
      // Save to database
      await getDb().insert(diagnoses).values({
        userId: ctx.user.id,
        severity: diagnosis.triageResult.severity,
        persona: diagnosis.triageResult.persona,
        // ... other fields
        debtsData: JSON.stringify(diagnosis),
        createdAt: new Date(),
      });

      return diagnosis;
    }),
});
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    User Input (Frontend)                     │
│  - Debts (type, amount, months overdue)                     │
│  - Financial info (income, expenses)                        │
│  - Documents (optional)                                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────────┐
         │  Diagnosis Orchestrator (Backend)  │
         └───────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    ┌─────────┐  ┌──────────┐  ┌─────────────────┐
    │ Triage  │  │ Matching │  │ Document        │
    │ Agent   │  │ Agent    │  │ Processor       │
    └────┬────┘  └────┬─────┘  └────────┬────────┘
         │            │                 │
         ▼            ▼                 ▼
    Severity     Professionals    Tasks & Dates
    Persona      Urgency          Risk Factors
    Recommend.   Match Score      Action Items
         │            │                 │
         └────────────┼─────────────────┘
                      │
                      ▼
         ┌─────────────────────────────┐
         │  Combined Diagnosis Result  │
         └────────────┬────────────────┘
                      │
                      ▼
         ┌─────────────────────────────┐
         │  Save to Database           │
         └────────────┬────────────────┘
                      │
                      ▼
         ┌─────────────────────────────┐
         │  Return to Frontend         │
         │  Display Results to User    │
         └─────────────────────────────┘
```

---

## Current Status

✅ **Agents Exist:**
- Triage Agent (server/ai/triage.ts)
- Matching Agent (server/ai/matching.ts)
- Document Processor (server/ai/document-processor.ts)

❌ **Not Integrated:**
- Agents not called from diagnosis router
- Frontend only saves data, doesn't trigger agents
- No orchestration logic

✅ **To Be Done:**
1. Update diagnosis router to call agents
2. Update frontend to use full diagnosis flow
3. Add database fields for agent results
4. Add tests for agent integration
5. Add error handling and retries

---

## How to Use This Document

1. **For Claude:** Share this file so he understands the agent architecture
2. **For Integration:** Use the code snippets to wire agents into the router
3. **For Testing:** Test each agent independently first, then integration
4. **For Deployment:** Ensure all agents are working before going live
