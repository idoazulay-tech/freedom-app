/**
 * Free/Premium Subscription Logic
 * Manages feature limits, billing, and subscription tiers
 */

export enum SubscriptionTier {
  FREE = 'free',
  PREMIUM = 'premium',
}

export interface SubscriptionLimits {
  maxDebts: number;
  maxExpenseCategories: number;
  maxProfessionals: number;
  maxDocuments: number;
  maxStorageGB: number;
  features: string[];
}

/**
 * Subscription tier limits
 */
export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  [SubscriptionTier.FREE]: {
    maxDebts: 2,
    maxExpenseCategories: 10,
    maxProfessionals: 1,
    maxDocuments: 5,
    maxStorageGB: 0.5,
    features: [
      'basic_diagnosis',
      'expense_tracking',
      'payment_planning',
      'professional_matching',
    ],
  },
  [SubscriptionTier.PREMIUM]: {
    maxDebts: 999,
    maxExpenseCategories: 42,
    maxProfessionals: 999,
    maxDocuments: 999,
    maxStorageGB: 10,
    features: [
      'basic_diagnosis',
      'advanced_diagnosis',
      'expense_tracking',
      'payment_planning',
      'professional_matching',
      'document_upload',
      'ocr_processing',
      'ai_summaries',
      'legal_templates',
      'priority_support',
      'export_reports',
      'api_access',
    ],
  },
};

/**
 * Pricing configuration
 */
export const PRICING = {
  monthly: {
    usd: 9.99,
    ils: 39.99,
  },
  annual: {
    usd: 99.99,
    ils: 399.99,
  },
};

/**
 * Check if user has reached debt limit
 */
export const hasReachedDebtLimit = (
  tier: SubscriptionTier,
  currentDebtCount: number
): boolean => {
  const limit = SUBSCRIPTION_LIMITS[tier].maxDebts;
  return currentDebtCount >= limit;
};

/**
 * Check if user has reached expense category limit
 */
export const hasReachedExpenseCategoryLimit = (
  tier: SubscriptionTier,
  currentCategoryCount: number
): boolean => {
  const limit = SUBSCRIPTION_LIMITS[tier].maxExpenseCategories;
  return currentCategoryCount >= limit;
};

/**
 * Check if user has feature access
 */
export const hasFeatureAccess = (
  tier: SubscriptionTier,
  feature: string
): boolean => {
  return SUBSCRIPTION_LIMITS[tier].features.includes(feature);
};

/**
 * Get available features for tier
 */
export const getAvailableFeatures = (tier: SubscriptionTier): string[] => {
  return SUBSCRIPTION_LIMITS[tier].features;
};

/**
 * Get feature comparison
 */
export const getFeatureComparison = () => {
  return {
    free: SUBSCRIPTION_LIMITS[SubscriptionTier.FREE],
    premium: SUBSCRIPTION_LIMITS[SubscriptionTier.PREMIUM],
  };
};

/**
 * Calculate subscription renewal date
 */
export const calculateRenewalDate = (
  startDate: Date,
  billingCycle: 'monthly' | 'annual'
): Date => {
  const renewal = new Date(startDate);
  if (billingCycle === 'monthly') {
    renewal.setMonth(renewal.getMonth() + 1);
  } else {
    renewal.setFullYear(renewal.getFullYear() + 1);
  }
  return renewal;
};

/**
 * Check if subscription is active
 */
export const isSubscriptionActive = (
  status: string,
  expiryDate?: Date
): boolean => {
  if (status !== 'active') return false;
  if (expiryDate && expiryDate < new Date()) return false;
  return true;
};

/**
 * Get subscription status message
 */
export const getSubscriptionStatusMessage = (
  tier: SubscriptionTier,
  daysUntilRenewal?: number
): string => {
  if (tier === SubscriptionTier.FREE) {
    return 'אתה משתמש בגרסה חינם. שדרג ל-Premium כדי לפתוח יותר תכונות.';
  }

  if (daysUntilRenewal !== undefined) {
    if (daysUntilRenewal <= 7) {
      return `המנוי שלך מתחדש בעוד ${daysUntilRenewal} ימים.`;
    }
    return `המנוי שלך פעיל. תחדוש בעוד ${daysUntilRenewal} ימים.`;
  }

  return 'המנוי שלך פעיל.';
};

/**
 * Stripe product IDs (configure in Stripe dashboard)
 */
export const STRIPE_PRODUCT_IDS = {
  premium_monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || '',
  premium_annual: process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID || '',
};

/**
 * Stripe webhook events
 */
export const STRIPE_EVENTS = {
  CUSTOMER_SUBSCRIPTION_CREATED: 'customer.subscription.created',
  CUSTOMER_SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  CUSTOMER_SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
};
