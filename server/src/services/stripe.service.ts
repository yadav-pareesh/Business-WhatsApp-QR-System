import Stripe from 'stripe';
import { config } from '../config';

const getStripeSecretKey = () => config.stripeSecretKey || process.env.STRIPE_SECRET_KEY || '';

export const getStripeClient = (): Stripe => {
  const key = getStripeSecretKey();
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured in environment variables');
  }
  return new Stripe(key, {
    typescript: true,
  });
};

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const client = getStripeClient();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

/**
 * Test Stripe customer creation using the user's provided test implementation:
 * Creates a customer with email, attached payment_method (pm_card_visa), and default invoice payment method.
 */
export const createTestStripeCustomer = async (params?: {
  email?: string;
  name?: string;
  paymentMethod?: string;
}) => {
  const email = params?.email || 'jenny.rosen@example.com';
  const paymentMethod = params?.paymentMethod || 'pm_card_visa';

  const customer = await stripe.customers.create({
    email,
    name: params?.name || 'Jenny Rosen (Test Merchant)',
    payment_method: paymentMethod,
    invoice_settings: {
      default_payment_method: paymentMethod,
    },
    metadata: {
      source: 'business_whatsapp_qr_testing',
      createdAt: new Date().toISOString(),
    },
  });

  return customer;
};

/**
 * Create a Stripe Checkout Session for SaaS subscription plans (Monthly or Annual)
 */
export const createStripeCheckoutSession = async (params: {
  businessId: string;
  businessName: string;
  customerEmail: string;
  plan: 'PRO_MONTHLY' | 'PRO_YEARLY';
  successUrl: string;
  cancelUrl: string;
}) => {
  const isYearly = params.plan === 'PRO_YEARLY';
  // INR in smallest currency unit (paise: ₹299 = 29900 paise, ₹2,990 = 299000 paise)
  const unitAmount = isYearly ? 299000 : 29900;
  const interval = isYearly ? 'year' : 'month';

  const session = await stripe.checkout.sessions.create({
    customer_email: params.customerEmail,
    line_items: [
      {
        price_data: {
          currency: 'inr',
          product_data: {
            name: `${params.businessName} - ${
              isYearly ? 'Pro Annual (2 Months Free)' : 'Pro Monthly'
            }`,
            description:
              'Unlimited QR Scans, WhatsApp Digital Menu & Direct Ordering SaaS',
          },
          unit_amount: unitAmount,
          recurring: {
            interval: interval as 'year' | 'month',
          },
        },
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      businessId: params.businessId,
      plan: params.plan,
    },
  });

  return session;
};

/**
 * Returns the active Stripe configuration status
 */
export const getStripeStatus = () => {
  const key = getStripeSecretKey();
  const isConfigured = Boolean(key);
  const isTestMode = key.startsWith('sk_test_');
  const maskedKey = key
    ? `${key.slice(0, 10)}...${key.slice(-6)}`
    : 'Not Configured';

  return {
    isConfigured,
    isTestMode,
    maskedKey,
  };
};
