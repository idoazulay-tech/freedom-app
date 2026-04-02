// Comprehensive Debt Categories and Subcategories for Freedom Platform

export const DEBT_CATEGORIES = {
  BANK: {
    label: 'בנק',
    subcategories: [
      { value: 'personal_loan', label: 'הלוואה אישית' },
      { value: 'mortgage', label: 'משכנתא' },
      { value: 'overdraft', label: 'מינוס' },
      { value: 'bank_guarantee', label: 'ערבות בנקאית' },
      { value: 'bank_credit_card', label: 'כרטיס אשראי בנקאי' },
    ],
  },
  CREDIT: {
    label: 'אשראי',
    subcategories: [
      { value: 'credit_card', label: 'כרטיס אשראי' },
      { value: 'credit_loan', label: 'הלוואת אשראי' },
      { value: 'installment_plan', label: 'פריסת תשלומים' },
      { value: 'double_charge', label: 'חיוב כפול' },
    ],
  },
  ENFORCEMENT: {
    label: 'הוצאה לפועל',
    subcategories: [
      { value: 'open_file', label: 'תיק פתוח' },
      { value: 'levy', label: 'עיקול' },
      { value: 'legal_proceeding', label: 'הליך משפטי' },
    ],
  },
  INSURANCE: {
    label: 'ביטוח',
    subcategories: [
      { value: 'insured_loan', label: 'הלוואת מבוטח' },
      { value: 'unpaid_premium', label: 'פרמיה שלא שולמה' },
      { value: 'policy_redemption', label: 'פדיון פוליסה' },
    ],
  },
  TELECOM: {
    label: 'תקשורת',
    subcategories: [
      { value: 'mobile', label: 'סלולר' },
      { value: 'internet', label: 'אינטרנט' },
      { value: 'television', label: 'טלוויזיה' },
    ],
  },
  HOUSING: {
    label: 'דיור',
    subcategories: [
      { value: 'rent', label: 'שכר דירה' },
      { value: 'building_committee', label: 'ועד בית' },
      { value: 'property_tax', label: 'ארנונה' },
    ],
  },
  UTILITIES: {
    label: 'תשתיות',
    subcategories: [
      { value: 'electricity', label: 'חשמל' },
      { value: 'water', label: 'מים' },
    ],
  },
  HEALTH: {
    label: 'בריאות',
    subcategories: [
      { value: 'health_fund', label: 'קופת חולים' },
      { value: 'private_medicine', label: 'תרופות פרטיות' },
    ],
  },
  EDUCATION: {
    label: 'חינוך',
    subcategories: [
      { value: 'kindergarten', label: 'גן' },
      { value: 'afternoon_program', label: 'צהרון' },
      { value: 'private_lessons', label: 'שיעורים פרטיים' },
    ],
  },
  VEHICLE: {
    label: 'רכב',
    subcategories: [
      { value: 'leasing', label: 'ליסינג' },
      { value: 'mechanic', label: 'מוסך' },
      { value: 'car_insurance', label: 'ביטוח רכב' },
    ],
  },
  PROFESSIONALS: {
    label: 'מקצוענים',
    subcategories: [
      { value: 'lawyer', label: 'עורך דין' },
      { value: 'accountant', label: 'רואה חשבון' },
      { value: 'contractor', label: 'שיפוצניק' },
    ],
  },
  GOVERNMENT: {
    label: 'ממשלתי',
    subcategories: [
      { value: 'national_insurance', label: 'ביטוח לאומי' },
      { value: 'income_tax', label: 'מס הכנסה' },
      { value: 'traffic_fines', label: 'קנסות תנועה' },
    ],
  },
  RETAIL: {
    label: 'קמעונאות',
    subcategories: [
      { value: 'supermarket', label: 'סופרמרקט' },
      { value: 'fashion', label: 'אופנה' },
      { value: 'electronics', label: 'אלקטרוניקה' },
    ],
  },
  OTHER: {
    label: 'אחר',
    subcategories: [
      { value: 'free_text', label: 'טקסט חופשי' },
    ],
  },
} as const;

// Legal Status Options
export const LEGAL_STATUS_OPTIONS = [
  { value: 'overdue', label: 'פיגור', score: 0 },
  { value: 'demand_letter', label: 'מכתבי דרישה', score: 20 },
  { value: 'lawsuit', label: 'תביעה', score: 50 },
  { value: 'enforcement', label: 'הוצאה לפועל', score: 100 },
  { value: 'levy', label: 'עיקול', score: 150 },
  { value: 'insolvency', label: 'חדלות פירעון', score: 200 },
] as const;

// Debt Type
export interface Debt {
  id: string;
  category: keyof typeof DEBT_CATEGORIES;
  subcategory: string;
  entity: string;
  amount: number;
  months_late: number;
  legal_status: string;
  case_number?: string;
  notes?: string;
  created_at?: Date;
}

// Scoring Factors
export const SCORING_FACTORS = {
  AMOUNT: {
    label: 'סכום חוב',
    ranges: [
      { min: 0, max: 10000, score: 10 },
      { min: 10000, max: 50000, score: 30 },
      { min: 50000, max: Infinity, score: 60 },
    ],
  },
  MONTHS_LATE: {
    label: 'פיגור (חודשים)',
    ranges: [
      { min: 0, max: 3, score: 10 },
      { min: 3, max: 6, score: 30 },
      { min: 6, max: Infinity, score: 60 },
    ],
  },
  CREDITOR_COUNT: {
    label: 'מספר נושים',
    ranges: [
      { min: 1, max: 1, score: 10 },
      { min: 2, max: 3, score: 30 },
      { min: 4, max: Infinity, score: 60 },
    ],
  },
  STABLE_INCOME: {
    label: 'הכנסה יציבה?',
    score: 30, // +30 if NO
  },
  ASSET_AT_RISK: {
    label: 'נכס בסיכון?',
    score: 100, // +100 if YES
  },
} as const;

// Risk Levels
export const RISK_LEVELS = [
  {
    min: 0,
    max: 50,
    level: 'נמוך',
    color: 'green',
    recommendation: 'יועץ כלכלי',
    icon: '🟢',
  },
  {
    min: 51,
    max: 150,
    level: 'בינוני',
    color: 'yellow',
    recommendation: 'יועץ הסדרים',
    icon: '🟡',
  },
  {
    min: 151,
    max: 300,
    level: 'גבוה',
    color: 'orange',
    recommendation: 'עו"ד חובות',
    icon: '🔴',
  },
  {
    min: 301,
    max: Infinity,
    level: 'קריטי',
    color: 'red',
    recommendation: 'עו"ד חדלות פירעון',
    icon: '🔴🔴',
  },
] as const;

// Get all categories as array for UI
export function getCategoriesArray() {
  return Object.entries(DEBT_CATEGORIES).map(([key, value]) => ({
    value: key,
    label: value.label,
  }));
}

// Get subcategories for a specific category
export function getSubcategoriesForCategory(category: keyof typeof DEBT_CATEGORIES) {
  return DEBT_CATEGORIES[category]?.subcategories || [];
}

// Get risk level for a score
export function getRiskLevel(score: number) {
  return RISK_LEVELS.find(level => score >= level.min && score <= level.max);
}
