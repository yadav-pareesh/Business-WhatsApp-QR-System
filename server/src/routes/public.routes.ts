import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client';
import { isStoreCurrentlyOpen } from '../services/businessHours';
import { calculateAuthoritativeOrder } from '../services/pricing';
import { buildWhatsAppOrderMessage, generateWhatsAppDeepLink } from '../utils/whatsapp';
import { generateOrderNumber } from '../utils/slug';
import { orderLimiter, publicApiLimiter } from '../middleware/rateLimit';
import { validateBody } from '../middleware/validate';

export const publicRouter = Router();

// GET /api/public/store/:slug (Public Storefront for customers scanning QR)
publicRouter.get(
  '/store/:slug',
  publicApiLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params;
      const { from } = req.query; // 'qr' if scanned from physical QR

      const business = await prisma.business.findUnique({
        where: { slug },
        include: {
          businessHours: true,
          categories: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            include: {
              products: {
                where: { isAvailable: true },
                orderBy: { sortOrder: 'asc' },
                include: {
                  variantGroups: {
                    include: {
                      options: {
                        where: { isAvailable: true },
                      },
                    },
                  },
                  addons: {
                    where: { isAvailable: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!business) {
        res.status(404).json({
          success: false,
          error: { code: 'STORE_NOT_FOUND', message: 'The requested store catalog does not exist or has been removed.' },
        });
        return;
      }

      // Check open/closed status
      const storeStatus = isStoreCurrentlyOpen(business.isStoreOpenManual, business.businessHours);

      // Track analytics event in background
      try {
        if (from === 'qr') {
          await prisma.analyticsEvent.create({
            data: { businessId: business.id, eventType: 'QR_SCAN' },
          });
          await prisma.qRCode.updateMany({
            where: { businessId: business.id },
            data: { scanCount: { increment: 1 } },
          });
        }
        await prisma.analyticsEvent.create({
          data: { businessId: business.id, eventType: 'PAGE_VIEW' },
        });
      } catch (err) {
        // Non-blocking analytics logging
      }

      res.json({
        success: true,
        data: {
          business: {
            id: business.id,
            name: business.name,
            slug: business.slug,
            category: business.category,
            phone: business.phone,
            whatsappNumber: business.whatsappNumber,
            address: business.address,
            city: business.city,
            state: business.state,
            pinCode: business.pinCode,
            openingHoursText: business.openingHoursText,
            logo: business.logo,
            coverImage: business.coverImage,
            primaryColor: business.primaryColor,
            secondaryColor: business.secondaryColor,
            currency: business.currency,
            currencySymbol: business.currencySymbol,
            isTaxEnabled: business.isTaxEnabled,
            taxRate: business.taxRate,
            deliveryFee: business.deliveryFee,
            minOrderAmount: business.minOrderAmount,
            dietaryType: business.dietaryType || 'VEG_NON_VEG',
            businessTypeConfig: business.businessTypeConfig ? JSON.parse(business.businessTypeConfig) : null,
          },
          storeStatus,
          categories: business.categories,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Order creation schema
const publicOrderSchema = z.object({
  businessSlug: z.string().min(1),
  customerName: z.string().min(1, 'Name is required').trim(),
  customerPhone: z.string().optional(),
  tableNumber: z.string().optional(),
  deliveryAddress: z.string().optional(),
  customerNotes: z.string().optional(),
  customFields: z.record(z.string()).optional(),
  isDelivery: z.boolean().default(false),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive('Quantity must be greater than zero'),
        selectedVariantOptionIds: z.array(z.string()).optional(),
        selectedAddonIds: z.array(z.string()).optional(),
      })
    )
    .min(1, 'Cart cannot be empty'),
});

// POST /api/public/order (Authoritative Order Validation & WhatsApp Generation)
publicRouter.post(
  '/order',
  orderLimiter,
  validateBody(publicOrderSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        businessSlug,
        customerName,
        customerPhone,
        tableNumber,
        deliveryAddress,
        customerNotes,
        customFields,
        isDelivery,
        items,
      } = req.body;

      // 1. Fetch business
      const business = await prisma.business.findUnique({
        where: { slug: businessSlug },
        include: { businessHours: true },
      });

      if (!business) {
        res.status(404).json({
          success: false,
          error: { code: 'STORE_NOT_FOUND', message: 'Business store not found.' },
        });
        return;
      }

      // 2. Verify business is open
      const storeStatus = isStoreCurrentlyOpen(business.isStoreOpenManual, business.businessHours);
      if (!storeStatus.isOpen) {
        res.status(400).json({
          success: false,
          error: {
            code: 'STORE_CLOSED',
            message: `This store is currently closed. ${storeStatus.reason}`,
          },
        });
        return;
      }

      // 3. Authoritative server calculation of prices (Never trust browser totals!)
      const calculation = await calculateAuthoritativeOrder(business.id, items, isDelivery);
      if (!calculation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ORDER',
            message: calculation.error || 'Invalid items in cart.',
          },
        });
        return;
      }

      // 4. Generate human-friendly order number (#ABC-1024)
      const orderNumber = generateOrderNumber(business.slug);

      // 5. Build structured WhatsApp message
      const messageItems = calculation.items.map((item) => ({
        name: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        variantsText: item.selectedVariants.map((v) => v.optionName).join(', '),
        addonsText: item.selectedAddons.map((a) => a.name).join(', '),
      }));

      const whatsappMessage = buildWhatsAppOrderMessage({
        businessName: business.name,
        orderNumber,
        items: messageItems,
        currencySymbol: business.currencySymbol,
        subtotal: calculation.subtotal,
        taxAmount: calculation.taxAmount,
        taxRate: calculation.taxRate,
        deliveryFee: calculation.deliveryFee,
        totalAmount: calculation.totalAmount,
        customerName,
        customerPhone,
        tableNumber,
        deliveryAddress,
        customerNotes,
        customFields,
      });

      const whatsappDeepLink = generateWhatsAppDeepLink(business.whatsappNumber, whatsappMessage);

      // 6. Persist order record in database
      const order = await prisma.order.create({
        data: {
          businessId: business.id,
          orderNumber,
          customerName,
          customerPhone: customerPhone || null,
          tableNumber: tableNumber || null,
          deliveryAddress: deliveryAddress || null,
          customerNotes: customerNotes || null,
          customFields: customFields ? JSON.stringify(customFields) : null,
          subtotal: calculation.subtotal,
          taxAmount: calculation.taxAmount,
          deliveryFee: calculation.deliveryFee,
          totalAmount: calculation.totalAmount,
          status: 'NEW',
          whatsappMessage,
          items: {
            create: calculation.items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              totalPrice: item.totalPrice,
              selectedVariants: item.selectedVariants.length > 0 ? JSON.stringify(item.selectedVariants) : null,
              selectedAddons: item.selectedAddons.length > 0 ? JSON.stringify(item.selectedAddons) : null,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // 7. Record analytics event
      try {
        await prisma.analyticsEvent.create({
          data: {
            businessId: business.id,
            eventType: 'ORDER_INITIATED',
            metadata: JSON.stringify({ orderId: order.id, totalAmount: calculation.totalAmount }),
          },
        });
      } catch (err) {
        // Non-blocking
      }

      res.status(201).json({
        success: true,
        message: 'Order created successfully. Opening WhatsApp...',
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          whatsappDeepLink,
          whatsappMessage,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/public/analytics-event
publicRouter.post(
  '/analytics-event',
  publicApiLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { businessSlug, eventType, metadata } = req.body;

      if (!businessSlug || !eventType) {
        res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Missing parameters' } });
        return;
      }

      const business = await prisma.business.findUnique({
        where: { slug: businessSlug },
        select: { id: true },
      });

      if (business) {
        await prisma.analyticsEvent.create({
          data: {
            businessId: business.id,
            eventType,
            metadata: metadata ? JSON.stringify(metadata) : null,
          },
        });
      }

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);
