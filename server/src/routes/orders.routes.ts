import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../db/client';
import { requireAuth } from '../middleware/auth';
import { requireBusinessOwner } from '../middleware/businessAuth';

export const ordersRouter = Router();

// GET /api/orders/:businessId
ordersRouter.get(
  '/:businessId',
  requireAuth,
  requireBusinessOwner('businessId'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { businessId } = req.params;
      const { status, search, page = '1', limit = '20' } = req.query;

      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 20));
      const skip = (pageNum - 1) * limitNum;

      const where: any = { businessId };

      if (status && typeof status === 'string' && status !== 'ALL') {
        where.status = status;
      }

      if (search && typeof search === 'string') {
        where.OR = [
          { orderNumber: { contains: search } },
          { customerName: { contains: search } },
          { customerPhone: { contains: search } },
        ];
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitNum,
          include: {
            items: true,
          },
        }),
        prisma.order.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          orders,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/orders/:businessId/:orderId
ordersRouter.get(
  '/:businessId/:orderId',
  requireAuth,
  requireBusinessOwner('businessId'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { businessId, orderId } = req.params;

      const order = await prisma.order.findUnique({
        where: { id: orderId, businessId },
        include: {
          items: true,
          business: {
            select: { name: true, phone: true, whatsappNumber: true, currencySymbol: true },
          },
        },
      });

      if (!order) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
        return;
      }

      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/orders/:businessId/:orderId/status
ordersRouter.put(
  '/:businessId/:orderId/status',
  requireAuth,
  requireBusinessOwner('businessId'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { businessId, orderId } = req.params;
      const { status } = req.body;

      const validStatuses = ['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_STATUS', message: `Status must be one of: ${validStatuses.join(', ')}` },
        });
        return;
      }

      const order = await prisma.order.update({
        where: { id: orderId, businessId },
        data: { status },
        include: { items: true },
      });

      res.json({ success: true, message: `Order status updated to ${status}`, data: order });
    } catch (error) {
      next(error);
    }
  }
);
