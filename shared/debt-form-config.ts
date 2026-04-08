/**
 * Debt form configuration with labels, questions, and field descriptions
 */

export interface DebtFieldConfig {
  id: string;
  label: string;
  placeholder: string;
  type: 'text' | 'number' | 'select';
  required: boolean;
  description?: string;
}

export interface DebtQuestionConfig {
  id: string;
  question: string;
  options: Array<{ value: string; label: string }>;
}

export const DEBT_FIELDS: Record<string, DebtFieldConfig> = {
  creditorType: {
    id: 'creditorType',
    label: 'סוג החוב',
    placeholder: 'בחר סוג חוב',
    type: 'select',
    required: true,
    description: 'בחר את הקטגוריה של החוב שלך',
  },
  creditorName: {
    id: 'creditorName',
    label: 'שם הנושה',
    placeholder: 'לדוגמה: בנק הפועלים',
    type: 'select',
    required: true,
    description: 'בחר את שם הגוף שלו אתה חייב כסף',
  },
  debtAmount: {
    id: 'debtAmount',
    label: 'סכום החוב (בש"ח)',
    placeholder: 'לדוגמה: 25000',
    type: 'number',
    required: true,
    description: 'כמה כסף אתה חייב בסה"כ',
  },
  interestRate: {
    id: 'interestRate',
    label: 'ריבית שנתית (%)',
    placeholder: 'לדוגמה: 8.5',
    type: 'number',
    required: false,
    description: 'אחוז הריבית השנתית על החוב (אם יש)',
  },
  monthlyPayment: {
    id: 'monthlyPayment',
    label: 'סכום התשלום החודשי (בש"ח)',
    placeholder: 'לדוגמה: 500',
    type: 'number',
    required: false,
    description: 'כמה אתה משלם כל חודש כעת',
  },
};

export const DEBT_QUESTIONS: Record<string, DebtQuestionConfig> = {
  certainty: {
    id: 'certainty',
    question: 'כמה בטוח אתה בנתונים האלה?',
    options: [
      { value: 'known', label: 'ידוע - יש לי את כל המידע' },
      { value: 'medium', label: 'בינוני - יש לי מידע חלקי' },
      { value: 'unknown', label: 'לא בטוח - אני מעריך בערך' },
    ],
  },
  lastUpdate: {
    id: 'lastUpdate',
    question: 'מתי עדכנת את הנתונים האלה לאחרונה?',
    options: [
      { value: 'recent', label: 'עדכני - בחודש האחרון' },
      { value: 'six_months', label: 'חצי שנה - לפני 3-6 חודשים' },
      { value: 'year', label: 'שנה - לפני 6-12 חודשים' },
      { value: 'old', label: 'ישן - לפני יותר משנה' },
    ],
  },
  status: {
    id: 'status',
    question: 'מה סטטוס החוב הזה כרגע?',
    options: [
      { value: 'active', label: 'פעיל - אני משלם כרגע' },
      { value: 'enforcement', label: 'בהליכי הוצאה לפועל' },
      { value: 'arrangement', label: 'בהסדר - יש הסכם' },
      { value: 'closed', label: 'סגור - סיימתי לשלם' },
    ],
  },
};

export const DEBT_TYPES = [
  {
    id: 'bank_loan',
    label: 'הלוואה מבנק',
    description: 'הלוואה אישית, משכנתא, או הלוואה צמודה',
    category: 'bank',
  },
  {
    id: 'credit_card_debt',
    label: 'חוב על כרטיס אשראי',
    description: 'חוב על מסגרת בכרטיס אשראי',
    category: 'credit_card',
  },
  {
    id: 'credit_company_loan',
    label: 'הלוואה מחברת אשראי',
    description: 'הלוואה מחברה שנותנת אשראי',
    category: 'credit_card',
  },
  {
    id: 'credit_line_loan',
    label: 'הלוואה על מסגרת אשראי',
    description: 'הלוואה על מסגרת אשראי (Credit Line)',
    category: 'credit_card',
  },
  {
    id: 'finance_company_loan',
    label: 'הלוואה מחברת מימון',
    description: 'הלוואה מחברה פיננסית (פנקס, אופק, וכו\')',
    category: 'finance_company',
  },
  {
    id: 'insurance_loan',
    label: 'הלוואה מחברת ביטוח',
    description: 'הלוואה כנגד פוליסת ביטוח או תגמולים',
    category: 'insurance',
  },
  {
    id: 'private_debt',
    label: 'חוב פרטי',
    description: 'הלוואה ממישהו פרטי או משפחה',
    category: 'other',
  },
  {
    id: 'lawyer_debt',
    label: 'חוב ממשרד עורכי דין',
    description: 'חוב עבור שירותי ייעוץ משפטי',
    category: 'other',
  },
  {
    id: 'government_debt',
    label: 'חוב לממשלה',
    description: 'חוב לממשלה או מוסדות ממשלתיים',
    category: 'other',
  },
  {
    id: 'p2p_loan',
    label: 'הלוואה מבלנדר',
    description: 'הלוואה מפלטפורמת P2P או בלנדר',
    category: 'p2p',
  },
  {
    id: 'collection_debt',
    label: 'חוב בגבייה',
    description: 'חוב שנמסר לחברת גבייה',
    category: 'collection',
  },
];

export function getDebtTypeLabel(typeId: string): string {
  const type = DEBT_TYPES.find(t => t.id === typeId);
  return type?.label || typeId;
}

export function getDebtTypeDescription(typeId: string): string {
  const type = DEBT_TYPES.find(t => t.id === typeId);
  return type?.description || '';
}
