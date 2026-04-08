/**
 * Comprehensive list of Israeli financial institutions that provide loans/credit
 * Used for debt form creditor selection
 */

export type CreditorCategory = 
  | 'bank'
  | 'credit_card'
  | 'finance_company'
  | 'insurance'
  | 'institutional'
  | 'p2p'
  | 'collection'
  | 'other';

export interface Creditor {
  id: string;
  name: string;
  category: CreditorCategory;
  hebrewName: string;
}

export const CREDITORS_BY_CATEGORY: Record<CreditorCategory, Creditor[]> = {
  bank: [
    { id: 'bank_leumi', name: 'Bank Leumi', hebrewName: 'בנק לאומי', category: 'bank' },
    { id: 'bank_hapoalim', name: 'Bank Hapoalim', hebrewName: 'בנק הפועלים', category: 'bank' },
    { id: 'bank_mizrahi_tefahot', name: 'Bank Mizrahi Tefahot', hebrewName: 'בנק מזרחי טפחות', category: 'bank' },
    { id: 'bank_discount', name: 'Bank Discount', hebrewName: 'בנק דיסקונט', category: 'bank' },
    { id: 'bank_jerusalem', name: 'Bank Jerusalem', hebrewName: 'בנק ירושלים', category: 'bank' },
    { id: 'bank_yahav', name: 'Bank Yahav', hebrewName: 'בנק יהב', category: 'bank' },
    { id: 'bank_masad', name: 'Bank Masad', hebrewName: 'בנק מסד', category: 'bank' },
    { id: 'bank_arab_israeli', name: 'Arab Israeli Bank', hebrewName: 'בנק ערבי ישראלי', category: 'bank' },
    { id: 'bank_igud', name: 'Bank Igud', hebrewName: 'בנק איגוד', category: 'bank' },
    { id: 'bank_otzar_hachayal', name: 'Bank Otzar Hachayal', hebrewName: 'בנק אוצר החייל', category: 'bank' },
    { id: 'bank_ashrai', name: 'Bank Ashrai Israeli', hebrewName: 'בנק אשראי ישראלי', category: 'bank' },
    { id: 'bank_mercantile_discount', name: 'Bank Mercantile Discount', hebrewName: 'בנק מרכנטיל דיסקונט', category: 'bank' },
    { id: 'bank_international_first', name: 'First International Bank', hebrewName: 'הבנק הבינלאומי הראשון', category: 'bank' },
    { id: 'bank_one_zero', name: 'One Zero Digital', hebrewName: 'וואן זירו דיגיטל', category: 'bank' },
    { id: 'bank_yahav_employees', name: 'Bank Yahav for State Employees', hebrewName: 'בנק יהב לעובדי המדינה', category: 'bank' },
  ],
  credit_card: [
    { id: 'cc_isracard', name: 'Isracard', hebrewName: 'ישראכרט', category: 'credit_card' },
    { id: 'cc_cal', name: 'Cal (כאל)', hebrewName: 'כאל', category: 'credit_card' },
    { id: 'cc_max', name: 'MAX', hebrewName: 'MAX', category: 'credit_card' },
    { id: 'cc_leumi_card', name: 'Leumi Card', hebrewName: 'לאומי קארד', category: 'credit_card' },
    { id: 'cc_amex', name: 'American Express', hebrewName: 'אמריקן אקספרס', category: 'credit_card' },
    { id: 'cc_eurocard', name: 'Eurocard', hebrewName: 'יורופיי', category: 'credit_card' },
    { id: 'cc_poalim_express', name: 'Poalim Express', hebrewName: 'פועלים אקספרס', category: 'credit_card' },
    { id: 'cc_diners_club', name: 'Diners Club Israel', hebrewName: 'דיינרס קלאב ישראל', category: 'credit_card' },
    { id: 'cc_premium_express', name: 'Premium Express', hebrewName: 'פרימיום אקספרס', category: 'credit_card' },
  ],
  finance_company: [
    { id: 'fin_bestloan', name: 'Bestloan', hebrewName: 'Bestloan', category: 'finance_company' },
    { id: 'fin_smartloan', name: 'Smartloan (הלוואה חכמה)', hebrewName: 'הלוואה חכמה', category: 'finance_company' },
    { id: 'fin_express', name: 'Express Finance', hebrewName: 'אקספרס פיננסים', category: 'finance_company' },
    { id: 'fin_peninsula', name: 'Peninsula', hebrewName: 'פנינסולה', category: 'finance_company' },
    { id: 'fin_telma', name: 'Telma Finance', hebrewName: 'תלמה מימון', category: 'finance_company' },
    { id: 'fin_yelin', name: 'Yelin Finance', hebrewName: 'ילין פיננסים', category: 'finance_company' },
    { id: 'fin_pisgot', name: 'Pisgot Finance', hebrewName: 'פסגות מימון', category: 'finance_company' },
  ],
  insurance: [
    { id: 'ins_harel', name: 'Harel Insurance', hebrewName: 'הראל', category: 'insurance' },
    { id: 'ins_phoenix', name: 'Phoenix Insurance', hebrewName: 'הפניקס', category: 'insurance' },
    { id: 'ins_menora', name: 'Menora Insurance', hebrewName: 'מנורה מבטחים', category: 'insurance' },
    { id: 'ins_klal', name: 'Klal Insurance', hebrewName: 'כלל ביטוח', category: 'insurance' },
    { id: 'ins_migdal', name: 'Migdal Insurance', hebrewName: 'מגדל', category: 'insurance' },
    { id: 'ins_ayalon', name: 'Ayalon Insurance', hebrewName: 'איילון', category: 'insurance' },
    { id: 'ins_clal', name: 'Clal Insurance', hebrewName: 'Clal ביטוח', category: 'insurance' },
    { id: 'ins_harel_finance', name: 'Harel Finance', hebrewName: 'הראל פיננסים', category: 'insurance' },
    { id: 'ins_klal_finance', name: 'Klal Finance', hebrewName: 'כלל פיננסים', category: 'insurance' },
  ],
  institutional: [
    { id: 'inst_altshuler_shaham', name: 'Altshuler Shaham', hebrewName: 'אלטשולר שחם', category: 'institutional' },
    { id: 'inst_mitav_dash', name: 'Mitav Dash', hebrewName: 'מיטב דש', category: 'institutional' },
    { id: 'inst_keren_makefet', name: 'Keren Makefet', hebrewName: 'קרן מקפת', category: 'institutional' },
    { id: 'inst_amitim', name: 'Amitim (Insurers)', hebrewName: 'עמיתים', category: 'institutional' },
    { id: 'inst_pisgot_kranot', name: 'Pisgot Kranot', hebrewName: 'פסגות קרנות', category: 'institutional' },
  ],
  p2p: [
    { id: 'p2p_blender', name: 'Blender', hebrewName: 'בלנדר', category: 'p2p' },
    { id: 'p2p_tbt', name: 'TBT (Teva Tech)', hebrewName: 'טבע טק', category: 'p2p' },
    { id: 'p2p_peer_lending', name: 'Peer-to-Peer Lending Israel', hebrewName: 'Peer-to-Peer Lending ישראל', category: 'p2p' },
    { id: 'p2p_eloan', name: 'eLoan', hebrewName: 'eLoan', category: 'p2p' },
    { id: 'p2p_tarya', name: 'Tarya', hebrewName: 'Tarya', category: 'p2p' },
  ],
  collection: [
    { id: 'coll_migdal', name: 'Migdal Collection', hebrewName: 'מגדל גבייה', category: 'collection' },
    { id: 'coll_dor_alon', name: 'Dor Alon Finance', hebrewName: 'דור אלון פיננסים', category: 'collection' },
    { id: 'coll_accord', name: 'Accord Finance', hebrewName: 'אקורד פיננסים', category: 'collection' },
    { id: 'coll_pisgot', name: 'Pisgot Collection', hebrewName: 'פסגות גבייה', category: 'collection' },
  ],
  other: [
    { id: 'other_national_insurance', name: 'National Insurance Institute', hebrewName: 'ביטוח לאומי', category: 'other' },
    { id: 'other_defense_ministry', name: 'Defense Ministry', hebrewName: 'משרד הביטחון', category: 'other' },
    { id: 'other_pension_funds', name: 'Pension Funds/Savings', hebrewName: 'קופות גמל/פנסיה', category: 'other' },
  ],
};

export const ALL_CREDITORS = Object.values(CREDITORS_BY_CATEGORY).flat();

export const CREDITOR_CATEGORIES = [
  { id: 'bank', label: 'בנקים', hebrewLabel: 'בנקים' },
  { id: 'credit_card', label: 'כרטיסי אשראי וחברות אשראי', hebrewLabel: 'כרטיסי אשראי וחברות אשראי' },
  { id: 'finance_company', label: 'חברות מימון', hebrewLabel: 'חברות מימון' },
  { id: 'insurance', label: 'חברות ביטוח', hebrewLabel: 'חברות ביטוח' },
  { id: 'institutional', label: 'גופים מוסדיים', hebrewLabel: 'גופים מוסדיים' },
  { id: 'p2p', label: 'בלנדר והלוואות חברתיות', hebrewLabel: 'בלנדר והלוואות חברתיות' },
  { id: 'collection', label: 'חברות גבייה', hebrewLabel: 'חברות גבייה' },
  { id: 'other', label: 'אחר', hebrewLabel: 'אחר' },
] as const;

export function getCreditorsByCategory(category: CreditorCategory): Creditor[] {
  return CREDITORS_BY_CATEGORY[category] || [];
}

export function getCreditorName(creditorId: string): string {
  const creditor = ALL_CREDITORS.find(c => c.id === creditorId);
  return creditor?.hebrewName || creditorId;
}
