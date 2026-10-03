import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../db/client';
import { requireAuth } from '../middleware/auth';
import { requireBusinessOwner } from '../middleware/businessAuth';

export const analyticsRouter = Router();

// GET /api/analytics/:businessId
analyticsRouter.get(
  '/:businessId',
  requireAuth,
  requireBusinessOwner('businessId'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { businessId } = req.params;

      // Group analytics events by type
      const eventCounts = await prisma.analyticsEvent.groupBy({
        by: ['eventType'],
        where: { businessId },
        _count: { _all: true },
      });

      const metrics: Record<string, number> = {
        QR_SCAN: 0,
        PAGE_VIEW: 0,
        PRODUCT_VIEW: 0,
        ADD_TO_CART: 0,
        ORDER_INITIATED: 0,
      };

      for (const item of eventCounts) {
        metrics[item.eventType] = item._count._all;
      }

      // QR scan count from QR record
      const qrRecord = await prisma.qRCode.findFirst({
        where: { businessId },
      });
      if (qrRecord) {
        metrics.QR_SCAN = Math.max(metrics.QR_SCAN, qrRecord.scanCount);
      }

      // Order counts and revenue
      const totalOrdersCount = await prisma.order.count({
        where: { businessId },
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayOrders = await prisma.order.findMany({
        where: {
          businessId,
          createdAt: { gte: today },
        },
        select: { totalAmount: true },
      });

      const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

      // Top selling items
      const topItems = await prisma.orderItem.groupBy({
        by: ['productName'],
        where: { order: { businessId } },
        _sum: { quantity: true, totalPrice: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      });

      // Calculate conversion rate: (orders / page views) * 100
      const totalVisits = metrics.PAGE_VIEW || metrics.QR_SCAN || 1;
      const conversionRate = totalOrdersCount > 0 ? ((totalOrdersCount / totalVisits) * 100).toFixed(1) : '0.0';

      res.json({
        success: true,
        data: {
          qrScans: metrics.QR_SCAN,
          pageViews: metrics.PAGE_VIEW,
          productViews: metrics.PRODUCT_VIEW,
          addToCartCount: metrics.ADD_TO_CART,
          ordersInitiated: metrics.ORDER_INITIATED,
          totalOrders: totalOrdersCount,
          todayOrdersCount: todayOrders.length,
          todayRevenue,
          conversionRate: `${conversionRate}%`,
          topItems: topItems.map((item) => ({
            name: item.productName,
            totalQuantity: item._sum.quantity || 0,
            totalRevenue: item._sum.totalPrice || 0,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);
