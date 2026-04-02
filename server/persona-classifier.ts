/**
 * Persona Classification Engine
 * Classifies users into Yossi, Dana, or Avi based on their debt situation
 */

import { Debt } from '../shared/debt-categories';

export interface PersonaProfile {
  persona: 'yossi' | 'dana' | 'avi';
  name: string;
  emoji: string;
  description: string;
  characteristics: string[];
  challenges: string[];
  strengths: string[];
  recommendedPath: string;
  estimatedTimeToResolution: string;
  successRate: number;
  costEstimate: string;
  supportLevel: 'self-service' | 'guided' | 'professional' | 'intensive';
}

export interface PersonaAnalysis {
  persona: PersonaProfile;
  confidence: number;
  riskFactors: string[];
  opportunities: string[];
  customizedAdvice: string[];
}

/**
 * Yossi Profile: Simple, manageable cases
 * - Single or dual debts
 * - Small to medium amounts
 * - No legal proceedings
 * - Can resolve independently with guidance
 */
const YOSSI_PROFILE: PersonaProfile = {
  persona: 'yossi',
  name: 'יוסי',
  emoji: '🟢',
  description: 'מקרה פשוט וניתן לפתור - יוסי יכול להתמודד עם זה בעצמו עם הכוונה',
  characteristics: [
    'חוב יחיד או שניים',
    'סכום קטן עד בינוני (עד 50K)',
    'פיגור קטן (עד 3 חודשים)',
    'ללא הליכים משפטיים',
    'הכנסה יציבה',
    'אין נכסים בסיכון',
  ],
  challenges: [
    'קושי בניהול תקציב',
    'חוסר ידע בזכויות החייב',
    'פחד מהתקשרות עם נושים',
  ],
  strengths: [
    'יכולת לתקשר עם נושים',
    'הכנסה יציבה לתשלומים',
    'מוטיבציה לפתור',
  ],
  recommendedPath: 'יועץ כלכלי + הסדר ישיר עם נושים',
  estimatedTimeToResolution: '1-2 חודשים',
  successRate: 0.92,
  costEstimate: '500-1500 ש"ח',
  supportLevel: 'guided',
};

/**
 * Dana Profile: Complex, multi-faceted cases
 * - Multiple debts (2-4)
 * - Medium to large amounts
 * - Some legal proceedings
 * - Needs professional guidance
 */
const DANA_PROFILE: PersonaProfile = {
  persona: 'dana',
  name: 'דנה',
  emoji: '🟡',
  description: 'מקרה מורכב - דנה צריכה ייעוץ מקצועי ותמיכה מתמשכת',
  characteristics: [
    'מספר חובות (2-4)',
    'סכומים בינוניים עד גדולים (50K-200K)',
    'פיגור משמעותי (3-12 חודשים)',
    'תביעות משפטיות',
    'הכנסה לא יציבה או חלקית',
    'אולי נכס בסיכון',
  ],
  challenges: [
    'ניהול מספר נושים',
    'הליכים משפטיים',
    'לחץ פסיכולוגי',
    'קושי בתכנון פיננסי',
  ],
  strengths: [
    'מוכנה לשיתוף פעולה עם מומחים',
    'יכולת ללמוד וליישם',
    'רצון לפתור',
  ],
  recommendedPath: 'עורך דין בחובות + יועץ הסדרים',
  estimatedTimeToResolution: '2-4 חודשים',
  successRate: 0.85,
  costEstimate: '2000-5000 ש"ח',
  supportLevel: 'professional',
};

/**
 * Avi Profile: Critical, urgent cases
 * - Multiple severe debts (3+)
 * - Large amounts (200K+)
 * - Serious legal proceedings (enforcement, insolvency)
 * - Requires immediate professional intervention
 */
const AVI_PROFILE: PersonaProfile = {
  persona: 'avi',
  name: 'אבי',
  emoji: '🔴',
  description: 'מקרה קריטי - אבי צריך התערבות משפטית מידית ותמיכה אינטנסיבית',
  characteristics: [
    'חובות מרובים (3+)',
    'סכומים גדולים (200K+)',
    'פיגור חמור (12+ חודשים)',
    'עיקולים או חדלות פירעון',
    'הכנסה נמוכה או חסרה',
    'נכסים בסיכון משמעותי',
  ],
  challenges: [
    'סכנה מידית של עיקול',
    'מספר הליכים משפטיים',
    'לחץ פסיכולוגי קשה',
    'אפשרות חדלות פירעון',
  ],
  strengths: [
    'מודע לחומרת המצב',
    'מוכן לפעולה דרסטית',
    'מחפש פתרון מידי',
  ],
  recommendedPath: 'עורך דין מומחה בחדלות פירעון + ייעוץ משפטי מידי',
  estimatedTimeToResolution: '3-6 חודשים',
  successRate: 0.78,
  costEstimate: '5000-15000 ש"ח',
  supportLevel: 'intensive',
};

/**
 * Classify user into persona based on debt analysis
 */
export function classifyPersona(debts: Debt[], totalScore: number): PersonaAnalysis {
  // Count debts and analyze severity
  const debtCount = debts.length;
  const totalAmount = debts.reduce((sum, d) => sum + d.amount, 0);
  const maxMonthsLate = Math.max(...debts.map(d => d.months_late));

  // Check for critical legal statuses
  const hasCriticalStatus = debts.some(
    d => d.legal_status === 'levy' || d.legal_status === 'insolvency'
  );
  const hasEnforcement = debts.some(d => d.legal_status === 'enforcement');
  const hasLawsuit = debts.some(d => d.legal_status === 'lawsuit');

  // Determine persona
  let persona: PersonaProfile;
  let confidence: number;
  const riskFactors: string[] = [];
  const opportunities: string[] = [];
  const customizedAdvice: string[] = [];

  // Avi: Critical cases
  if (hasCriticalStatus || totalScore > 300 || (debtCount >= 3 && totalAmount > 200000)) {
    persona = AVI_PROFILE;
    confidence = 0.95;

    riskFactors.push('סכנה מידית של עיקול או חדלות פירעון');
    riskFactors.push('מספר נושים משמעותי');
    riskFactors.push('סכומים גדולים');

    opportunities.push('אפשרות הסדר כולל עם כל הנושים');
    opportunities.push('הגנות משפטיות זמינות');

    customizedAdvice.push('צור קשר עם עורך דין בתוך 24 שעות');
    customizedAdvice.push('אסוף את כל מספרי התיקים המשפטיים');
    customizedAdvice.push('בדוק אפשרויות הגנה על נכסים');
    customizedAdvice.push('שקול הסדר כולל עם כל הנושים');
  }
  // Dana: Complex cases
  else if (
    totalScore > 150 ||
    debtCount >= 2 ||
    hasLawsuit ||
    (totalAmount > 50000 && maxMonthsLate > 6)
  ) {
    persona = DANA_PROFILE;
    confidence = 0.88;

    riskFactors.push('מספר חובות');
    riskFactors.push('סכומים בינוניים עד גדולים');
    if (hasLawsuit) riskFactors.push('תביעות משפטיות');

    opportunities.push('אפשרות להסדר כולל');
    opportunities.push('תמיכה משפטית זמינה');

    customizedAdvice.push('התייעץ עם עורך דין בחובות');
    customizedAdvice.push('בנה תוכנית הסדרים מובנית');
    customizedAdvice.push('שקול הסדר כולל עם הנושים');
    customizedAdvice.push('ערוך רשימה של כל החובות והנושים');
  }
  // Yossi: Simple cases
  else {
    persona = YOSSI_PROFILE;
    confidence = 0.92;

    riskFactors.push('פיגור בחוב');
    if (debtCount > 1) riskFactors.push('מספר חובות');

    opportunities.push('אפשרות להסדר ישיר עם נושים');
    opportunities.push('יכולת לפתור בעצמך עם הכוונה');

    customizedAdvice.push('צור קשר עם הנושים להצעת הסדר');
    customizedAdvice.push('בנה תוכנית תשלומים בהתאם ליכולתך');
    customizedAdvice.push('שמור על תקשורת עם הנושים');
    customizedAdvice.push('בקש ייעוץ כלכלי לתכנון');
  }

  return {
    persona,
    confidence,
    riskFactors,
    opportunities,
    customizedAdvice,
  };
}

/**
 * Get persona profile by name
 */
export function getPersonaProfile(personaName: 'yossi' | 'dana' | 'avi'): PersonaProfile {
  switch (personaName) {
    case 'yossi':
      return YOSSI_PROFILE;
    case 'dana':
      return DANA_PROFILE;
    case 'avi':
      return AVI_PROFILE;
    default:
      return YOSSI_PROFILE;
  }
}

/**
 * Get all personas for comparison
 */
export function getAllPersonas(): PersonaProfile[] {
  return [YOSSI_PROFILE, DANA_PROFILE, AVI_PROFILE];
}

/**
 * Generate personalized message for user
 */
export function generatePersonaMessage(analysis: PersonaAnalysis): string {
  const { persona, confidence } = analysis;

  return `
🎯 **אבחון אישי: ${persona.name}**

${persona.emoji} **מצב:** ${persona.description}

**ביטחון בסיווג:** ${Math.round(confidence * 100)}%

**המלצה:** ${persona.recommendedPath}

**זמן משוער לפתרון:** ${persona.estimatedTimeToResolution}

**שיעור הצלחה:** ${Math.round(persona.successRate * 100)}%

**הערכת עלות:** ${persona.costEstimate}

---

**צעדים מיידיים:**
${analysis.customizedAdvice.map((advice, i) => `${i + 1}. ${advice}`).join('\n')}
  `.trim();
}
