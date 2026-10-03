export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

export interface BusinessHours {
  id: string;
  businessId: string;
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  openTime2?: string | null;
  closeTime2?: string | null;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  category: string;
  phone: string;
  whatsappNumber: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  openingHoursText?: string;
  logo?: string;
  coverImage?: string;
  primaryColor: string;
  secondaryColor: string;
  currency: string;
  currencySymbol: string;
  isTaxEnabled: boolean;
  taxRate: number;
  deliveryFee: number;
  minOrderAmount: number;
  isStoreOpenManual: boolean;
  dietaryType?: 'PURE_VEG' | 'VEG_NON_VEG' | 'NON_VEG';
  businessTypeConfig?: {
    preset: string;
    fields: Record<string, { required: boolean; label: string }>;
  };
  subscription?: Subscription;
  businessHours?: BusinessHours[];
  _count?: {
    products: number;
    categories: number;
    orders: number;
  };
}

export interface Subscription {
  id: string;
  businessId: string;
  plan: string;
  status: string;
  monthlyPrice: number;
  setupFee: number;
  currentPeriodEnd: string;
}

export interface Category {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  _count?: {
    products: number;
  };
}

export interface ProductVariantOption {
  id: string;
  variantGroupId: string;
  name: string;
  priceModifier: number;
  isAvailable: boolean;
}

export interface ProductVariantGroup {
  id: string;
  productId: string;
  name: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  options: ProductVariantOption[];
}

export interface ProductAddon {
  id: string;
  productId: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface Product {
  id: string;
  businessId: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  compareAtPrice?: number | null;
  image?: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  foodType?: 'VEG' | 'NON_VEG' | 'EGG';
  sortOrder: number;
  metadata?: string | null;
  category?: Category;
  variantGroups?: ProductVariantGroup[];
  addons?: ProductAddon[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  selectedVariants?: string | null;
  selectedAddons?: string | null;
}

export interface Order {
  id: string;
  businessId: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  customerNotes?: string;
  tableNumber?: string;
  deliveryAddress?: string;
  customFields?: string | null;
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  totalAmount: number;
  status: 'NEW' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  whatsappMessage: string;
  createdAt: string;
  items: OrderItem[];
}

export interface AnalyticsSummary {
  qrScans: number;
  pageViews: number;
  productViews: number;
  addToCartCount: number;
  ordersInitiated: number;
  totalOrders: number;
  todayOrdersCount: number;
  todayRevenue: number;
  conversionRate: string;
  topItems: {
    name: string;
    totalQuantity: number;
    totalRevenue: number;
  }[];
}
