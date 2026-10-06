import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: AppError | ZodError | Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message,
        details: process.env.NODE_ENV !== 'production' ? err.errors : undefined,
      },
    });
    return;
  }

  // Handle Prisma Known Request Errors
  const prismaCode = (err as any).code;
  if (prismaCode === 'P2002') {
    res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: 'A record with this unique value already exists.',
      },
    });
    return;
  }
  if (prismaCode === 'P2025') {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'The requested record was not found.',
      },
    });
    return;
  }

  // Handle custom AppError
  const statusCode = (err as AppError).statusCode || 500;
  const code = (err as AppError).code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred';

  // Always log server errors (Vercel captures these in Logs)
  if (statusCode >= 500) {
    console.error(`[ERROR] ${req.method} ${req.path}:`, err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: statusCode >= 500 && process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred. Please try again later.'
        : message,
    },
  });
}
