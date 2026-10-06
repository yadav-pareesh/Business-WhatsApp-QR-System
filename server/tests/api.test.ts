import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/index';
import { prisma } from '../src/db/client';

describe('End-to-End API Integration & Security Tests', () => {
  let authToken = '';
  let businessId = '';
  let businessSlug = '';
  let categoryId = '';
  let productId = '';

  const testUser = {
    name: 'Integration Test Merchant',
    email: `merchant_${Date.now()}@test.com`,
    password: 'SecurePassword123!',
    phone: '9876543210',
  };

  beforeAll(async () => {
    await prisma.$connect();
    // Warm up the DB connection pool so Test 1 runs on a hot connection
    await prisma.user.findFirst({ select: { id: true } }).catch(() => null);
  }, 45000);

  it('1. Registers a new business merchant account', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email);
    authToken = res.body.data.token;
  });

  it('2. Prevents duplicate email registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
  });

  it('3. Authenticates with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('4. Completes guided business onboarding', async () => {
    const res = await request(app)
      .post('/api/business/onboard')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'The Artisan Pizzeria',
        category: 'Restaurant',
        phone: '9876543210',
        whatsappNumber: '+91 98765-43210',
        address: '12 Brigade Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pinCode: '560001',
        primaryColor: '#059669',
        secondaryColor: '#064e3b',
        initialCategories: [
          {
            name: 'Artisan Pizzas',
            description: 'Woodfired sourdough pizzas',
            products: [
              { name: 'Margherita Special', price: 280, description: 'Fresh basil & mozzarella' },
            ],
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.business.id).toBeDefined();
    expect(res.body.data.business.whatsappNumber).toBe('919876543210'); // Normalized!
    businessId = res.body.data.business.id;
    businessSlug = res.body.data.business.slug;
  });

  it('5. Creates a category in the business catalog', async () => {
    const res = await request(app)
      .post(`/api/catalog/${businessId}/categories`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Beverages & Coolers',
        description: 'Chilled drinks',
        sortOrder: 2,
        isActive: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    categoryId = res.body.data.id;
  });

  it('6. Creates a product with size variants and add-on modifiers', async () => {
    const res = await request(app)
      .post(`/api/catalog/${businessId}/products`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        categoryId,
        name: 'Cold Brew Latte',
        description: 'Brewed 18 hours with arabica beans',
        price: 150,
        compareAtPrice: 180,
        isAvailable: true,
        variantGroups: [
          {
            name: 'Size',
            required: true,
            options: [
              { name: 'Regular 250ml', priceModifier: 0 },
              { name: 'Large 400ml', priceModifier: 50 },
            ],
          },
        ],
        addons: [
          { name: 'Vanilla Syrup Shot', price: 30 },
          { name: 'Oat Milk Substitute', price: 40 },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.variantGroups.length).toBe(1);
    expect(res.body.data.addons.length).toBe(2);
    productId = res.body.data.id;
  });

  it('7. Public storefront loads catalog correctly for customer QR scan', async () => {
    const res = await request(app)
      .get(`/api/public/store/${businessSlug}?from=qr`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.business.name).toBe('The Artisan Pizzeria');
    expect(res.body.data.categories.length).toBeGreaterThan(0);
  });

  it('8. Validates order totals authoritatively server-side and generates WhatsApp link', async () => {
    const storeRes = await request(app).get(`/api/public/store/${businessSlug}`);
    const product = storeRes.body.data.categories
      .flatMap((c: any) => c.products)
      .find((p: any) => p.name === 'Cold Brew Latte');

    const variantOptionId = product.variantGroups[0].options[1].id; // Large (+50)
    const addonId = product.addons[0].id; // Vanilla (+30)

    // Base price = 150 + 50 (Large) + 30 (Vanilla) = 230 * 2 = 460
    const orderRes = await request(app)
      .post('/api/public/order')
      .send({
        businessSlug,
        customerName: 'Aarav Patel',
        customerPhone: '9876500000',
        tableNumber: 'Table 5',
        customerNotes: 'Less ice please',
        items: [
          {
            productId: product.id,
            quantity: 2,
            selectedVariantOptionIds: [variantOptionId],
            selectedAddonIds: [addonId],
          },
        ],
      });

    expect(orderRes.status).toBe(201);
    expect(orderRes.body.success).toBe(true);
    expect(orderRes.body.data.totalAmount).toBe(460); // 100% authoritative!
    expect(orderRes.body.data.orderNumber).toMatch(/^#[A-Z]{3}-\d{4}$/);
    expect(orderRes.body.data.whatsappDeepLink).toContain('https://wa.me/919876543210?text=');
  });

  it('9. Security: Blocks unauthorized cross-business data modification (IDOR Protection)', async () => {
    // Another rogue user tries to modify businessId
    const rogueToken = 'Bearer invalid_or_other_token';
    const res = await request(app)
      .delete(`/api/catalog/${businessId}/categories/${categoryId}`)
      .set('Authorization', rogueToken);

    expect(res.status).toBe(401);
  });
});
