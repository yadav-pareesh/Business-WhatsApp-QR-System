import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/client';

export function requireBusinessOwner(paramName = 'businessId') {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
      });
      return;
    }

    const businessId =
      req.params[paramName] ||
      (req.query[paramName] as string) ||
      req.body[paramName] ||
      req.headers['x-business-id'];

    if (!businessId) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_BUSINESS_ID', message: 'Business identifier is required.' },
      });
      return;
    }

    try {
      const business = await prisma.business.findUnique({
        where: { id: String(businessId) },
        select: { id: true, ownerId: true },
      });

      if (!business) {
        res.status(404).json({
          success: false,
          error: { code: 'BUSINESS_NOT_FOUND', message: 'Business not found.' },
        });
        return;
      }

      if (business.ownerId !== req.user.userId && req.user.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You do not have permission to manage this business.' },
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
