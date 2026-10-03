import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo data...');

  // 1. Clean existing records if any
  await prisma.analyticsEvent.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productAddon.deleteMany();
  await prisma.productVariantOption.deleteMany();
  await prisma.productVariantGroup.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.businessHours.deleteMany();
  await prisma.qRCode.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.business.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create demo owner
  const passwordHash = await bcrypt.hash('DemoPassword123!', 10);
  const demoOwner = await prisma.user.create({
    data: {
      name: 'Rahul Sharma',
      email: 'owner@abcrestaurant.com',
      passwordHash,
      phone: '+919876543210',
      role: 'OWNER',
    },
  });

  // 3. Create demo business
  const demoBusiness = await prisma.business.create({
    data: {
      name: 'ABC Restaurant',
      slug: 'abc-restaurant',
      category: 'Restaurant',
      ownerId: demoOwner.id,
      phone: '9876543210',
      whatsappNumber: '919876543210',
      email: 'contact@abcrestaurant.com',
      address: 'Shop 14, High Street Market, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560038',
      openingHoursText: '11:00 AM - 11:00 PM',
      logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop&crop=faces&auto=format&q=80',
      coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=400&fit=crop&auto=format&q=80',
      primaryColor: '#10b981',
      secondaryColor: '#065f46',
      currency: 'INR',
      currencySymbol: '₹',
      isTaxEnabled: true,
      taxRate: 5.0,
      deliveryFee: 40.0,
      minOrderAmount: 100.0,
      isStoreOpenManual: true,
      dietaryType: 'VEG_NON_VEG',
      businessTypeConfig: JSON.stringify({
        preset: 'Restaurant',
        fields: {
          customerName: { required: true, label: 'Your Name' },
          tableNumber: { required: false, label: 'Table / Seat No.' },
          phone: { required: true, label: 'Phone Number' },
          address: { required: false, label: 'Delivery Address' },
          notes: { required: false, label: 'Cooking Notes (e.g. less spicy)' },
        },
      }),
    },
  });

  // 4. Create Business Hours (Open 7 days: 11:00 to 23:00)
  for (let day = 0; day <= 6; day++) {
    await prisma.businessHours.create({
      data: {
        businessId: demoBusiness.id,
        dayOfWeek: day,
        isOpen: true,
        openTime: '11:00',
        closeTime: '23:00',
      },
    });
  }

  // 5. Create Subscription (Active Pro plan)
  const oneMonthAhead = new Date();
  oneMonthAhead.setMonth(oneMonthAhead.getMonth() + 1);

  await prisma.subscription.create({
    data: {
      businessId: demoBusiness.id,
      plan: 'PRO_MONTHLY',
      status: 'ACTIVE',
      monthlyPrice: 299,
      setupFee: 1999,
      currentPeriodEnd: oneMonthAhead,
    },
  });

  // 6. Create QR Code record
  await prisma.qRCode.create({
    data: {
      businessId: demoBusiness.id,
      qrCodeKey: 'abc-restaurant-qr-primary',
      scanCount: 142,
    },
  });

  // 7. Create Categories
  const catPizza = await prisma.category.create({
    data: {
      businessId: demoBusiness.id,
      name: 'Pizzas',
      description: 'Hand-stretched dough with fresh toppings',
      sortOrder: 1,
    },
  });

  const catBurgers = await prisma.category.create({
    data: {
      businessId: demoBusiness.id,
      name: 'Burgers & Wraps',
      description: 'Gourmet burgers and toasted artisanal wraps',
      sortOrder: 2,
    },
  });

  const catBeverages = await prisma.category.create({
    data: {
      businessId: demoBusiness.id,
      name: 'Beverages',
      description: 'Refreshing cold drinks and brewed coolers',
      sortOrder: 3,
    },
  });

  const catDesserts = await prisma.category.create({
    data: {
      businessId: demoBusiness.id,
      name: 'Desserts',
      description: 'Traditional sweets and gourmet desserts',
      sortOrder: 4,
    },
  });

  // 8. Create Products with Variants & Add-ons
  // Product 1: Paneer Pizza (with size variants & crust addons)
  const p1 = await prisma.product.create({
    data: {
      businessId: demoBusiness.id,
      categoryId: catPizza.id,
      name: 'Paneer Makhani Pizza',
      description: 'Marinated cottage cheese cubes, crisp bell peppers, red onions, mozzarella, and creamy makhani drizzle.',
      price: 250,
      compareAtPrice: 299,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=450&fit=crop&auto=format&q=80',
      isAvailable: true,
      isFeatured: true,
      foodType: 'VEG',
      sortOrder: 1,
      metadata: JSON.stringify({ foodType: 'veg', tags: ['Bestseller', 'Chef Special'] }),
    },
  });

  // Variants for Paneer Pizza
  const p1SizeGroup = await prisma.productVariantGroup.create({
    data: {
      productId: p1.id,
      name: 'Size',
      required: true,
      minSelect: 1,
      maxSelect: 1,
    },
  });

  await prisma.productVariantOption.createMany({
    data: [
      { variantGroupId: p1SizeGroup.id, name: 'Regular 7"', priceModifier: 0 },
      { variantGroupId: p1SizeGroup.id, name: 'Medium 10"', priceModifier: 150 },
      { variantGroupId: p1SizeGroup.id, name: 'Large 12"', priceModifier: 280 },
    ],
  });

  // Add-ons for Paneer Pizza
  await prisma.productAddon.createMany({
    data: [
      { productId: p1.id, name: 'Extra Cheese Burst Crust', price: 60 },
      { productId: p1.id, name: 'Jalapeño & Olives Dip', price: 30 },
      { productId: p1.id, name: 'Spicy Garlic Seasoning', price: 15 },
    ],
  });

  // Product 2: Farmhouse Veggie Pizza
  await prisma.product.create({
    data: {
      businessId: demoBusiness.id,
      categoryId: catPizza.id,
      name: 'Classic Farmhouse Pizza',
      description: 'Loaded with crunchy capsicum, sweet golden corn, red ripe tomatoes, and cheddar-mozzarella blend.',
      price: 220,
      compareAtPrice: 260,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=450&fit=crop&auto=format&q=80',
      isAvailable: true,
      isFeatured: false,
      foodType: 'VEG',
      sortOrder: 2,
      metadata: JSON.stringify({ foodType: 'veg', tags: ['Popular'] }),
    },
  });

  // Product 2B: Smokey Chicken Tikka Pizza (Non-Veg)
  const pNonVegPizza = await prisma.product.create({
    data: {
      businessId: demoBusiness.id,
      categoryId: catPizza.id,
      name: 'Smokey Chicken Tikka Pizza',
      description: 'Succulent roasted tandoori chicken chunks, red paprika, spiced onions, and double mozzarella blend.',
      price: 320,
      compareAtPrice: 380,
      image: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=600&h=450&fit=crop&auto=format&q=80',
      isAvailable: true,
      isFeatured: true,
      foodType: 'NON_VEG',
      sortOrder: 3,
      metadata: JSON.stringify({ foodType: 'nonveg', tags: ['Non-Veg', 'Bestseller'] }),
    },
  });

  const pNonVegSize = await prisma.productVariantGroup.create({
    data: {
      productId: pNonVegPizza.id,
      name: 'Size',
      required: true,
      minSelect: 1,
      maxSelect: 1,
    },
  });

  await prisma.productVariantOption.createMany({
    data: [
      { variantGroupId: pNonVegSize.id, name: 'Regular 7"', priceModifier: 0 },
      { variantGroupId: pNonVegSize.id, name: 'Medium 10"', priceModifier: 160 },
      { variantGroupId: pNonVegSize.id, name: 'Large 12"', priceModifier: 300 },
    ],
  });

  // Product 3: Veg Burger
  const p3 = await prisma.product.create({
    data: {
      businessId: demoBusiness.id,
      categoryId: catBurgers.id,
      name: 'Crispy Veggie Crunch Burger',
      description: 'Golden spiced potato-herb patty topped with iceberg lettuce, pickled onions, and secret tandoori dressing.',
      price: 180,
      compareAtPrice: 210,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=450&fit=crop&auto=format&q=80',
      isAvailable: true,
      isFeatured: true,
      sortOrder: 1,
      metadata: JSON.stringify({ foodType: 'veg', tags: ['Bestseller'] }),
    },
  });

  await prisma.productAddon.createMany({
    data: [
      { productId: p3.id, name: 'French Fries Combo', price: 70 },
      { productId: p3.id, name: 'Double Cheese Slice', price: 25 },
    ],
  });

  // Product 4: Coke
  await prisma.product.create({
    data: {
      businessId: demoBusiness.id,
      categoryId: catBeverages.id,
      name: 'Chilled Coca Cola (330ml Can)',
      description: 'Ice cold carbonated classic cola.',
      price: 60,
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&h=450&fit=crop&auto=format&q=80',
      isAvailable: true,
      isFeatured: false,
      sortOrder: 1,
      metadata: JSON.stringify({ foodType: 'veg', tags: ['Chilled'] }),
    },
  });

  // Product 5: Mango Mint Cooler
  await prisma.product.create({
    data: {
      businessId: demoBusiness.id,
      categoryId: catBeverages.id,
      name: 'Fresh Mango Mint Cooler',
      description: 'Alphonso mango pulp shaken with garden mint, lemon, and sparkling club soda.',
      price: 110,
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&h=450&fit=crop&auto=format&q=80',
      isAvailable: true,
      isFeatured: true,
      sortOrder: 2,
      metadata: JSON.stringify({ foodType: 'veg', tags: ['Fresh'] }),
    },
  });

  // Product 6: Gulab Jamun
  await prisma.product.create({
    data: {
      businessId: demoBusiness.id,
      categoryId: catDesserts.id,
      name: 'Hot Gulab Jamun (2 Pcs)',
      description: 'Soft melt-in-mouth milk solid dumplings steeped in warm saffron cardamom sugar syrup.',
      price: 100,
      compareAtPrice: 120,
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&h=450&fit=crop&auto=format&q=80',
      isAvailable: true,
      isFeatured: true,
      sortOrder: 1,
      metadata: JSON.stringify({ foodType: 'veg', tags: ['Sweet Tooth'] }),
    },
  });

  // 9. Seed Sample Orders for Analytics & Dashboard
  const sampleOrder1 = await prisma.order.create({
    data: {
      businessId: demoBusiness.id,
      orderNumber: '#ABC-1024',
      customerName: 'Rahul Verma',
      customerPhone: '9876500001',
      tableNumber: 'Table 4',
      customerNotes: 'Please make pizza well-done',
      subtotal: 500,
      taxAmount: 25,
      deliveryFee: 0,
      totalAmount: 525,
      status: 'COMPLETED',
      whatsappMessage: 'Hi ABC Restaurant, order #ABC-1024...',
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: sampleOrder1.id,
      productId: p1.id,
      productName: 'Paneer Makhani Pizza',
      unitPrice: 250,
      quantity: 2,
      totalPrice: 500,
    },
  });

  const sampleOrder2 = await prisma.order.create({
    data: {
      businessId: demoBusiness.id,
      orderNumber: '#ABC-1025',
      customerName: 'Priya Patel',
      customerPhone: '9876500002',
      tableNumber: 'Takeaway',
      subtotal: 350,
      taxAmount: 17.5,
      deliveryFee: 0,
      totalAmount: 367.5,
      status: 'PREPARING',
      whatsappMessage: 'Hi ABC Restaurant, order #ABC-1025...',
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: sampleOrder2.id,
      productId: p3.id,
      productName: 'Crispy Veggie Crunch Burger',
      unitPrice: 180,
      quantity: 1,
      totalPrice: 180,
    },
  });

  // 10. Seed Analytics Events
  const events = [
    { eventType: 'QR_SCAN', count: 120 },
    { eventType: 'PAGE_VIEW', count: 245 },
    { eventType: 'PRODUCT_VIEW', count: 480 },
    { eventType: 'ADD_TO_CART', count: 190 },
    { eventType: 'ORDER_INITIATED', count: 85 },
  ];

  for (const ev of events) {
    for (let i = 0; i < 5; i++) {
      await prisma.analyticsEvent.create({
        data: {
          businessId: demoBusiness.id,
          eventType: ev.eventType,
          metadata: JSON.stringify({ batch: i }),
        },
      });
    }
  }

  console.log('✅ Demo restaurant seeded successfully: ABC Restaurant (/business/abc-restaurant)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
