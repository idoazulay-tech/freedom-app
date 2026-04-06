/**
 * 42 Expense Categories for Freedom System
 * Comprehensive categorization of all possible expenses for debt analysis
 */

export const EXPENSE_CATEGORIES_42 = [
  // Housing (דיור) - 4 categories
  {
    id: 'housing_rent',
    name: 'שכר דירה',
    category: 'דיור',
    icon: 'Home',
    description: 'תשלום שכר דירה חודשי',
  },
  {
    id: 'housing_mortgage',
    name: 'משכנתא',
    category: 'דיור',
    icon: 'Building2',
    description: 'תשלום משכנתא חודשי',
  },
  {
    id: 'housing_maintenance',
    name: 'תחזוקה ותיקונים',
    category: 'דיור',
    icon: 'Wrench',
    description: 'תחזוקה, תיקונים, וחידושים בדירה',
  },
  {
    id: 'housing_property_tax',
    name: 'מס רכוש',
    category: 'דיור',
    icon: 'FileText',
    description: 'מס רכוש שנתי',
  },

  // Utilities (שירותים) - 4 categories
  {
    id: 'utilities_electricity',
    name: 'חשמל',
    category: 'שירותים',
    icon: 'Zap',
    description: 'תשלום חשמל חודשי',
  },
  {
    id: 'utilities_water',
    name: 'מים וביוב',
    category: 'שירותים',
    icon: 'Droplet',
    description: 'תשלום מים וביוב',
  },
  {
    id: 'utilities_gas',
    name: 'גז',
    category: 'שירותים',
    icon: 'Flame',
    description: 'תשלום גז טבעי',
  },
  {
    id: 'utilities_internet',
    name: 'אינטרנט וטלפון',
    category: 'שירותים',
    icon: 'Wifi',
    description: 'אינטרנט, טלפון קווי, וטלוויזיה',
  },

  // Food & Groceries (מזון) - 3 categories
  {
    id: 'food_groceries',
    name: 'קניות מכולת',
    category: 'מזון',
    icon: 'ShoppingCart',
    description: 'קניות מזון וצרכי בית',
  },
  {
    id: 'food_restaurants',
    name: 'אכילה בחוץ',
    category: 'מזון',
    icon: 'UtensilsCrossed',
    description: 'ארוחות במסעדות וקפה',
  },
  {
    id: 'food_delivery',
    name: 'הזמנות למשלוח',
    category: 'מזון',
    icon: 'Truck',
    description: 'הזמנות אוכל למשלוח',
  },

  // Transportation (תחבורה) - 5 categories
  {
    id: 'transport_car_payment',
    name: 'תשלום רכב',
    category: 'תחבורה',
    icon: 'Car',
    description: 'תשלום הלוואה או ליסינג לרכב',
  },
  {
    id: 'transport_fuel',
    name: 'דלק',
    category: 'תחבורה',
    icon: 'Fuel',
    description: 'דלק לרכב',
  },
  {
    id: 'transport_insurance',
    name: 'ביטוח רכב',
    category: 'תחבורה',
    icon: 'Shield',
    description: 'ביטוח חובה וביטוח כולל',
  },
  {
    id: 'transport_maintenance',
    name: 'תחזוקה וטיפול רכב',
    category: 'תחבורה',
    icon: 'Wrench',
    description: 'תחזוקה, טיפול, וחלקי חילוף',
  },
  {
    id: 'transport_public',
    name: 'תחבורה ציבורית',
    category: 'תחבורה',
    icon: 'Bus',
    description: 'כרטיסי אוטובוס, רכבת, ומונית',
  },

  // Healthcare (בריאות) - 4 categories
  {
    id: 'health_insurance',
    name: 'ביטוח בריאות',
    category: 'בריאות',
    icon: 'Heart',
    description: 'דמי ביטוח בריאות',
  },
  {
    id: 'health_doctor',
    name: 'ביקורי רופא',
    category: 'בריאות',
    icon: 'Stethoscope',
    description: 'ביקורים אצל רופאים וקלינקות',
  },
  {
    id: 'health_medications',
    name: 'תרופות',
    category: 'בריאות',
    icon: 'Pill',
    description: 'תרופות ותוספי תזונה',
  },
  {
    id: 'health_dental',
    name: 'טיפול שיניים',
    category: 'בריאות',
    icon: 'Smile',
    description: 'טיפול שיניים וניקוי',
  },

  // Education (חינוך) - 3 categories
  {
    id: 'education_tuition',
    name: 'שכר לימודים',
    category: 'חינוך',
    icon: 'BookOpen',
    description: 'שכר לימודים לבית ספר או יוניברסיטה',
  },
  {
    id: 'education_materials',
    name: 'ספרים וחומרים',
    category: 'חינוך',
    icon: 'BookMarked',
    description: 'ספרים, מחברות, וחומרי לימוד',
  },
  {
    id: 'education_courses',
    name: 'קורסים והכשרות',
    category: 'חינוך',
    icon: 'Graduation',
    description: 'קורסים מקצועיים והכשרות',
  },

  // Childcare & Family (משפחה) - 3 categories
  {
    id: 'family_childcare',
    name: 'גן/יומון',
    category: 'משפחה',
    icon: 'Baby',
    description: 'שכר גן ילדים או יומון',
  },
  {
    id: 'family_children_expenses',
    name: 'הוצאות ילדים',
    category: 'משפחה',
    icon: 'Users',
    description: 'ביגוד, צעצועים, וציוד ילדים',
  },
  {
    id: 'family_support',
    name: 'תמיכה במשפחה',
    category: 'משפחה',
    icon: 'Heart',
    description: 'תמיכה כספית לבני משפחה',
  },

  // Personal Care (טיפול אישי) - 3 categories
  {
    id: 'personal_grooming',
    name: 'ספר/קוסמטיקה',
    category: 'טיפול אישי',
    icon: 'Scissors',
    description: 'ספר, מניקור, פדיקור, וקוסמטיקה',
  },
  {
    id: 'personal_clothing',
    name: 'ביגוד',
    category: 'טיפול אישי',
    icon: 'Shirt',
    description: 'ביגוד ונעליים',
  },
  {
    id: 'personal_hygiene',
    name: 'מוצרי היגיינה',
    category: 'טיפול אישי',
    icon: 'Droplet',
    description: 'מוצרי ניקיון וטיפול אישי',
  },

  // Entertainment & Leisure (בידור) - 3 categories
  {
    id: 'entertainment_subscriptions',
    name: 'מנויים לבידור',
    category: 'בידור',
    icon: 'Film',
    description: 'Netflix, Spotify, וגיימינג',
  },
  {
    id: 'entertainment_hobbies',
    name: 'תחביבים',
    category: 'בידור',
    icon: 'Gamepad2',
    description: 'ספורט, אמנות, וחוגים',
  },
  {
    id: 'entertainment_travel',
    name: 'טיולים וחופשות',
    category: 'בידור',
    icon: 'Plane',
    description: 'טיולים, חופשות, והלינה',
  },

  // Insurance (ביטוח) - 3 categories
  {
    id: 'insurance_home',
    name: 'ביטוח דירה',
    category: 'ביטוח',
    icon: 'Home',
    description: 'ביטוח דירה וחפצים',
  },
  {
    id: 'insurance_life',
    name: 'ביטוח חיים',
    category: 'ביטוח',
    icon: 'Heart',
    description: 'ביטוח חיים וביטוח אובדן כושר עבודה',
  },
  {
    id: 'insurance_other',
    name: 'ביטוח אחר',
    category: 'ביטוח',
    icon: 'Shield',
    description: 'ביטוח אחר (תאונות, אחריות)',
  },

  // Loans & Financial (הלוואות) - 3 categories
  {
    id: 'loans_repayment',
    name: 'החזרי הלוואות',
    category: 'הלוואות',
    icon: 'DollarSign',
    description: 'החזרי הלוואות אחרות',
  },
  {
    id: 'loans_bank_fees',
    name: 'עמלות בנק',
    category: 'הלוואות',
    icon: 'CreditCard',
    description: 'עמלות בנק וחיובים',
  },
  {
    id: 'loans_credit_fees',
    name: 'עמלות אשראי',
    category: 'הלוואות',
    icon: 'CreditCard',
    description: 'עמלות כרטיס אשראי וחיובים',
  },

  // Professional & Work (עבודה) - 2 categories
  {
    id: 'work_professional_fees',
    name: 'מנויים מקצועיים',
    category: 'עבודה',
    icon: 'Briefcase',
    description: 'מנויים מקצועיים וחברויות',
  },
  {
    id: 'work_office_supplies',
    name: 'ציוד משרדי',
    category: 'עבודה',
    icon: 'FileText',
    description: 'ציוד משרדי וציוד עבודה',
  },

  // Savings & Investments (חיסכון) - 1 category
  {
    id: 'savings_deposits',
    name: 'הפקדות חיסכון',
    category: 'חיסכון',
    icon: 'PiggyBank',
    description: 'הפקדות לחיסכון והשקעות',
  },
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES_42[number];

export const getExpenseCategoryById = (id: string): ExpenseCategory | undefined => {
  return EXPENSE_CATEGORIES_42.find(cat => cat.id === id);
};

export const getExpensesByCategory = (category: string): ExpenseCategory[] => {
  return EXPENSE_CATEGORIES_42.filter(cat => cat.category === category);
};

export const getAllCategories = (): string[] => {
  const categories = new Set(EXPENSE_CATEGORIES_42.map(cat => cat.category));
  return Array.from(categories);
};

export const expenseSchema = {
  type: 'object',
  properties: {
    category: {
      type: 'string',
      enum: EXPENSE_CATEGORIES_42.map(cat => cat.id),
    },
    amount: {
      type: 'number',
      minimum: 0,
    },
    date: {
      type: 'string',
      format: 'date-time',
    },
  },
  required: ['category', 'amount', 'date'],
} as const;
