import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../db/client';
import { requireAuth } from '../middleware/auth';
import { requireBusinessOwner } from '../middleware/businessAuth';
import {
  createTestStripeCustomer,
  createStripeCheckoutSession,
  getStripeStatus,
} from '../services/stripe.service';

export const billingRouter = Router();

// GET /api/billing/stripe/status
billingRouter.get(
  '/stripe/status',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const status = getStripeStatus();
      res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/billing/stripe/test-customer
// Testing Stripe customer creation matching user provided test logic
billingRouter.post(
  '/stripe/test-customer',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, name, paymentMethod } = req.body;
      const customer = await createTestStripeCustomer({
        email: email || req.user?.email || 'jenny.rosen@example.com',
        name: name || undefined,
        paymentMethod: paymentMethod || 'pm_card_visa',
      });

      res.json({
        success: true,
        message: 'Stripe test customer created successfully!',
        data: {
          id: customer.id,
          object: customer.object,
          email: customer.email,
          name: customer.name,
          defaultPaymentMethod: customer.invoice_settings.default_payment_method,
          livemode: customer.livemode,
          created: customer.created,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'STRIPE_ERROR',
          message: error.message || 'Failed to interact with Stripe API',
        },
      });
    }
  }
);

// POST /api/billing/:businessId/stripe/checkout-session
billingRouter.post(
  '/:businessId/stripe/checkout-session',
  requireAuth,
  requireBusinessOwner('businessId'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { businessId } = req.params;
      const { plan } = req.body; // 'PRO_MONTHLY' or 'PRO_YEARLY'

      const business = await prisma.business.findUnique({
        where: { id: businessId },
        include: { owner: true },
      });

      if (!business) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Business not found' },
        });
        return;
      }

      const frontendUrl =
        process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:5173';
      const successUrl = `${frontendUrl}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}&success=true`;
      const cancelUrl = `${frontendUrl}/dashboard/billing?cancelled=true`;

      const session = await createStripeCheckoutSession({
        businessId: business.id,
        businessName: business.name,
        customerEmail: business.email || business.owner.email,
        plan: plan === 'PRO_YEARLY' ? 'PRO_YEARLY' : 'PRO_MONTHLY',
        successUrl,
        cancelUrl,
      });

      res.json({
        success: true,
        data: {
          sessionId: session.id,
          url: session.url,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'STRIPE_CHECKOUT_ERROR',
          message: error.message || 'Failed to generate Stripe checkout session',
        },
      });
    }
  }
);

// GET /api/billing/:businessId
billingRouter.get(
  '/:businessId',
  requireAuth,
  requireBusinessOwner('businessId'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { businessId } = req.params;

      const subscription = await prisma.subscription.findUnique({
        where: { businessId },
      });

      const stripeStatus = getStripeStatus();

      const planDetails = {
        name: 'Pro WhatsApp Ordering',
        setupFee: 1999,
        monthlyPrice: 299,
        currency: '₹',
        billingCycle: 'Monthly',
        status: subscription ? subscription.status : 'ACTIVE',
        renewalDate: subscription ? subscription.currentPeriodEnd : new Date(),
        stripe: stripeStatus,
        features: [
          'Unlimited QR Scans',
          'Unlimited WhatsApp Orders',
          'Zero Commission on Orders',
          'Full Product & Category Catalog',
          'Custom Variants & Add-ons',
          'Print-Ready QR Designer (Table, Counter, A4)',
          'Business Hours & Manual Open/Closed Toggle',
          'Sales & Conversion Analytics',
          'Custom Brand Colors & Logo',
        ],
        invoices: [
          {
            id: 'INV-2026-001',
            date: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0],
            amount: 1999,
            description: 'One-time SaaS Onboarding & Digital Menu Setup',
            status: 'PAID',
          },
          {
            id: 'INV-2026-002',
            date: new Date().toISOString().split('T')[0],
            amount: 299,
            description: 'Monthly Cloud Hosting & WhatsApp QR Service',
            status: 'PAID',
          },
        ],
      };

      res.json({
        success: true,
        data: planDetails,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/billing/:businessId/change-plan
billingRouter.post(
  '/:businessId/change-plan',
  requireAuth,
  requireBusinessOwner('businessId'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { businessId } = req.params;
      const { plan } = req.body; // e.g. PRO_YEARLY (with 2 months free ₹2,990/yr)

      const nextPeriod = new Date();
      if (plan === 'PRO_YEARLY') {
        nextPeriod.setFullYear(nextPeriod.getFullYear() + 1);
      } else {
        nextPeriod.setMonth(nextPeriod.getMonth() + 1);
      }

      const updated = await prisma.subscription.update({
        where: { businessId },
        data: {
          plan: plan || 'PRO_MONTHLY',
          status: 'ACTIVE',
          currentPeriodEnd: nextPeriod,
        },
      });

      res.json({
        success: true,
        message: 'Subscription plan updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

