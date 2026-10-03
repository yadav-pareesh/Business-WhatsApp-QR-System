import { describe, it, expect } from 'vitest';
import { getStripeStatus, createTestStripeCustomer, createStripeCheckoutSession } from '../src/services/stripe.service';

describe('Stripe Service Tests', () => {
  it('correctly reads Stripe status and identifies test mode', () => {
    const status = getStripeStatus();
    expect(status.isConfigured).toBe(true);
    expect(status.isTestMode).toBe(true);
    expect(status.maskedKey).toContain('sk_test_');
  });

  it('creates test Stripe customer with pm_card_visa', async () => {
    const customer = await createTestStripeCustomer({
      email: 'test.merchant@example.com',
      name: 'Test Merchant',
    });

    expect(customer.id).toMatch(/^cus_/);
    expect(customer.email).toBe('test.merchant@example.com');
    expect(customer.invoice_settings.default_payment_method).toBeDefined();
    expect(customer.livemode).toBe(false);
  }, 15000);

  it('creates a Stripe checkout session for Pro Monthly plan', async () => {
    const session = await createStripeCheckoutSession({
      businessId: 'test-biz-123',
      businessName: 'Spice Villa',
      customerEmail: 'owner@spicevilla.com',
      plan: 'PRO_MONTHLY',
      successUrl: 'http://localhost:5173/dashboard/billing?success=true',
      cancelUrl: 'http://localhost:5173/dashboard/billing?cancelled=true',
    });

    expect(session.id).toMatch(/^cs_test_/);
    expect(session.url).toBeDefined();
    expect(session.mode).toBe('subscription');
  }, 15000);
});
