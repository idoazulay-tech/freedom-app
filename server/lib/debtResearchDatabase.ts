/**
 * Debt Research Database - מסד נתונים מלא של סוגי חובות בישראל
 * מכיל: הגדרות, תנאים משפטיים, השלכות, סימני אזהרה, פתרונות, ניתוב
 */

export interface DebtTypeInfo {
  id: string;
  name: string;
  hebrewName: string;
  description: string;
  interestRate: {
    min: number;
    max: number;
    description: string;
  };
  term: {
    min: number;
    max: number;
    unit: 'years' | 'months';
    description: string;
  };
  collateral: string;
  laws: string[];
  consequences: {
    timeline: Array<{
      days: string;
      action: string;
      consequences: string[];
    }>;
  };
  technicalImpact: {
    creditScore: {
      min: number;
      max: number;
      description: string;
    };
    bureauRegistration: string;
    accountBlocking: boolean;
    assetLevyPossible: boolean;
  };
  warningSigns: {
    critical: string[];
    medium: string[];
    low: string[];
  };
  solutions: Array<{
    name: string;
    description: string;
    pros: string[];
    cons: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    timeframe: string;
  }>;
  professionalRouting: {
    lawyer: boolean;
    financialAdvisor: boolean;
    ngo: boolean;
    mentor: boolean;
  };
  riskFactors: {
    debtAmount: number; // 0-60
    monthsLate: number; // 0-60
    legalStatus: number; // 0-200
    enforcementSpeed: 'slow' | 'medium' | 'fast' | 'very_fast';
  };
}

export const DEBT_TYPES: Record<string, DebtTypeInfo> = {
  bank_loan: {
    id: 'bank_loan',
    name: 'Bank Loan',
    hebrewName: 'הלוואה מבנק',
    description: 'הלוואה שהבנק מעניק לפי הסכם משפטי, בדרך כלל מובטחת בערבות או בנכס',
    interestRate: {
      min: 3,
      max: 7,
      description: 'שיעור ריבית בנק ישראל + פרמיה',
    },
    term: {
      min: 5,
      max: 30,
      unit: 'years',
      description: 'בדרך כלל 5-30 שנה',
    },
    collateral: 'לעתים קרובות ערבות אישית או משכנתא',
    laws: ['חוק הבנקאות', 'חוק הגנת הצרכן'],
    consequences: {
      timeline: [
        {
          days: '0-30',
          action: 'התראה בכתב',
          consequences: ['ריבית עיכוב (עד 10%)'],
        },
        {
          days: '30-90',
          action: 'דרישה לתשלום מיידי',
          consequences: ['אפשרות דיון עם הבנק'],
        },
        {
          days: '90+',
          action: 'הוצאה לפועל',
          consequences: ['עיקול על חשבון בנק', 'משכנתא על נכס'],
        },
        {
          days: '180+',
          action: 'הליכי פשיטת רגל',
          consequences: ['אפשרות פשיטת רגל'],
        },
      ],
    },
    technicalImpact: {
      creditScore: {
        min: 100,
        max: 150,
        description: 'ירידה משמעותית בניקוד אשראי',
      },
      bureauRegistration: '7 שנים',
      accountBlocking: true,
      assetLevyPossible: true,
    },
    warningSigns: {
      critical: [
        'הוצאה לפועל פעילה',
        'עיקול על חשבון בנק',
        'עיקול על משכנתא',
        'מעל 180 ימים בפיגור',
      ],
      medium: [
        '90-180 ימים בפיגור',
        'דרישה לתשלום מיידי',
        'הודעות משפטיות',
      ],
      low: [
        '30-90 ימים בפיגור',
        'התראות בכתב',
      ],
    },
    solutions: [
      {
        name: 'סידור חוב',
        description: 'הסכם עם הבנק לתשלום בתנאים שונים',
        pros: ['הפחתת ריבית', 'הארכת תקופה', 'הפחתת תשלום חודשי'],
        cons: ['עדיין צריך לשלם את החוב'],
        difficulty: 'easy',
        timeframe: '1-2 שבועות',
      },
      {
        name: 'הארכת תקופה',
        description: 'משא ומתן עם הבנק להארכת תקופת ההלוואה',
        pros: ['הפחתת תשלום חודשי'],
        cons: ['ריבית כוללת גבוהה יותר'],
        difficulty: 'easy',
        timeframe: '1-2 שבועות',
      },
      {
        name: 'הפחתת ריבית',
        description: 'משא ומתן עם הבנק להפחתת שיעור הריבית',
        pros: ['הפחתת תשלום חודשי'],
        cons: ['לא תמיד אפשרי'],
        difficulty: 'medium',
        timeframe: '2-4 שבועות',
      },
      {
        name: 'תוכנית תשלומים משפטית',
        description: 'תוכנית שנקבעת על ידי בית משפט',
        pros: ['הגנה משפטית', 'הפחתת ריבית', 'הארכת תקופה'],
        cons: ['צריך להגיש בקשה לבית משפט'],
        difficulty: 'hard',
        timeframe: '3-6 חודשים',
      },
      {
        name: 'פשיטת רגל',
        description: 'הליך משפטי שבו מוכרזים כחסרי יכולת לשלם',
        pros: ['ביטול חובות', 'התחלה מחדש'],
        cons: ['השפעה משמעותית על אשראי', 'רישום בבורו 7 שנים'],
        difficulty: 'hard',
        timeframe: '6-12 חודשים',
      },
    ],
    professionalRouting: {
      lawyer: true,
      financialAdvisor: true,
      ngo: false,
      mentor: false,
    },
    riskFactors: {
      debtAmount: 30,
      monthsLate: 30,
      legalStatus: 50,
      enforcementSpeed: 'medium',
    },
  },

  credit_line: {
    id: 'credit_line',
    name: 'Credit Line Loan',
    hebrewName: 'הלוואה על גבי מסגרת אשראי',
    description: 'הלוואה שניתנת על גבי מסגרת אשראי שאישרה הבנק, בדרך כלל בריבית גבוהה יותר',
    interestRate: {
      min: 7,
      max: 12,
      description: 'גבוהה יותר מהלוואה רגילה',
    },
    term: {
      min: 3,
      max: 10,
      unit: 'years',
      description: 'בדרך כלל 3-10 שנים',
    },
    collateral: 'לא תמיד נדרשת ערבות נכס',
    laws: ['חוק הבנקאות', 'חוק הגנת הצרכן'],
    consequences: {
      timeline: [
        {
          days: '0-15',
          action: 'התראה בכתב',
          consequences: [],
        },
        {
          days: '15-60',
          action: 'דרישה לתשלום',
          consequences: ['אפשרות לסידור'],
        },
        {
          days: '60+',
          action: 'הוצאה לפועל מהירה',
          consequences: ['סגירת מסגרת מיידית'],
        },
      ],
    },
    technicalImpact: {
      creditScore: {
        min: 80,
        max: 120,
        description: 'ירידה משמעותית בניקוד אשראי',
      },
      bureauRegistration: '7 שנים',
      accountBlocking: true,
      assetLevyPossible: true,
    },
    warningSigns: {
      critical: [
        'סגירת מסגרת מיידית',
        'הוצאה לפועל',
        'עיקול על חשבון',
      ],
      medium: [
        '60+ ימים בפיגור',
        'דרישה לתשלום',
      ],
      low: [
        '15-60 ימים בפיגור',
      ],
    },
    solutions: [
      {
        name: 'סידור חוב',
        description: 'הסכם עם הבנק לתשלום בתנאים שונים',
        pros: ['הפחתת ריבית', 'הארכת תקופה'],
        cons: ['עדיין צריך לשלם'],
        difficulty: 'easy',
        timeframe: '1-2 שבועות',
      },
      {
        name: 'סגירת מסגרת וקבלת הלוואה רגילה',
        description: 'סגירת המסגרת וקבלת הלוואה רגילה בריבית נמוכה יותר',
        pros: ['ריבית נמוכה יותר'],
        cons: ['צריך לעמוד בתנאים'],
        difficulty: 'medium',
        timeframe: '2-4 שבועות',
      },
      {
        name: 'פשיטת רגל',
        description: 'הליך משפטי לביטול חובות',
        pros: ['ביטול חובות'],
        cons: ['השפעה משמעותית על אשראי'],
        difficulty: 'hard',
        timeframe: '6-12 חודשים',
      },
    ],
    professionalRouting: {
      lawyer: true,
      financialAdvisor: true,
      ngo: false,
      mentor: false,
    },
    riskFactors: {
      debtAmount: 30,
      monthsLate: 30,
      legalStatus: 50,
      enforcementSpeed: 'fast',
    },
  },

  credit_company: {
    id: 'credit_company',
    name: 'Credit Company Loan',
    hebrewName: 'הלוואה מחברת אשראי',
    description: 'הלוואה שניתנת על ידי חברת אשראי (לא בנק), בדרך כלל בריבית גבוהה מאוד',
    interestRate: {
      min: 12,
      max: 25,
      description: 'גבוהה מאוד, לעתים קרובות 15-25%',
    },
    term: {
      min: 1,
      max: 7,
      unit: 'years',
      description: 'בדרך כלל 1-7 שנים',
    },
    collateral: 'בדרך כלל לא נדרשת',
    laws: ['חוק הגנת הצרכן', 'חוק הריבית המקסימלית'],
    consequences: {
      timeline: [
        {
          days: '0-7',
          action: 'התראה בכתב',
          consequences: [],
        },
        {
          days: '7-30',
          action: 'דרישה לתשלום',
          consequences: ['עלויות ניהול'],
        },
        {
          days: '30+',
          action: 'הוצאה לפועל',
          consequences: ['עיקול על חשבון בנק'],
        },
      ],
    },
    technicalImpact: {
      creditScore: {
        min: 100,
        max: 150,
        description: 'ירידה משמעותית בניקוד אשראי',
      },
      bureauRegistration: '7 שנים',
      accountBlocking: true,
      assetLevyPossible: false,
    },
    warningSigns: {
      critical: [
        'הוצאה לפועל',
        'עיקול על חשבון',
        'ריבית גבוהה מאוד',
      ],
      medium: [
        '30+ ימים בפיגור',
        'דרישה לתשלום',
      ],
      low: [
        '7-30 ימים בפיגור',
      ],
    },
    solutions: [
      {
        name: 'סידור חוב',
        description: 'הסכם עם חברת האשראי לתשלום בתנאים שונים',
        pros: ['הפחתת ריבית (לעתים קרובות אפשרי)', 'הארכת תקופה'],
        cons: ['עדיין צריך לשלם'],
        difficulty: 'easy',
        timeframe: '1-2 שבועות',
      },
      {
        name: 'הפחתת ריבית',
        description: 'משא ומתן לשיעור ריבית נמוך יותר',
        pros: ['הפחתת תשלום חודשי'],
        cons: ['לא תמיד אפשרי'],
        difficulty: 'medium',
        timeframe: '2-4 שבועות',
      },
      {
        name: 'פשיטת רגל',
        description: 'הליך משפטי לביטול חובות',
        pros: ['ביטול חובות'],
        cons: ['השפעה משמעותית על אשראי'],
        difficulty: 'hard',
        timeframe: '6-12 חודשים',
      },
    ],
    professionalRouting: {
      lawyer: true,
      financialAdvisor: true,
      ngo: true,
      mentor: false,
    },
    riskFactors: {
      debtAmount: 45,
      monthsLate: 45,
      legalStatus: 100,
      enforcementSpeed: 'very_fast',
    },
  },

  guaranteed_loan: {
    id: 'guaranteed_loan',
    name: 'Guaranteed Loan',
    hebrewName: 'הלוואה עם ערבות',
    description: 'הלוואה שיש לה ערבות אישית (מאדם אחר) או ערבות נכס (משכנתא)',
    interestRate: {
      min: 3,
      max: 12,
      description: 'תלוי בסוג ההלוואה',
    },
    term: {
      min: 1,
      max: 30,
      unit: 'years',
      description: 'תלוי בסוג ההלוואה',
    },
    collateral: 'ערבות אישית או ערבות נכס',
    laws: ['חוק הערבות', 'חוק המשכנתא'],
    consequences: {
      timeline: [
        {
          days: 'על הלווה',
          action: 'דומה להלוואה רגילה',
          consequences: ['עיקול על נכס אם יש משכנתא'],
        },
        {
          days: 'על העורב',
          action: 'חובה לשלם את החוב כולו',
          consequences: ['עיקול על נכס העורב', 'הוצאה לפועל ישירה'],
        },
      ],
    },
    technicalImpact: {
      creditScore: {
        min: 80,
        max: 150,
        description: 'ירידה משמעותית בניקוד אשראי',
      },
      bureauRegistration: '7 שנים',
      accountBlocking: true,
      assetLevyPossible: true,
    },
    warningSigns: {
      critical: [
        'הוצאה לפועל על הלווה או העורב',
        'עיקול על נכס',
        'העורב בסיכון',
      ],
      medium: [
        'פיגור בתשלומים',
        'דרישה לתשלום',
      ],
      low: [
        'התראות בכתב',
      ],
    },
    solutions: [
      {
        name: 'סידור חוב עם המלווה',
        description: 'הסכם לתשלום בתנאים שונים',
        pros: ['הפחתת ריבית', 'הארכת תקופה'],
        cons: ['עדיין צריך לשלם'],
        difficulty: 'easy',
        timeframe: '1-2 שבועות',
      },
      {
        name: 'משא ומתן עם העורב',
        description: 'משא ומתן עם העורב לשיתוף בתשלומים',
        pros: ['חלוקת אחריות'],
        cons: ['צריך הסכמה של העורב'],
        difficulty: 'hard',
        timeframe: '2-4 שבועות',
      },
      {
        name: 'פשיטת רגל',
        description: 'הליך משפטי לביטול חובות',
        pros: ['ביטול חובות'],
        cons: ['השפעה משמעותית על אשראי', 'השפעה על העורב'],
        difficulty: 'hard',
        timeframe: '6-12 חודשים',
      },
    ],
    professionalRouting: {
      lawyer: true,
      financialAdvisor: true,
      ngo: false,
      mentor: false,
    },
    riskFactors: {
      debtAmount: 30,
      monthsLate: 30,
      legalStatus: 100,
      enforcementSpeed: 'fast',
    },
  },

  unsecured_loan: {
    id: 'unsecured_loan',
    name: 'Unsecured Loan',
    hebrewName: 'הלוואה בלי ערבות',
    description: 'הלוואה שלא יש לה ערבות, בדרך כלל בריבית גבוהה יותר',
    interestRate: {
      min: 5,
      max: 15,
      description: 'גבוהה יותר מהלוואה עם ערבות',
    },
    term: {
      min: 1,
      max: 5,
      unit: 'years',
      description: 'בדרך כלל 1-5 שנים',
    },
    collateral: 'אין',
    laws: ['חוק הגנת הצרכן'],
    consequences: {
      timeline: [
        {
          days: '0-30',
          action: 'התראה בכתב',
          consequences: [],
        },
        {
          days: '30-90',
          action: 'דרישה לתשלום',
          consequences: [],
        },
        {
          days: '90+',
          action: 'הוצאה לפועל',
          consequences: ['עיקול על חשבון בנק'],
        },
      ],
    },
    technicalImpact: {
      creditScore: {
        min: 80,
        max: 120,
        description: 'ירידה משמעותית בניקוד אשראי',
      },
      bureauRegistration: '7 שנים',
      accountBlocking: true,
      assetLevyPossible: false,
    },
    warningSigns: {
      critical: [
        'הוצאה לפועל',
        'עיקול על חשבון',
      ],
      medium: [
        '90+ ימים בפיגור',
        'דרישה לתשלום',
      ],
      low: [
        '30-90 ימים בפיגור',
      ],
    },
    solutions: [
      {
        name: 'סידור חוב',
        description: 'הסכם לתשלום בתנאים שונים',
        pros: ['הפחתת ריבית', 'הארכת תקופה'],
        cons: ['עדיין צריך לשלם'],
        difficulty: 'easy',
        timeframe: '1-2 שבועות',
      },
      {
        name: 'הפחתת ריבית',
        description: 'משא ומתן לשיעור ריבית נמוך יותר',
        pros: ['הפחתת תשלום חודשי'],
        cons: ['לא תמיד אפשרי'],
        difficulty: 'medium',
        timeframe: '2-4 שבועות',
      },
      {
        name: 'פשיטת רגל',
        description: 'הליך משפטי לביטול חובות',
        pros: ['ביטול חובות'],
        cons: ['השפעה משמעותית על אשראי'],
        difficulty: 'hard',
        timeframe: '6-12 חודשים',
      },
    ],
    professionalRouting: {
      lawyer: true,
      financialAdvisor: true,
      ngo: false,
      mentor: false,
    },
    riskFactors: {
      debtAmount: 30,
      monthsLate: 30,
      legalStatus: 50,
      enforcementSpeed: 'medium',
    },
  },

  credit_card: {
    id: 'credit_card',
    name: 'Credit Card',
    hebrewName: 'כרטיס אשראי',
    description: 'חוב שנוצר משימוש בכרטיס אשראי, בדרך כלל בריבית גבוהה מאוד',
    interestRate: {
      min: 15,
      max: 30,
      description: 'גבוהה מאוד, לעתים קרובות 20-30%',
    },
    term: {
      min: 0,
      max: 5,
      unit: 'years',
      description: 'חודשית, אפשרות לתשלום בתקופה ארוכה יותר',
    },
    collateral: 'לא נדרשת',
    laws: ['חוק הגנת הצרכן', 'חוק הריבית המקסימלית'],
    consequences: {
      timeline: [
        {
          days: '0-30',
          action: 'התראה בכתב',
          consequences: ['ריבית עיכוב'],
        },
        {
          days: '30-60',
          action: 'דרישה לתשלום',
          consequences: ['עלויות ניהול'],
        },
        {
          days: '60+',
          action: 'הוצאה לפועל',
          consequences: ['עיקול על חשבון בנק'],
        },
      ],
    },
    technicalImpact: {
      creditScore: {
        min: 50,
        max: 100,
        description: 'ירידה משמעותית בניקוד אשראי',
      },
      bureauRegistration: '7 שנים',
      accountBlocking: true,
      assetLevyPossible: false,
    },
    warningSigns: {
      critical: [
        'הוצאה לפועל',
        'עיקול על חשבון',
        'כרטיס חסום',
      ],
      medium: [
        '60+ ימים בפיגור',
        'דרישה לתשלום',
      ],
      low: [
        '30-60 ימים בפיגור',
      ],
    },
    solutions: [
      {
        name: 'סידור חוב עם הבנק',
        description: 'הסכם לתשלום בתנאים שונים',
        pros: ['הפחתת ריבית', 'הארכת תקופה'],
        cons: ['עדיין צריך לשלם'],
        difficulty: 'easy',
        timeframe: '1-2 שבועות',
      },
      {
        name: 'הפחתת ריבית',
        description: 'משא ומתן לשיעור ריבית נמוך יותר',
        pros: ['הפחתת תשלום חודשי'],
        cons: ['לא תמיד אפשרי'],
        difficulty: 'medium',
        timeframe: '2-4 שבועות',
      },
      {
        name: 'תוכנית תשלומים',
        description: 'תוכנית תשלומים מובנית',
        pros: ['הפחתת תשלום חודשי'],
        cons: ['צריך הסכמה של הבנק'],
        difficulty: 'easy',
        timeframe: '1-2 שבועות',
      },
      {
        name: 'פשיטת רגל',
        description: 'הליך משפטי לביטול חובות',
        pros: ['ביטול חובות'],
        cons: ['השפעה משמעותית על אשראי'],
        difficulty: 'hard',
        timeframe: '6-12 חודשים',
      },
    ],
    professionalRouting: {
      lawyer: true,
      financialAdvisor: true,
      ngo: true,
      mentor: false,
    },
    riskFactors: {
      debtAmount: 30,
      monthsLate: 30,
      legalStatus: 50,
      enforcementSpeed: 'very_fast',
    },
  },

  tax_debt: {
    id: 'tax_debt',
    name: 'Tax Debt',
    hebrewName: 'חוב מס',
    description: 'חוב לרשויות המס (מס הכנסה, מס ערך מוסף, מס עסקי)',
    interestRate: {
      min: 10,
      max: 15,
      description: '10% בשנה + הצמדה למדד',
    },
    term: {
      min: 1,
      max: 10,
      unit: 'years',
      description: 'בדרך כלל עד 10 שנים',
    },
    collateral: 'לא נדרשת, אך יש סמכויות גבייה מיוחדות',
    laws: ['חוק סדר הגבייה', 'חוק מס הכנסה'],
    consequences: {
      timeline: [
        {
          days: '0-60',
          action: 'התראה בכתב',
          consequences: [],
        },
        {
          days: '60-180',
          action: 'הוצאה לפועל',
          consequences: ['עיקול על חשבון בנק'],
        },
        {
          days: '180+',
          action: 'עיקול על נכס',
          consequences: ['חסימת פעילות עסקית'],
        },
      ],
    },
    technicalImpact: {
      creditScore: {
        min: 100,
        max: 150,
        description: 'ירידה משמעותית בניקוד אשראי',
      },
      bureauRegistration: '7 שנים',
      accountBlocking: true,
      assetLevyPossible: true,
    },
    warningSigns: {
      critical: [
        'עיקול על חשבון בנק',
        'עיקול על נכס',
        'חסימת פעילות עסקית',
        'סמכויות מיוחדות של רשויות המס',
      ],
      medium: [
        '180+ ימים בפיגור',
        'הוצאה לפועל',
      ],
      low: [
        '60-180 ימים בפיגור',
      ],
    },
    solutions: [
      {
        name: 'סידור חוב עם רשויות המס',
        description: 'הסכם עם רשויות המס לתשלום בתנאים שונים',
        pros: ['הפחתת ריבית', 'הארכת תקופה'],
        cons: ['קשה יותר מבנק'],
        difficulty: 'hard',
        timeframe: '2-4 שבועות',
      },
      {
        name: 'תוכנית תשלומים משפטית',
        description: 'תוכנית שנקבעת על ידי בית משפט',
        pros: ['הגנה משפטית', 'הפחתת ריבית'],
        cons: ['צריך להגיש בקשה לבית משפט'],
        difficulty: 'hard',
        timeframe: '3-6 חודשים',
      },
      {
        name: 'פשיטת רגל',
        description: 'הליך משפטי לביטול חובות',
        pros: ['ביטול חובות'],
        cons: ['השפעה משמעותית על אשראי'],
        difficulty: 'hard',
        timeframe: '6-12 חודשים',
      },
    ],
    professionalRouting: {
      lawyer: true,
      financialAdvisor: true,
      ngo: true,
      mentor: false,
    },
    riskFactors: {
      debtAmount: 45,
      monthsLate: 60,
      legalStatus: 100,
      enforcementSpeed: 'fast',
    },
  },

  municipal_debt: {
    id: 'municipal_debt',
    name: 'Municipal Debt',
    hebrewName: 'חוב עירוני',
    description: 'חוב לעיריית המגורים (מס רכוש, מיסים עירוניים)',
    interestRate: {
      min: 5,
      max: 10,
      description: '5-10% בשנה',
    },
    term: {
      min: 1,
      max: 5,
      unit: 'years',
      description: 'בדרך כלל עד 5 שנים',
    },
    collateral: 'לא נדרשת',
    laws: ['חוק הרשויות המקומיות'],
    consequences: {
      timeline: [
        {
          days: '0-90',
          action: 'התראה בכתב',
          consequences: [],
        },
        {
          days: '90-180',
          action: 'הוצאה לפועל',
          consequences: ['עיקול על חשבון בנק'],
        },
        {
          days: '180+',
          action: 'עיקול על נכס',
          consequences: ['חסימת שירותים עירוניים'],
        },
      ],
    },
    technicalImpact: {
      creditScore: {
        min: 50,
        max: 100,
        description: 'ירידה בינונית בניקוד אשראי',
      },
      bureauRegistration: '7 שנים',
      accountBlocking: true,
      assetLevyPossible: true,
    },
    warningSigns: {
      critical: [
        'עיקול על חשבון בנק',
        'עיקול על נכס',
        'חסימת שירותים',
      ],
      medium: [
        '180+ ימים בפיגור',
        'הוצאה לפועל',
      ],
      low: [
        '90-180 ימים בפיגור',
      ],
    },
    solutions: [
      {
        name: 'סידור חוב עם העירייה',
        description: 'הסכם עם העירייה לתשלום בתנאים שונים',
        pros: ['הפחתת ריבית', 'הארכת תקופה'],
        cons: ['קשה יותר מבנק'],
        difficulty: 'medium',
        timeframe: '2-4 שבועות',
      },
      {
        name: 'תוכנית תשלומים',
        description: 'תוכנית תשלומים מובנית',
        pros: ['הפחתת תשלום חודשי'],
        cons: ['צריך הסכמה של העירייה'],
        difficulty: 'medium',
        timeframe: '2-4 שבועות',
      },
      {
        name: 'פשיטת רגל',
        description: 'הליך משפטי לביטול חובות',
        pros: ['ביטול חובות'],
        cons: ['השפעה משמעותית על אשראי'],
        difficulty: 'hard',
        timeframe: '6-12 חודשים',
      },
    ],
    professionalRouting: {
      lawyer: true,
      financialAdvisor: false,
      ngo: true,
      mentor: false,
    },
    riskFactors: {
      debtAmount: 20,
      monthsLate: 30,
      legalStatus: 50,
      enforcementSpeed: 'medium',
    },
  },

  organizational_debt: {
    id: 'organizational_debt',
    name: 'Organizational Debt',
    hebrewName: 'חוב לעמותה או ארגון',
    description: 'חוב לעמותה, ארגון או חברה פרטית (לא בנק)',
    interestRate: {
      min: 0,
      max: 15,
      description: 'משתנה בהתאם להסכם',
    },
    term: {
      min: 1,
      max: 10,
      unit: 'years',
      description: 'משתנה בהתאם להסכם',
    },
    collateral: 'משתנה בהתאם להסכם',
    laws: ['חוק החוזים'],
    consequences: {
      timeline: [
        {
          days: '0-30',
          action: 'התראה בכתב',
          consequences: [],
        },
        {
          days: '30-90',
          action: 'דרישה לתשלום',
          consequences: [],
        },
        {
          days: '90+',
          action: 'הוצאה לפועל',
          consequences: ['עיקול על חשבון בנק', 'עיקול על נכס (אם יש ערבות)'],
        },
      ],
    },
    technicalImpact: {
      creditScore: {
        min: 50,
        max: 100,
        description: 'ירידה בהתאם לסוג החוב',
      },
      bureauRegistration: '7 שנים',
      accountBlocking: true,
      assetLevyPossible: true,
    },
    warningSigns: {
      critical: [
        'הוצאה לפועל',
        'עיקול על חשבון',
        'עיקול על נכס',
      ],
      medium: [
        '90+ ימים בפיגור',
        'דרישה לתשלום',
      ],
      low: [
        '30-90 ימים בפיגור',
      ],
    },
    solutions: [
      {
        name: 'סידור חוב',
        description: 'הסכם לתשלום בתנאים שונים',
        pros: ['הפחתת ריבית', 'הארכת תקופה'],
        cons: ['עדיין צריך לשלם'],
        difficulty: 'easy',
        timeframe: '1-2 שבועות',
      },
      {
        name: 'משא ומתן',
        description: 'משא ומתן ישיר עם הארגון',
        pros: ['אפשרות להפחתת סכום'],
        cons: ['צריך הסכמה של הארגון'],
        difficulty: 'medium',
        timeframe: '2-4 שבועות',
      },
      {
        name: 'פשיטת רגל',
        description: 'הליך משפטי לביטול חובות',
        pros: ['ביטול חובות'],
        cons: ['השפעה משמעותית על אשראי'],
        difficulty: 'hard',
        timeframe: '6-12 חודשים',
      },
    ],
    professionalRouting: {
      lawyer: true,
      financialAdvisor: false,
      ngo: true,
      mentor: false,
    },
    riskFactors: {
      debtAmount: 20,
      monthsLate: 20,
      legalStatus: 50,
      enforcementSpeed: 'medium',
    },
  },

  insurance_debt: {
    id: 'insurance_debt',
    name: 'Insurance Debt',
    hebrewName: 'חוב לביטוח',
    description: 'חוב לחברת ביטוח (בדרך כלל בגין ביטוח בריאות או רכב)',
    interestRate: {
      min: 0,
      max: 5,
      description: 'בדרך כלל 0-5%',
    },
    term: {
      min: 1,
      max: 3,
      unit: 'years',
      description: 'בדרך כלל עד 3 שנים',
    },
    collateral: 'לא נדרשת',
    laws: ['חוק הביטוח'],
    consequences: {
      timeline: [
        {
          days: '0-30',
          action: 'התראה בכתב',
          consequences: [],
        },
        {
          days: '30-60',
          action: 'ביטול הביטוח',
          consequences: ['דרישה לתשלום'],
        },
        {
          days: '60+',
          action: 'הוצאה לפועל',
          consequences: [],
        },
      ],
    },
    technicalImpact: {
      creditScore: {
        min: 30,
        max: 80,
        description: 'ירידה בינונית בניקוד אשראי',
      },
      bureauRegistration: '7 שנים',
      accountBlocking: false,
      assetLevyPossible: false,
    },
    warningSigns: {
      critical: [
        'ביטול הביטוח (בעיה משפטית)',
        'הוצאה לפועל',
      ],
      medium: [
        '60+ ימים בפיגור',
        'דרישה לתשלום',
      ],
      low: [
        '30-60 ימים בפיגור',
      ],
    },
    solutions: [
      {
        name: 'סידור חוב עם חברת הביטוח',
        description: 'הסכם לתשלום בתנאים שונים',
        pros: ['קל לסידור', 'חוב קטן בדרך כלל'],
        cons: ['צריך לשלם'],
        difficulty: 'easy',
        timeframe: '1-2 שבועות',
      },
      {
        name: 'תוכנית תשלומים',
        description: 'תוכנית תשלומים מובנית',
        pros: ['הפחתת תשלום חודשי'],
        cons: ['צריך הסכמה של חברת הביטוח'],
        difficulty: 'easy',
        timeframe: '1-2 שבועות',
      },
      {
        name: 'פשיטת רגל',
        description: 'הליך משפטי לביטול חובות',
        pros: ['ביטול חובות'],
        cons: ['השפעה משמעותית על אשראי'],
        difficulty: 'hard',
        timeframe: '6-12 חודשים',
      },
    ],
    professionalRouting: {
      lawyer: false,
      financialAdvisor: false,
      ngo: true,
      mentor: false,
    },
    riskFactors: {
      debtAmount: 10,
      monthsLate: 10,
      legalStatus: 20,
      enforcementSpeed: 'medium',
    },
  },
};

/**
 * Get debt type info by ID
 */
export function getDebtTypeInfo(debtTypeId: string): DebtTypeInfo | undefined {
  return DEBT_TYPES[debtTypeId];
}

/**
 * Get all debt types
 */
export function getAllDebtTypes(): DebtTypeInfo[] {
  return Object.values(DEBT_TYPES);
}

/**
 * Get debt type by Hebrew name
 */
export function getDebtTypeByHebrewName(hebrewName: string): DebtTypeInfo | undefined {
  return Object.values(DEBT_TYPES).find(dt => dt.hebrewName === hebrewName);
}

/**
 * Calculate risk score for a specific debt type
 */
export function calculateDebtTypeRiskScore(
  debtTypeId: string,
  amount: number,
  monthsLate: number,
  legalStatus: string
): number {
  const debtType = getDebtTypeInfo(debtTypeId);
  if (!debtType) return 0;

  let score = 0;

  // Debt amount score
  const amountFactor = Math.min((amount / 100000) * debtType.riskFactors.debtAmount, debtType.riskFactors.debtAmount);
  score += amountFactor;

  // Months late score
  const monthsFactor = Math.min((monthsLate / 12) * debtType.riskFactors.monthsLate, debtType.riskFactors.monthsLate);
  score += monthsFactor;

  // Legal status score
  const legalScores: Record<string, number> = {
    overdue: 0,
    demand_letter: 20,
    lawsuit: 50,
    enforcement: 100,
    levy: 150,
    insolvency: 200,
  };
  score += legalScores[legalStatus] || 0;

  // Enforcement speed penalty
  const speedPenalties: Record<string, number> = {
    slow: 0,
    medium: 10,
    fast: 30,
    very_fast: 50,
  };
  score += speedPenalties[debtType.riskFactors.enforcementSpeed] || 0;

  return Math.max(0, Math.min(200, score));
}

/**
 * Get professional routing for a debt type
 */
export function getProfessionalRouting(debtTypeId: string): {
  needsLawyer: boolean;
  needsFinancialAdvisor: boolean;
  needsNGO: boolean;
  needsMentor: boolean;
} {
  const debtType = getDebtTypeInfo(debtTypeId);
  if (!debtType) {
    return {
      needsLawyer: false,
      needsFinancialAdvisor: false,
      needsNGO: false,
      needsMentor: false,
    };
  }

  return {
    needsLawyer: debtType.professionalRouting.lawyer,
    needsFinancialAdvisor: debtType.professionalRouting.financialAdvisor,
    needsNGO: debtType.professionalRouting.ngo,
    needsMentor: debtType.professionalRouting.mentor,
  };
}
