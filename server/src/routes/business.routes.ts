import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client';
import { requireAuth } from '../middleware/auth';
import { requireBusinessOwner } from '../middleware/businessAuth';
import { validateBody } from '../middleware/validate';
import { generateUniqueBusinessSlug } from '../utils/slug';
import { normalizeWhatsAppNumber } from '../utils/whatsapp';

export const businessRouter = Router();

const onboardSchema = z.object({
  name: z.string().min(2, 'Business name must be at least 2 characters'),
  category: z.string().default('Restaurant'),
  phone: z.string().min(10, 'Valid phone number is required'),
  whatsappNumber: z.string().min(10, 'Valid WhatsApp number is required'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pinCode: z.string().optional(),
  openingHoursText: z.string().optional(),
  logo: z.string().optional(),
  coverImage: z.string().optional(),
  primaryColor: z.string().default('#10b981'),
  secondaryColor: z.string().default('#065f46'),
  dietaryType: z.enum(['PURE_VEG', 'VEG_NON_VEG', 'NON_VEG']).default('VEG_NON_VEG').optional(),
  initialCategories: z
    .array(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        products: z
          .array(
            z.object({
              name: z.string().min(1),
              description: z.string().optional(),
              price: z.number().nonnegative(),
              image: z.string().optional(),
            })
          )
          .optional(),
      })
    )
    .optional(),
});

// POST /api/business/onboard (Guided onboarding wizard)
businessRouter.post(
  '/onboard',
  requireAuth,
  validateBody(onboardSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const data = req.body;

      // Validate WhatsApp number
      const phoneValidation = normalizeWhatsAppNumber(data.whatsappNumber);
      if (!phoneValidation.isValid) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_WHATSAPP_NUMBER', message: phoneValidation.error || 'Invalid WhatsApp number' },
        });
        return;
      }

      // Generate unique slug
      const slug = await generateUniqueBusinessSlug(data.name);

      // Create Business
      const business = await prisma.business.create({
        data: {
          name: data.name,
          slug,
          category: data.category,
          ownerId: userId,
          phone: data.phone,
          whatsappNumber: phoneValidation.normalized,
          email: data.email || null,
          address: data.address || null,
          city: data.city || null,
          state: data.state || null,
          pinCode: data.pinCode || null,
          openingHoursText: data.openingHoursText || '10:00 AM - 10:00 PM',
          logo: data.logo || null,
          coverImage: data.coverImage || null,
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          dietaryType: data.dietaryType || 'VEG_NON_VEG',
        },
      });

      // Create Default Business Hours (All 7 days open 10am to 10pm)
      for (let day = 0; day <= 6; day++) {
        await prisma.businessHours.create({
          data: {
            businessId: business.id,
            dayOfWeek: day,
            isOpen: true,
            openTime: '10:00',
            closeTime: '22:00',
          },
        });
      }

      // Create Initial Subscription (Pro plan trial)
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      await prisma.subscription.create({
        data: {
          businessId: business.id,
          plan: 'PRO_MONTHLY',
          status: 'ACTIVE',
          monthlyPrice: 299,
          setupFee: 1999,
          currentPeriodEnd: periodEnd,
        },
      });

      // Generate QR Code record
      await prisma.qRCode.create({
        data: {
          businessId: business.id,
          qrCodeKey: `${slug}-qr`,
          scanCount: 0,
        },
      });

      // Create initial categories & products if provided
      if (data.initialCategories && data.initialCategories.length > 0) {
        let sortOrder = 1;
        for (const catInput of data.initialCategories) {
          const category = await prisma.category.create({
            data: {
              businessId: business.id,
              name: catInput.name,
              description: catInput.description || null,
              sortOrder: sortOrder++,
            },
          });

          if (catInput.products && catInput.products.length > 0) {
            let pOrder = 1;
            for (const prodInput of catInput.products) {
              await prisma.product.create({
                data: {
                  businessId: business.id,
                  categoryId: category.id,
                  name: prodInput.name,
                  description: prodInput.description || null,
                  price: prodInput.price,
                  image: prodInput.image || null,
                  sortOrder: pOrder++,
                },
              });
            }
          }
        }
      }

      res.status(201).json({
        success: true,
        message: 'Business created and onboarded successfully!',
        data: {
          business,
          publicUrl: `/business/${slug}`,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/business/:businessId
businessRouter.get(
  '/:businessId',
  requireAuth,
  requireBusinessOwner('businessId'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { businessId } = req.params;
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        include: {
          businessHours: true,
          subscription: true,
          qrCodes: true,
          _count: {
            select: {
              products: true,
              categories: true,
              orders: true,
            },
          },
        },
      });

      if (!business) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Business not found' },
        });
        return;
      }

      res.json({
        success: true,
        data: business,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/business/:businessId
businessRouter.put(
  '/:businessId',
  requireAuth,
  requireBusinessOwner('businessId'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { businessId } = req.params;
      const {
        name,
        category,
        phone,
        email,
        address,
        city,
        state,
        pinCode,
        openingHoursText,
        isTaxEnabled,
        taxRate,
        deliveryFee,
        minOrderAmount,
        dietaryType,
        businessTypeConfig,
      } = req.body;

      const updated = await prisma.business.update({
        where: { id: businessId },
        data: {
          name,
          category,
          phone,
          dietaryType: dietaryType || undefined,
          email: email || null,
          address: address || null,
          city: city || null,
          state: state || null,
          pinCode: pinCode || null,
          openingHoursText: openingHoursText || null,
          isTaxEnabled: typeof isTaxEnabled === 'boolean' ? isTaxEnabled : undefined,
          taxRate: typeof taxRate === 'number' ? taxRate : undefined,
          deliveryFee: typeof deliveryFee === 'number' ? deliveryFee : undefined,
          minOrderAmount: typeof minOrderAmount === 'number' ? minOrderAmount : undefined,
          businessTypeConfig: businessTypeConfig ? (typeof businessTypeConfig === 'string' ? businessTypeConfig : JSON.stringify(businessTypeConfig)) : undefined,
        },
      });

      res.json({
        success: true,
        message: 'Business profile updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/business/:businessId/toggle-status
businessRouter.put(
  '/:businessId/toggle-status',
  requireAuth,
  requireBusinessOwner('businessId'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { businessId } = req.params;
      const { isStoreOpenManual } = req.body;

      const updated = await prisma.business.update({
        where: { id: businessId },
        data: {
          isStoreOpenManual: Boolean(isStoreOpenManual),
        },
        select: {
          id: true,
          name: true,
          isStoreOpenManual: true,
        },
      });

      res.json({
        success: true,
        message: `Store marked as ${updated.isStoreOpenManual ? 'OPEN' : 'CLOSED'}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/business/:businessId/hours
businessRouter.get(
  '/:businessId/hours',
  requireAuth,
  requireBusinessOwner('businessId'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { businessId } = req.params;
      const hours = await prisma.businessHours.findMany({
        where: { businessId },
        orderBy: { dayOfWeek: 'asc' },
      });

      res.json({
        success: true,
        data: hours,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/business/:businessId/hours
businessRouter.put(
  '/:businessId/hours',
  requireAuth,
  requireBusinessOwner('businessId'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { businessId } = req.params;
      const { hours } = req.body; // Array of 7 days

      if (!Array.isArray(hours)) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_INPUT', message: 'Hours array required' },
        });
        return;
      }

      for (const h of hours) {
        await prisma.businessHours.upsert({
          where: {
            businessId_dayOfWeek: {
              businessId,
              dayOfWeek: h.dayOfWeek,
            },
          },
          create: {
            businessId,
            dayOfWeek: h.dayOfWeek,
            isOpen: Boolean(h.isOpen),
            openTime: h.openTime || '10:00',
            closeTime: h.closeTime || '22:00',
            openTime2: h.openTime2 || null,
            closeTime2: h.closeTime2 || null,
          },
          update: {
            isOpen: Boolean(h.isOpen),
            openTime: h.openTime || '10:00',
            closeTime: h.closeTime || '22:00',
            openTime2: h.openTime2 || null,
            closeTime2: h.closeTime2 || null,
          },
        });
      }

      const updated = await prisma.businessHours.findMany({
        where: { businessId },
        orderBy: { dayOfWeek: 'asc' },
      });

      res.json({
        success: true,
        message: 'Business hours saved successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/business/:businessId/appearance
businessRouter.put(
  '/:businessId/appearance',
  requireAuth,
  requireBusinessOwner('businessId'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { businessId } = req.params;
      const { logo, coverImage, primaryColor, secondaryColor } = req.body;

      const updated = await prisma.business.update({
        where: { id: businessId },
        data: {
          logo: logo !== undefined ? logo : undefined,
          coverImage: coverImage !== undefined ? coverImage : undefined,
          primaryColor: primaryColor || undefined,
          secondaryColor: secondaryColor || undefined,
        },
      });

      res.json({
        success: true,
        message: 'Appearance branding updated',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/business/:businessId/whatsapp
businessRouter.put(
  '/:businessId/whatsapp',
  requireAuth,
  requireBusinessOwner('businessId'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { businessId } = req.params;
      const { whatsappNumber } = req.body;

      const validation = normalizeWhatsAppNumber(whatsappNumber);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_WHATSAPP_NUMBER', message: validation.error || 'Invalid number' },
        });
        return;
      }

      const updated = await prisma.business.update({
        where: { id: businessId },
        data: {
          whatsappNumber: validation.normalized,
        },
      });

      res.json({
        success: true,
        message: 'WhatsApp number updated & verified',
        data: {
          whatsappNumber: updated.whatsappNumber,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);
