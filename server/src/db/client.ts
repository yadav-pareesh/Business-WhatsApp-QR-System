import '../config';
import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.PRISMA_DATABASE_URL;

function createPrismaClient(): PrismaClient {
  const isProduction = process.env.NODE_ENV === 'production';

  return new PrismaClient({
    ...(dbUrl ? { datasourceUrl: dbUrl } : {}),
    log: isProduction ? ['error'] : ['warn', 'error'],
  });
}

// Reuse PrismaClient across hot reloads in development and across warm serverless invocations
export const prisma: PrismaClient = globalThis.prismaGlobal ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

