/**
 * Professional Matching Engine - התאמה של בעלי חובות למומחים
 * מחשב: ניקוד התאמה, מומחיות, שיעור הצלחה, ניסיון
 */

export interface Professional {
  id: string;
  name: string;
  title: string;
  specialty: string;
  specialties: string[];
  experience: number; // years
  successRate: number; // 0-100
  casesHandled: number;
  languages: string[];
  location: string;
  phone: string;
  email: string;
  website?: string;
  certifications: string[];
  reviews: {
    average: number;
    count: number;
  };
  availability: 'immediate' | 'week' | 'month' | 'limited';
  costRange: {
    min: number;
    max: number;
    currency: string;
  };
  type: 'lawyer' | 'financial_advisor' | 'ngo' | 'mentor';
}

export interface MatchingResult {
  professional: Professional;
  matchScore: number; // 0-100
  matchReason: string;
  relevantSpecialties: string[];
  estimatedCost: number;
  expectedOutcome: string;
  nextSteps: string[];
}

// Database of professionals (in real app, this would be in a database)
export const PROFESSIONALS_DATABASE: Professional[] = [
  // Lawyers
  {
    id: 'lawyer_1',
    name: 'עו"ד דוד כהן',
    title: 'עורך דין בדיני חובות',
    specialty: 'דיני חובות ופשיטת רגל',
    specialties: ['דיני חובות', 'פשיטת רגל', 'הוצאה לפועל', 'משא ומתן עם נושים'],
    experience: 15,
    successRate: 92,
    casesHandled: 450,
    languages: ['עברית', 'אנגלית'],
    location: 'תל אביב',
    phone: '03-1234567',
    email: 'david@law.co.il',
    website: 'www.davidkohn-law.co.il',
    certifications: ['בר הסגל', 'מומחה בדיני חובות'],
    reviews: { average: 4.8, count: 127 },
    availability: 'week',
    costRange: { min: 1500, max: 5000, currency: 'ILS' },
    type: 'lawyer',
  },
  {
    id: 'lawyer_2',
    name: 'עו"ד שרה לוי',
    title: 'עורכת דין בדיני צרכן',
    specialty: 'משא ומתן עם נושים',
    specialties: ['משא ומתן עם נושים', 'דיני צרכן', 'כרטיסי אשראי', 'הלוואות'],
    experience: 12,
    successRate: 87,
    casesHandled: 320,
    languages: ['עברית', 'אנגלית', 'רוסית'],
    location: 'ירושלים',
    phone: '02-9876543',
    email: 'sarah@law.co.il',
    website: 'www.sarahlevi-law.co.il',
    certifications: ['בר הסגל', 'מומחה בדיני צרכן'],
    reviews: { average: 4.7, count: 98 },
    availability: 'immediate',
    costRange: { min: 1000, max: 4000, currency: 'ILS' },
    type: 'lawyer',
  },
  {
    id: 'lawyer_3',
    name: 'עו"ד יוסף אברהם',
    title: 'עורך דין בדיני מס',
    specialty: 'חובות מס וחובות ממשלתיים',
    specialties: ['חובות מס', 'חובות עירוניים', 'חובות ממשלתיים'],
    experience: 18,
    successRate: 89,
    casesHandled: 380,
    languages: ['עברית', 'אנגלית'],
    location: 'בני ברק',
    phone: '03-5555555',
    email: 'yosef@law.co.il',
    certifications: ['בר הסגל', 'מומחה בדיני מס'],
    reviews: { average: 4.6, count: 85 },
    availability: 'week',
    costRange: { min: 2000, max: 6000, currency: 'ILS' },
    type: 'lawyer',
  },

  // Financial Advisors
  {
    id: 'advisor_1',
    name: 'יועץ פיננסי אברהם שמעון',
    title: 'יועץ פיננסי בכיר',
    specialty: 'תכניות תשלומים וסידור חובות',
    specialties: ['תכניות תשלומים', 'סידור חובות', 'ניהול תקציב', 'תכנון פיננסי'],
    experience: 10,
    successRate: 90,
    casesHandled: 250,
    languages: ['עברית', 'אנגלית'],
    location: 'תל אביב',
    phone: '03-7777777',
    email: 'avraham@financial.co.il',
    website: 'www.avraham-financial.co.il',
    certifications: ['יועץ פיננסי מוסמך', 'מומחה בניהול חובות'],
    reviews: { average: 4.9, count: 156 },
    availability: 'immediate',
    costRange: { min: 500, max: 2000, currency: 'ILS' },
    type: 'financial_advisor',
  },
  {
    id: 'advisor_2',
    name: 'יועצת פיננסית רחל כהן',
    title: 'יועצת פיננסית',
    specialty: 'ניהול תקציב וחיסכון',
    specialties: ['ניהול תקציב', 'חיסכון', 'הכנסה נוספת', 'תכנון פיננסי'],
    experience: 8,
    successRate: 85,
    casesHandled: 180,
    languages: ['עברית', 'אנגלית'],
    location: 'חיפה',
    phone: '04-3333333',
    email: 'rachel@financial.co.il',
    certifications: ['יועצת פיננסית מוסמכת'],
    reviews: { average: 4.7, count: 92 },
    availability: 'week',
    costRange: { min: 400, max: 1500, currency: 'ILS' },
    type: 'financial_advisor',
  },

  // NGOs
  {
    id: 'ngo_1',
    name: 'עמותת עזרה בחובות',
    title: 'ארגון לא-רווחי לעזרה בחובות',
    specialty: 'ייעוץ חינם וייצוג משפטי',
    specialties: ['ייעוץ חינם', 'ייצוג משפטי', 'סידור חובות', 'הגנה צרכנית'],
    experience: 20,
    successRate: 85,
    casesHandled: 5000,
    languages: ['עברית', 'אנגלית', 'ערבית'],
    location: 'תל אביב',
    phone: '03-9999999',
    email: 'info@debthelp.org.il',
    website: 'www.debthelp.org.il',
    certifications: ['ארגון לא-רווחי רשום'],
    reviews: { average: 4.6, count: 2000 },
    availability: 'immediate',
    costRange: { min: 0, max: 500, currency: 'ILS' },
    type: 'ngo',
  },
  {
    id: 'ngo_2',
    name: 'קו עזרה לחובות',
    title: 'קו טלפוני לעזרה בחובות',
    specialty: 'ייעוץ טלפוני וחינם',
    specialties: ['ייעוץ טלפוני', 'ייעוץ חינם', 'הנחיה משפטית בסיסית'],
    experience: 15,
    successRate: 70,
    casesHandled: 8000,
    languages: ['עברית'],
    location: 'תל אביב',
    phone: '1-800-DEBT-HELP',
    email: 'help@debtline.org.il',
    website: 'www.debtline.org.il',
    certifications: ['ארגון לא-רווחי רשום'],
    reviews: { average: 4.3, count: 1500 },
    availability: 'immediate',
    costRange: { min: 0, max: 0, currency: 'ILS' },
    type: 'ngo',
  },

  // Mentors
  {
    id: 'mentor_1',
    name: 'מנטור עסקי דן לוי',
    title: 'מנטור עסקי וייעוץ קריירה',
    specialty: 'הכנסה נוספת והתחלת עסק',
    specialties: ['התחלת עסק', 'הכנסה נוספת', 'פיתוח קריירה', 'ייעוץ עסקי'],
    experience: 12,
    successRate: 80,
    casesHandled: 150,
    languages: ['עברית', 'אנגלית'],
    location: 'תל אביב',
    phone: '03-1111111',
    email: 'dan@mentor.co.il',
    website: 'www.danlevy-mentor.co.il',
    certifications: ['מנטור עסקי מוסמך'],
    reviews: { average: 4.8, count: 78 },
    availability: 'week',
    costRange: { min: 300, max: 1000, currency: 'ILS' },
    type: 'mentor',
  },
];

/**
 * Find matching professionals for a debt situation
 */
export function findMatchingProfessionals(
  debtTypes: string[],
  riskLevel: 'נמוך' | 'בינוני' | 'גבוה' | 'קריטי',
  hasEnforcement: boolean,
  hasWarningLetters: boolean,
  hasMultipleDebts: boolean,
  monthlyAvailable: number,
  location?: string
): MatchingResult[] {
  const matches: MatchingResult[] = [];

  for (const professional of PROFESSIONALS_DATABASE) {
    const matchScore = calculateMatchScore(
      professional,
      debtTypes,
      riskLevel,
      hasEnforcement,
      hasWarningLetters,
      hasMultipleDebts,
      monthlyAvailable,
      location
    );

    if (matchScore > 50) {
      const matchReason = generateMatchReason(professional, riskLevel, hasEnforcement);
      const relevantSpecialties = professional.specialties.filter(s =>
        debtTypes.some(dt => s.toLowerCase().includes(dt.toLowerCase()))
      );

      matches.push({
        professional,
        matchScore,
        matchReason,
        relevantSpecialties: relevantSpecialties.length > 0 ? relevantSpecialties : professional.specialties.slice(0, 2),
        estimatedCost: (professional.costRange.min + professional.costRange.max) / 2,
        expectedOutcome: generateExpectedOutcome(professional, riskLevel),
        nextSteps: generateNextSteps(professional),
      });
    }
  }

  // Sort by match score (highest first)
  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Calculate match score for a professional
 */
function calculateMatchScore(
  professional: Professional,
  debtTypes: string[],
  riskLevel: 'נמוך' | 'בינוני' | 'גבוה' | 'קריטי',
  hasEnforcement: boolean,
  hasWarningLetters: boolean,
  hasMultipleDebts: boolean,
  monthlyAvailable: number,
  location?: string
): number {
  let score = 0;

  // Type matching (40 points)
  if (riskLevel === 'קריטי' && professional.type === 'lawyer') {
    score += 40;
  } else if (riskLevel === 'גבוה' && professional.type === 'lawyer') {
    score += 35;
  } else if (riskLevel === 'בינוני' && professional.type === 'financial_advisor') {
    score += 35;
  } else if (riskLevel === 'נמוך' && professional.type === 'mentor') {
    score += 30;
  } else if (professional.type === 'ngo') {
    score += 25; // NGOs are good for all levels
  }

  // Enforcement matching (20 points)
  if (hasEnforcement && professional.type === 'lawyer') {
    score += 20;
  } else if (hasEnforcement && professional.type === 'ngo') {
    score += 15;
  }

  // Experience (15 points)
  score += Math.min((professional.experience / 20) * 15, 15);

  // Success rate (15 points)
  score += Math.min((professional.successRate / 100) * 15, 15);

  // Availability (10 points)
  if (professional.availability === 'immediate') {
    score += 10;
  } else if (professional.availability === 'week') {
    score += 7;
  } else if (professional.availability === 'month') {
    score += 4;
  }

  // Cost matching (10 points)
  if (monthlyAvailable > 0) {
    const monthlyBudget = monthlyAvailable * 0.1; // 10% of available funds
    if (professional.costRange.min <= monthlyBudget) {
      score += 10;
    } else if (professional.costRange.min <= monthlyBudget * 1.5) {
      score += 7;
    } else if (professional.costRange.min <= monthlyBudget * 2) {
      score += 4;
    }
  }

  // Location matching (5 points)
  if (location && professional.location.toLowerCase() === location.toLowerCase()) {
    score += 5;
  }

  return Math.min(100, score);
}

/**
 * Generate match reason
 */
function generateMatchReason(
  professional: Professional,
  riskLevel: string,
  hasEnforcement: boolean
): string {
  const reasons: string[] = [];

  if (professional.type === 'lawyer' && hasEnforcement) {
    reasons.push('מומחה בהוצאה לפועל');
  }

  if (professional.type === 'lawyer' && riskLevel === 'קריטי') {
    reasons.push('מומחה בהליכים משפטיים מורכבים');
  }

  if (professional.type === 'financial_advisor') {
    reasons.push('מומחה בתכניות תשלומים');
  }

  if (professional.type === 'ngo') {
    reasons.push('ייעוץ חינם או בעלות נמוכה');
  }

  if (professional.type === 'mentor') {
    reasons.push('עזרה בהכנסה נוספת');
  }

  reasons.push(`שיעור הצלחה: ${professional.successRate}%`);
  reasons.push(`ניסיון: ${professional.experience} שנים`);

  return reasons.join(' • ');
}

/**
 * Generate expected outcome
 */
function generateExpectedOutcome(professional: Professional, riskLevel: string): string {
  if (professional.type === 'lawyer') {
    if (riskLevel === 'קריטי') {
      return 'הגנה משפטית מלאה וסידור חוב משפטי';
    }
    return 'משא ומתן עם נושים וסידור חוב';
  }

  if (professional.type === 'financial_advisor') {
    return 'תוכנית תשלומים מפורטת וניהול תקציב';
  }

  if (professional.type === 'ngo') {
    return 'ייעוץ משפטי וסיוע בסידור חובות';
  }

  if (professional.type === 'mentor') {
    return 'מציאת הזדמנויות להכנסה נוספת';
  }

  return 'עזרה בפתרון המצב';
}

/**
 * Generate next steps
 */
function generateNextSteps(professional: Professional): string[] {
  return [
    `צור קשר עם ${professional.name}`,
    `בדוק זמינות לפגישה ראשונה`,
    `הכן מסמכים רלוונטיים`,
    `קבע תוכנית פעולה ראשונית`,
  ];
}

/**
 * Get professional by ID
 */
export function getProfessionalById(id: string): Professional | undefined {
  return PROFESSIONALS_DATABASE.find(p => p.id === id);
}

/**
 * Get all professionals of a specific type
 */
export function getProfessionalsByType(type: 'lawyer' | 'financial_advisor' | 'ngo' | 'mentor'): Professional[] {
  return PROFESSIONALS_DATABASE.filter(p => p.type === type);
}

/**
 * Search professionals by name or specialty
 */
export function searchProfessionals(query: string): Professional[] {
  const lowerQuery = query.toLowerCase();
  return PROFESSIONALS_DATABASE.filter(
    p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.specialty.toLowerCase().includes(lowerQuery) ||
      p.specialties.some(s => s.toLowerCase().includes(lowerQuery))
  );
}
