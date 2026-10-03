import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '../store/cartStore';
import { Product } from '../types';

describe('Cart Store Unit Tests', () => {
  const dummyProduct: Product = {
    id: 'prod_1',
    businessId: 'biz_1',
    categoryId: 'cat_1',
    name: 'Paneer Pizza',
    price: 250,
    isAvailable: true,
    isFeatured: true,
    sortOrder: 1,
  };

  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('starts with an empty cart and zero subtotal', () => {
    const store = useCartStore.getState();
    expect(store.items.length).toBe(0);
    expect(store.getItemCount()).toBe(0);
    expect(store.getSubtotal()).toBe(0);
  });

  it('adds an item to cart and calculates subtotal correctly', () => {
    useCartStore.getState().addItem(dummyProduct, 2);
    const store = useCartStore.getState();

    expect(store.getItemCount()).toBe(2);
    expect(store.getSubtotal()).toBe(500);
    expect(store.items[0].product.name).toBe('Paneer Pizza');
  });

  it('correctly calculates prices with variants and add-ons', () => {
    const variant = { id: 'var_large', variantGroupId: 'vg_1', name: 'Large 12"', priceModifier: 150, isAvailable: true };
    const addon = { id: 'add_cheese', productId: 'prod_1', name: 'Extra Cheese Burst', price: 60, isAvailable: true };

    // 250 + 150 + 60 = 460 each * 2 = 920
    useCartStore.getState().addItem(dummyProduct, 2, [variant], [addon]);
    const store = useCartStore.getState();

    expect(store.getItemCount()).toBe(2);
    expect(store.getSubtotal()).toBe(920);
    expect(store.items[0].unitPrice).toBe(460);
  });

  it('updates quantity and recalculates subtotal', () => {
    useCartStore.getState().addItem(dummyProduct, 1);
    const store = useCartStore.getState();
    const itemId = store.items[0].id;

    store.updateQuantity(itemId, 3);
    expect(useCartStore.getState().getItemCount()).toBe(3);
    expect(useCartStore.getState().getSubtotal()).toBe(750);
  });

  it('removes item when quantity is reduced to zero', () => {
    useCartStore.getState().addItem(dummyProduct, 1);
    const store = useCartStore.getState();
    const itemId = store.items[0].id;

    store.updateQuantity(itemId, 0);
    expect(useCartStore.getState().getItemCount()).toBe(0);
    expect(useCartStore.getState().getSubtotal()).toBe(0);
  });
});
