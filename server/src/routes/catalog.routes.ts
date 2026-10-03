import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client';
import { requireAuth } from '../middleware/auth';
import { requireBusinessOwner } from '../middleware/businessAuth';
import { validateBody } from '../middleware/validate';

export const catalogRouter = Router();

// ==========================================
// CATEGORIES ROUTES
// ==========================================

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').trim(),
  description: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

// GET /api/catalog/:businessId/categories
catalogRouter.get(
  '/:businessId/categories',
  requireAuth,
  requireBusinessOwner('businessId'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { businessId } = req.params;
      const categories = await prisma.category.findMany({
        where: { businessId },
        orderBy: { sortOrder: 'asc' },
        include: {
          _count: {
            select: { products: true },
          },
        },
      });

      res.json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/catalog/:businessId/categories
catalogRouter.post(
  '/:businessId/categories',
  requireAuth,
  requireBusinessOwner('businessId'),
  validateBody(categorySchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { businessId } = req.params;
      const { name, description, sortOrder, isActive } = req.body;

      const category = await prisma.category.create({
        data: {
          businessId,
          name,
          description: description || null,
          sortOrder,
          isActive,
        },
      });

      res.status(201).json({ success: true, message: 'Category created', data: category });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/catalog/:businessId/categories/:categoryId
catalogRouter.put(
  '/:businessId/categories/:categoryId',
  requireAuth,
  requireBusinessOwner('businessId'),
  validateBody(categorySchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { businessId, categoryId } = req.params;
      const { name, description, sortOrder, isActive } = req.body;

      const category = await prisma.category.update({
        where: { id: categoryId, businessId },
        data: {
          name,
          description: description || null,
          sortOrder,
          isActive,
        },
      });

      res.json({ success: true, message: 'Category updated', data: category });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/catalog/:businessId/categories/:categoryId
catalogRouter.delete(
  '/:businessId/categories/:categoryId',
  requireAuth,
  requireBusinessOwner('businessId'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { businessId, categoryId } = req.params;

      await prisma.category.delete({
        where: { id: categoryId, businessId },
      });

      res.json({ success: true, message: 'Category deleted' });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/catalog/:businessId/categories-reorder
catalogRouter.put(
  '/:businessId/categories-reorder',
  requireAuth,
  requireBusinessOwner('businessId'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { businessId } = req.params;
      const { orderedIds } = req.body; // Array of IDs in order

      if (Array.isArray(orderedIds)) {
        for (let i = 0; i < orderedIds.length; i++) {
          await prisma.category.update({
            where: { id: orderedIds[i], businessId },
            data: { sortOrder: i + 1 },
          });
        }
      }

      res.json({ success: true, message: 'Categories reordered' });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// PRODUCTS ROUTES
// ==========================================

const productSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  name: z.string().min(1, 'Product name is required').trim(),
  description: z.string().optional(),
  price: z.number().nonnegative('Price cannot be negative'),
  compareAtPrice: z.number().nonnegative().optional().nullable(),
  image: z.string().optional().nullable(),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  foodType: z.enum(['VEG', 'NON_VEG', 'EGG']).default('VEG').optional(),
  sortOrder: z.number().int().default(0),
  metadata: z.any().optional(), // tags, foodType (veg/nonveg)
  variantGroups: z
    .array(
      z.object({
        name: z.string().min(1),
        required: z.boolean().default(true),
        options: z.array(
          z.object({
            name: z.string().min(1),
            priceModifier: z.number().default(0),
            isAvailable: z.boolean().default(true),
          })
        ),
      })
    )
    .optional(),
  addons: z
    .array(
      z.object({
        name: z.string().min(1),
        price: z.number().nonnegative().default(0),
        isAvailable: z.boolean().default(true),
      })
    )
    .optional(),
});

// GET /api/catalog/:businessId/products
catalogRouter.get(
  '/:businessId/products',
  requireAuth,
  requireBusinessOwner('businessId'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { businessId } = req.params;
      const { categoryId, search } = req.query;

      const where: any = { businessId };
      if (categoryId && typeof categoryId === 'string') {
        where.categoryId = categoryId;
      }
      if (search && typeof search === 'string') {
        where.name = { contains: search };
      }

      const products = await prisma.product.findMany({
        where,
        orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
        include: {
          category: {
            select: { id: true, name: true },
          },
          variantGroups: {
            include: { options: true },
          },
          addons: true,
        },
      });

      res.json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/catalog/:businessId/products
catalogRouter.post(
  '/:businessId/products',
  requireAuth,
  requireBusinessOwner('businessId'),
  validateBody(productSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { businessId } = req.params;
      const data = req.body;

      // Verify category belongs to this business
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId, businessId },
      });

      if (!category) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_CATEGORY', message: 'Category not found in this business' },
        });
        return;
      }

      const product = await prisma.product.create({
        data: {
          businessId,
          categoryId: data.categoryId,
          name: data.name,
          description: data.description || null,
          price: data.price,
          compareAtPrice: data.compareAtPrice ?? null,
          image: data.image || null,
          isAvailable: data.isAvailable,
          isFeatured: data.isFeatured,
          foodType: data.foodType || 'VEG',
          sortOrder: data.sortOrder,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        },
      });

      // Create Variant Groups & Options
      if (data.variantGroups && data.variantGroups.length > 0) {
        for (const vg of data.variantGroups) {
          const group = await prisma.productVariantGroup.create({
            data: {
              productId: product.id,
              name: vg.name,
              required: vg.required,
            },
          });

          if (vg.options && vg.options.length > 0) {
            await prisma.productVariantOption.createMany({
              data: vg.options.map((opt: any) => ({
                variantGroupId: group.id,
                name: opt.name,
                priceModifier: opt.priceModifier || 0,
                isAvailable: opt.isAvailable ?? true,
              })),
            });
          }
        }
      }

      // Create Addons
      if (data.addons && data.addons.length > 0) {
        await prisma.productAddon.createMany({
          data: data.addons.map((addon: any) => ({
            productId: product.id,
            name: addon.name,
            price: addon.price || 0,
            isAvailable: addon.isAvailable ?? true,
          })),
        });
      }

      const fullProduct = await prisma.product.findUnique({
        where: { id: product.id },
        include: {
          category: true,
          variantGroups: { include: { options: true } },
          addons: true,
        },
      });

      res.status(201).json({ success: true, message: 'Product created', data: fullProduct });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/catalog/:businessId/products/:productId
catalogRouter.put(
  '/:businessId/products/:productId',
  requireAuth,
  requireBusinessOwner('businessId'),
  validateBody(productSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { businessId, productId } = req.params;
      const data = req.body;

      const product = await prisma.product.update({
        where: { id: productId, businessId },
        data: {
          categoryId: data.categoryId,
          name: data.name,
          description: data.description || null,
          price: data.price,
          compareAtPrice: data.compareAtPrice ?? null,
          image: data.image || null,
          isAvailable: data.isAvailable,
          isFeatured: data.isFeatured,
          foodType: data.foodType || 'VEG',
          sortOrder: data.sortOrder,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        },
      });

      // Clean existing variants & addons to replace with new state
      await prisma.productVariantOption.deleteMany({
        where: { variantGroup: { productId: product.id } },
      });
      await prisma.productVariantGroup.deleteMany({
        where: { productId: product.id },
      });
      await prisma.productAddon.deleteMany({
        where: { productId: product.id },
      });

      // Re-create variants
      if (data.variantGroups && data.variantGroups.length > 0) {
        for (const vg of data.variantGroups) {
          const group = await prisma.productVariantGroup.create({
            data: {
              productId: product.id,
              name: vg.name,
              required: vg.required,
            },
          });

          if (vg.options && vg.options.length > 0) {
            await prisma.productVariantOption.createMany({
              data: vg.options.map((opt: any) => ({
                variantGroupId: group.id,
                name: opt.name,
                priceModifier: opt.priceModifier || 0,
                isAvailable: opt.isAvailable ?? true,
              })),
            });
          }
        }
      }

      // Re-create addons
      if (data.addons && data.addons.length > 0) {
        await prisma.productAddon.createMany({
          data: data.addons.map((addon: any) => ({
            productId: product.id,
            name: addon.name,
            price: addon.price || 0,
            isAvailable: addon.isAvailable ?? true,
          })),
        });
      }

      const fullProduct = await prisma.product.findUnique({
        where: { id: product.id },
        include: {
          category: true,
          variantGroups: { include: { options: true } },
          addons: true,
        },
      });

      res.json({ success: true, message: 'Product updated', data: fullProduct });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/catalog/:businessId/products/:productId
catalogRouter.delete(
  '/:businessId/products/:productId',
  requireAuth,
  requireBusinessOwner('businessId'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { businessId, productId } = req.params;

      await prisma.product.delete({
        where: { id: productId, businessId },
      });

      res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/catalog/:businessId/products/:productId/duplicate
catalogRouter.post(
  '/:businessId/products/:productId/duplicate',
  requireAuth,
  requireBusinessOwner('businessId'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { businessId, productId } = req.params;

      const original = await prisma.product.findUnique({
        where: { id: productId, businessId },
        include: {
          variantGroups: { include: { options: true } },
          addons: true,
        },
      });

      if (!original) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
        return;
      }

      const copy = await prisma.product.create({
        data: {
          businessId,
          categoryId: original.categoryId,
          name: `${original.name} (Copy)`,
          description: original.description,
          price: original.price,
          compareAtPrice: original.compareAtPrice,
          image: original.image,
          isAvailable: original.isAvailable,
          isFeatured: false,
          foodType: original.foodType,
          sortOrder: original.sortOrder + 1,
          metadata: original.metadata,
        },
      });

      // Duplicate variant groups & options
      for (const vg of original.variantGroups) {
        const newVg = await prisma.productVariantGroup.create({
          data: {
            productId: copy.id,
            name: vg.name,
            required: vg.required,
          },
        });

        if (vg.options.length > 0) {
          await prisma.productVariantOption.createMany({
            data: vg.options.map((opt) => ({
              variantGroupId: newVg.id,
              name: opt.name,
              priceModifier: opt.priceModifier,
              isAvailable: opt.isAvailable,
            })),
          });
        }
      }

      // Duplicate addons
      if (original.addons.length > 0) {
        await prisma.productAddon.createMany({
          data: original.addons.map((a) => ({
            productId: copy.id,
            name: a.name,
            price: a.price,
            isAvailable: a.isAvailable,
          })),
        });
      }

      res.status(201).json({ success: true, message: 'Product duplicated', data: copy });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/catalog/:businessId/products/:productId/toggle-availability
catalogRouter.put(
  '/:businessId/products/:productId/toggle-availability',
  requireAuth,
  requireBusinessOwner('businessId'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { businessId, productId } = req.params;
      const { isAvailable } = req.body;

      const product = await prisma.product.update({
        where: { id: productId, businessId },
        data: { isAvailable: Boolean(isAvailable) },
      });

      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/catalog/:businessId/products-bulk-toggle
catalogRouter.put(
  '/:businessId/products-bulk-toggle',
  requireAuth,
  requireBusinessOwner('businessId'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { businessId } = req.params;
      const { productIds, isAvailable } = req.body;

      if (!Array.isArray(productIds)) {
        res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'productIds array required' } });
        return;
      }

      await prisma.product.updateMany({
        where: { id: { in: productIds }, businessId },
        data: { isAvailable: Boolean(isAvailable) },
      });

      res.json({ success: true, message: `Updated availability for ${productIds.length} products` });
    } catch (error) {
      next(error);
    }
  }
);
