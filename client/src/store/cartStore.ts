import { create } from 'zustand';
import { Product, ProductVariantOption, ProductAddon } from '../types';

export interface CartItem {
  id: string; // unique hash key: productId-variants-addons
  product: Product;
  quantity: number;
  selectedVariants: ProductVariantOption[];
  selectedAddons: ProductAddon[];
  unitPrice: number;
  totalPrice: number;
}

interface CartState {
  businessSlug: string | null;
  items: CartItem[];
  isCartDrawerOpen: boolean;
  isOrdering: boolean;
  initCartForBusiness: (slug: string) => void;
  addItem: (product: Product, quantity: number, variants?: ProductVariantOption[], addons?: ProductAddon[]) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  clearCart: () => void;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  setIsOrdering: (val: boolean) => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

function generateCartItemId(productId: string, variants: ProductVariantOption[], addons: ProductAddon[]): string {
  const variantIds = variants.map((v) => v.id).sort().join('-');
  const addonIds = addons.map((a) => a.id).sort().join('-');
  return `${productId}_v[${variantIds}]_a[${addonIds}]`;
}

function calculateItemUnitPrice(basePrice: number, variants: ProductVariantOption[], addons: ProductAddon[]): number {
  let price = basePrice;
  for (const v of variants) {
    price += v.priceModifier;
  }
  for (const a of addons) {
    price += a.price;
  }
  return price;
}

export const useCartStore = create<CartState>((set, get) => ({
  businessSlug: null,
  items: [],
  isCartDrawerOpen: false,
  isOrdering: false,

  initCartForBusiness: (slug: string) => {
    const current = get().businessSlug;
    if (current !== slug) {
      // Load saved cart from localStorage if exists
      const saved = localStorage.getItem(`bwqr_cart_${slug}`);
      let parsedItems: CartItem[] = [];
      if (saved) {
        try {
          parsedItems = JSON.parse(saved);
        } catch (e) {
          parsedItems = [];
        }
      }
      set({ businessSlug: slug, items: parsedItems });
    }
  },

  addItem: (product, quantity, variants = [], addons = []) => {
    const { businessSlug, items } = get();
    const itemId = generateCartItemId(product.id, variants, addons);
    const unitPrice = calculateItemUnitPrice(product.price, variants, addons);

    const existingIndex = items.findIndex((i) => i.id === itemId);
    let newItems: CartItem[];

    if (existingIndex > -1) {
      newItems = items.map((item, idx) => {
        if (idx === existingIndex) {
          const newQty = item.quantity + quantity;
          return {
            ...item,
            quantity: newQty,
            totalPrice: item.unitPrice * newQty,
          };
        }
        return item;
      });
    } else {
      const newItem: CartItem = {
        id: itemId,
        product,
        quantity,
        selectedVariants: variants,
        selectedAddons: addons,
        unitPrice,
        totalPrice: unitPrice * quantity,
      };
      newItems = [...items, newItem];
    }

    if (businessSlug) {
      localStorage.setItem(`bwqr_cart_${businessSlug}`, JSON.stringify(newItems));
    }
    set({ items: newItems });
  },

  removeItem: (itemId) => {
    const { businessSlug, items } = get();
    const newItems = items.filter((i) => i.id !== itemId);
    if (businessSlug) {
      localStorage.setItem(`bwqr_cart_${businessSlug}`, JSON.stringify(newItems));
    }
    set({ items: newItems });
  },

  updateQuantity: (itemId, newQuantity) => {
    const { businessSlug, items } = get();
    if (newQuantity <= 0) {
      get().removeItem(itemId);
      return;
    }

    const newItems = items.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: item.unitPrice * newQuantity,
        };
      }
      return item;
    });

    if (businessSlug) {
      localStorage.setItem(`bwqr_cart_${businessSlug}`, JSON.stringify(newItems));
    }
    set({ items: newItems });
  },

  clearCart: () => {
    const { businessSlug } = get();
    if (businessSlug) {
      localStorage.removeItem(`bwqr_cart_${businessSlug}`);
    }
    set({ items: [] });
  },

  openCartDrawer: () => set({ isCartDrawerOpen: true }),
  closeCartDrawer: () => set({ isCartDrawerOpen: false }),
  setIsOrdering: (val) => set({ isOrdering: val }),

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.totalPrice, 0);
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
