import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import Stripe from 'stripe';

/**
 * Stripe Integration Router
 * Handles all payment and subscription operations
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export const stripeRouter = router({
  /**
   * Create checkout session for subscription
   */
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        priceId: z.string().min(1, 'Price ID required'),
        billingCycle: z.enum(['monthly', 'annual']),
        successUrl: z.string().url(),
        cancelUrl: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.user) {
          throw new Error('User not authenticated');
        }

        // Get or create Stripe customer
        let customerId = (ctx.user as any).stripeCustomerId;

        if (!customerId) {
          const customer = await stripe.customers.create({
            email: ctx.user.email || undefined,
            metadata: {
              userId: ctx.user.id.toString(),
            },
          });
          customerId = customer.id;
          // TODO: Update user with stripeCustomerId
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          payment_method_types: ['card'],
          line_items: [
            {
              price: input.priceId,
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: input.successUrl,
          cancel_url: input.cancelUrl,
          metadata: {
            userId: ctx.user.id.toString(),
            billingCycle: input.billingCycle,
          },
        });

        return {
          success: true,
          sessionId: session.id,
          url: session.url,
        };
      } catch (error) {
        throw new Error(`Failed to create checkout session: ${error}`);
      }
    }),

  /**
   * Get subscription status
   */
  getSubscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.user) {
        throw new Error('User not authenticated');
      }

      // TODO: Fetch from database
      return {
        tier: 'free',
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
      };
    } catch (error) {
      throw new Error(`Failed to get subscription status: ${error}`);
    }
  }),

  /**
   * Cancel subscription
   */
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      if (!ctx.user) {
        throw new Error('User not authenticated');
      }

      // TODO: Get stripeSubscriptionId from database
      const stripeSubscriptionId = ''; // placeholder

      if (!stripeSubscriptionId) {
        throw new Error('No active subscription found');
      }

      await stripe.subscriptions.update(stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      return {
        success: true,
        message: 'המנוי יבוטל בסוף התקופה הנוכחית',
      };
    } catch (error) {
      throw new Error(`Failed to cancel subscription: ${error}`);
    }
  }),

  /**
   * Update payment method
   */
  updatePaymentMethod: protectedProcedure
    .input(
      z.object({
        paymentMethodId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.user) {
          throw new Error('User not authenticated');
        }

        // TODO: Get stripeCustomerId from database
        const stripeCustomerId = ''; // placeholder

        if (!stripeCustomerId) {
          throw new Error('No Stripe customer found');
        }

        await stripe.paymentMethods.attach(input.paymentMethodId, {
          customer: stripeCustomerId,
        });

        await stripe.customers.update(stripeCustomerId, {
          invoice_settings: {
            default_payment_method: input.paymentMethodId,
          },
        });

        return {
          success: true,
          message: 'שיטת התשלום עודכנה בהצלחה',
        };
      } catch (error) {
        throw new Error(`Failed to update payment method: ${error}`);
      }
    }),

  /**
   * Get invoice history
   */
  getInvoiceHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        if (!ctx.user) {
          throw new Error('User not authenticated');
        }

        // TODO: Get stripeCustomerId from database
        const stripeCustomerId = ''; // placeholder

        if (!stripeCustomerId) {
          return {
            invoices: [],
            total: 0,
          };
        }

        const invoices = await stripe.invoices.list({
          customer: stripeCustomerId,
          limit: input.limit,
        });

        return {
          invoices: invoices.data.map(invoice => ({
            id: invoice.id,
            number: invoice.number,
            amount: invoice.amount_paid,
            currency: invoice.currency,
            date: new Date(invoice.created * 1000),
            status: invoice.status,
            pdfUrl: (invoice as any).pdf || null,
          })),
          total: invoices.data.length,
        };
      } catch (error) {
        throw new Error(`Failed to get invoice history: ${error}`);
      }
    }),

  /**
   * Upgrade to premium
   */
  upgradeToPremium: protectedProcedure
    .input(
      z.object({
        billingCycle: z.enum(['monthly', 'annual']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.user) {
          throw new Error('User not authenticated');
        }

        const priceId =
          input.billingCycle === 'monthly'
            ? process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID
            : process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID;

        if (!priceId) {
          throw new Error('Stripe price ID not configured');
        }

        // TODO: Create checkout session
        return {
          success: true,
          message: 'עבור לעמוד התשלום',
          checkoutUrl: '#',
        };
      } catch (error) {
        throw new Error(`Failed to upgrade to premium: ${error}`);
      }
    }),
});
