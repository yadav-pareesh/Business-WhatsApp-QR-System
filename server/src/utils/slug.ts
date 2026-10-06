import { prisma } from '../db/client';

export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function generateUniqueBusinessSlug(name: string): Promise<string> {
  let baseSlug = createSlug(name);
  if (!baseSlug) {
    baseSlug = 'store';
  }

  let uniqueSlug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.business.findUnique({
      where: { slug: uniqueSlug },
      select: { id: true },
    });

    if (!existing) {
      return uniqueSlug;
    }

    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }
}

export function generateOrderNumber(businessSlug: string): string {
  const letters = businessSlug.replace(/[^a-zA-Z]/g, '').toUpperCase();
  const prefix = (letters.slice(0, 3) || 'ORD').padEnd(3, 'X');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `#${prefix}-${randomSuffix}`;
}
