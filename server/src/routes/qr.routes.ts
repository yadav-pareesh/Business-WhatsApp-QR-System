import { Router, Request, Response, NextFunction } from 'express';
import QRCode from 'qrcode';
import { prisma } from '../db/client';
import { config } from '../config';
import { requireAuth } from '../middleware/auth';
import { requireBusinessOwner } from '../middleware/businessAuth';

export const qrRouter = Router();

// GET /api/qr/:businessId
qrRouter.get(
  '/:businessId',
  requireAuth,
  requireBusinessOwner('businessId'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { businessId } = req.params;

      const business = await prisma.business.findUnique({
        where: { id: businessId },
        include: {
          qrCodes: true,
        },
      });

      if (!business) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Business not found' } });
        return;
      }

      // Stable public URL
      const publicUrl = `${config.frontendUrl}/business/${business.slug}`;

      // Generate PNG Data URL with high resolution
      const qrDataUrl = await QRCode.toDataURL(publicUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 600,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });

      // Generate SVG string
      const qrSvgString = await QRCode.toString(publicUrl, {
        type: 'svg',
        errorCorrectionLevel: 'H',
        margin: 2,
      });

      const qrRecord = business.qrCodes[0] || null;

      res.json({
        success: true,
        data: {
          businessName: business.name,
          slug: business.slug,
          publicUrl,
          qrDataUrl,
          qrSvgString,
          scanCount: qrRecord ? qrRecord.scanCount : 0,
          createdAt: qrRecord ? qrRecord.createdAt : business.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);
