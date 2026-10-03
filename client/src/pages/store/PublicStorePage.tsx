import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Plus,
  Minus,
  X,
  Phone,
  Clock,
  MapPin,
  Check,
  AlertTriangle,
  Send,
  Sparkles,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Business, Category, Product, ProductVariantOption, ProductAddon } from '../../types';
import { useCartStore, CartItem } from '../../store/cartStore';
import { api } from '../../utils/api';
import { Modal } from '../../components/common/Modal';

export const PublicStorePage: React.FC = () => {
  const { businessSlug } = useParams<{ businessSlug: string }>();
  const [searchParams] = useSearchParams();
  const fromQr = searchParams.get('from') === 'qr';

  const [business, setBusiness] = useState<Business | null>(null);
  const [storeStatus, setStoreStatus] = useState<{ isOpen: boolean; reason: string }>({
    isOpen: true,
    reason: '',
  });
  const [categories, setCategories] = useState<(Category & { products: Product[] })[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [dietaryFilter, setDietaryFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected Product for customization modal (variants + addons)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, ProductVariantOption>>({});
  const [selectedAddons, setSelectedAddons] = useState<ProductAddon[]>([]);
  const [modalQuantity, setModalQuantity] = useState(1);

  // Customer order checkout fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isDelivery, setIsDelivery] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccessUrl, setOrderSuccessUrl] = useState<string | null>(null);

  const cart = useCartStore();

  useEffect(() => {
    if (!businessSlug) return;
    cart.initCartForBusiness(businessSlug);

    const loadStore = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const queryParam = fromQr ? '?from=qr' : '';
        const res = await api.get<{
          business: Business;
          storeStatus: { isOpen: boolean; reason: string };
          categories: (Category & { products: Product[] })[];
        }>(`/public/store/${businessSlug}${queryParam}`);

        setBusiness(res.business);
        setStoreStatus(res.storeStatus);
        setCategories(res.categories);
        if (res.categories.length > 0) {
          setActiveCategoryId('all');
        }
      } catch (err: any) {
        setError(err.message || 'Unable to load catalog. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadStore();
  }, [businessSlug, fromQr]);

  // Open Product Customization Modal
  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
    setModalQuantity(1);
    setSelectedAddons([]);

    // Select default options for required variant groups
    const initialVariants: Record<string, ProductVariantOption> = {};
    if (product.variantGroups) {
      for (const group of product.variantGroups) {
        if (group.options.length > 0) {
          initialVariants[group.id] = group.options[0];
        }
      }
    }
    setSelectedVariants(initialVariants);
  };

  const handleAddModalProductToCart = () => {
    if (!selectedProduct) return;
    const variantsList = Object.values(selectedVariants);
    cart.addItem(selectedProduct, modalQuantity, variantsList, selectedAddons);
    setSelectedProduct(null);
  };

  // Calculate modal dynamic unit price
  const calculateModalPrice = () => {
    if (!selectedProduct) return 0;
    let price = selectedProduct.price;
    for (const v of Object.values(selectedVariants)) {
      price += v.priceModifier;
    }
    for (const a of selectedAddons) {
      price += a.price;
    }
    return price * modalQuantity;
  };

  // Filter products by category, search, and dietary type
  const filteredCategories = categories
    .map((cat) => {
      const prods = cat.products.filter((p) => {
        const matchesCategory = activeCategoryId === 'all' || cat.id === activeCategoryId;
        const matchesSearch =
          !searchQuery.trim() ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesDietary =
          dietaryFilter === 'ALL' ||
          (dietaryFilter === 'VEG' && (p.foodType === 'VEG' || !p.foodType)) ||
          (dietaryFilter === 'NON_VEG' && (p.foodType === 'NON_VEG' || p.foodType === 'EGG'));
        return matchesCategory && matchesSearch && matchesDietary;
      });
      return { ...cat, products: prods };
    })
    .filter((cat) => cat.products.length > 0);

  // Handle WhatsApp Order Submission with server price verification
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || cart.items.length === 0) return;

    if (!customerName.trim()) {
      setOrderError('Please enter your name.');
      return;
    }

    setOrderError(null);
    cart.setIsOrdering(true);

    try {
      const orderPayload = {
        businessSlug: business.slug,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        tableNumber: tableNumber.trim() || undefined,
        deliveryAddress: deliveryAddress.trim() || undefined,
        customerNotes: customerNotes.trim() || undefined,
        isDelivery,
        items: cart.items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          selectedVariantOptionIds: item.selectedVariants.map((v) => v.id),
          selectedAddonIds: item.selectedAddons.map((a) => a.id),
        })),
      };

      const result = await api.post<{
        orderId: string;
        orderNumber: string;
        totalAmount: number;
        whatsappDeepLink: string;
        whatsappMessage: string;
      }>('/public/order', orderPayload);

      // Clear cart on successful order creation
      cart.clearCart();
      setOrderSuccessUrl(result.whatsappDeepLink);

      // Redirect immediately to WhatsApp
      window.location.href = result.whatsappDeepLink;
    } catch (err: any) {
      setOrderError(err.message || 'Failed to place order. Please review your cart.');
    } finally {
      cart.setIsOrdering(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-600">Loading catalog...</p>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-6 text-center shadow-card border border-slate-200 space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Catalog Unavailable</h2>
          <p className="text-sm text-slate-500">{error || 'Store not found'}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-slate-900 text-white font-medium py-2.5 rounded-xl text-sm hover:bg-slate-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const subtotal = cart.getSubtotal();
  const taxAmount = business.isTaxEnabled ? Math.round((subtotal * business.taxRate) / 100) : 0;
  const deliveryFee = isDelivery ? business.deliveryFee : 0;
  const grandTotal = subtotal + taxAmount + deliveryFee;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28">
      {/* Cover Header Banner */}
      <div className="relative h-44 sm:h-56 w-full bg-slate-800 overflow-hidden">
        {business.coverImage ? (
          <img
            src={business.coverImage}
            alt={business.name}
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          <div
            className="w-full h-full opacity-90"
            style={{ backgroundColor: business.primaryColor }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Store Open/Closed Badge on Banner */}
        <div className="absolute top-4 right-4">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-md ${
              storeStatus.isOpen
                ? 'bg-emerald-500 text-white'
                : 'bg-rose-500 text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            {storeStatus.isOpen ? 'OPEN NOW' : 'CURRENTLY CLOSED'}
          </span>
        </div>
      </div>

      {/* Business Info Header Card */}
      <div className="max-w-3xl mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-200/80 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          {/* Logo */}
          <div className="relative -mt-10 sm:-mt-12 flex-shrink-0">
            {business.logo ? (
              <img
                src={business.logo}
                alt={business.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-white shadow-md bg-white"
              />
            ) : (
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-white font-black text-2xl border-4 border-white shadow-md"
                style={{ backgroundColor: business.primaryColor }}
              >
                {business.name.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 space-y-1.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {business.name}
              </h1>
              <div className="flex items-center gap-1.5 self-center sm:self-auto flex-wrap justify-center sm:justify-start">
                <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {business.category}
                </span>
                {business.dietaryType === 'PURE_VEG' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-3 h-3 border-2 border-emerald-600 rounded-sm flex items-center justify-center p-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 block"></span>
                    </span>
                    100% Pure Veg
                  </span>
                )}
                {business.dietaryType === 'VEG_NON_VEG' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200">
                    <span className="w-3 h-3 border-2 border-emerald-600 rounded-sm flex items-center justify-center p-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 block"></span>
                    </span>
                    <span className="w-3 h-3 border-2 border-rose-700 rounded-sm flex items-center justify-center p-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-700 block"></span>
                    </span>
                    Veg & Non-Veg
                  </span>
                )}
                {business.dietaryType === 'NON_VEG' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    <span className="w-3 h-3 border-2 border-rose-700 rounded-sm flex items-center justify-center p-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-700 block"></span>
                    </span>
                    Non-Veg Specialty
                  </span>
                )}
              </div>
            </div>

            {business.address && (
              <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>{business.address}{business.city ? `, ${business.city}` : ''}</span>
              </p>
            )}

            {business.openingHoursText && (
              <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>{business.openingHoursText}</span>
              </p>
            )}

            {!storeStatus.isOpen && (
              <div className="mt-2 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2 flex items-center gap-1.5">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span>{storeStatus.reason}</span>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items, drinks, snacks..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Categories Tab Navigation */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setActiveCategoryId('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              activeCategoryId === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeCategoryId === cat.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Dietary Filter Pills (when store serves both veg & non-veg) */}
        {business.dietaryType === 'VEG_NON_VEG' && (
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => setDietaryFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                dietaryFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setDietaryFilter('VEG')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                dietaryFilter === 'VEG'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              <span className="w-3 h-3 border-2 border-emerald-600 rounded-sm flex items-center justify-center p-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 block"></span>
              </span>
              Veg Only
            </button>
            <button
              onClick={() => setDietaryFilter('NON_VEG')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                dietaryFilter === 'NON_VEG'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white text-rose-800 border border-rose-200 hover:bg-rose-50'
              }`}
            >
              <span className="w-3 h-3 border-2 border-rose-700 rounded-sm flex items-center justify-center p-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-700 block"></span>
              </span>
              Non-Veg
            </button>
          </div>
        )}

        {/* Product List */}
        <div className="mt-6 space-y-8">
          {filteredCategories.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm">
              <p className="text-sm font-semibold text-slate-700">No items found</p>
              <p className="text-xs text-slate-400 mt-1">Try searching for a different keyword or category.</p>
            </div>
          ) : (
            filteredCategories.map((cat) => (
              <div key={cat.id} className="space-y-3">
                <div className="border-b border-slate-200/80 pb-2">
                  <h2 className="text-base font-extrabold text-slate-900">{cat.name}</h2>
                  {cat.description && <p className="text-xs text-slate-500">{cat.description}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cat.products.map((product) => {
                    const hasOptions =
                      (product.variantGroups && product.variantGroups.length > 0) ||
                      (product.addons && product.addons.length > 0);

                    return (
                      <div
                        key={product.id}
                        className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex gap-3 cursor-pointer"
                        onClick={() => handleOpenProduct(product)}
                      >
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            {/* Veg / Non-Veg Indicator */}
                            <div className="flex items-center gap-1.5 mb-1">
                              {product.foodType === 'NON_VEG' ? (
                                <span className="w-3.5 h-3.5 border border-rose-700 p-0.5 rounded-sm flex items-center justify-center flex-shrink-0" title="Non-Vegetarian">
                                  <span className="w-2 h-2 rounded-full bg-rose-700" />
                                </span>
                              ) : product.foodType === 'EGG' ? (
                                <span className="w-3.5 h-3.5 border border-amber-600 p-0.5 rounded-sm flex items-center justify-center flex-shrink-0" title="Contains Egg">
                                  <span className="w-2 h-2 rounded-full bg-amber-600" />
                                </span>
                              ) : (
                                <span className="w-3.5 h-3.5 border border-emerald-600 p-0.5 rounded-sm flex items-center justify-center flex-shrink-0" title="Vegetarian">
                                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                                </span>
                              )}
                              {product.isFeatured && (
                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                  Bestseller
                                </span>
                              )}
                            </div>

                            <h3 className="font-bold text-sm text-slate-900 leading-snug">
                              {product.name}
                            </h3>
                            {product.description && (
                              <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                                {product.description}
                              </p>
                            )}
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-extrabold text-base text-slate-900">
                                {business.currencySymbol}{product.price}
                              </span>
                              {product.compareAtPrice && (
                                <span className="text-xs text-slate-400 line-through">
                                  {business.currencySymbol}{product.compareAtPrice}
                                </span>
                              )}
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenProduct(product);
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition-colors flex items-center gap-1"
                            >
                              Add {hasOptions && '+'}
                            </button>
                          </div>
                        </div>

                        {/* Product Image */}
                        {product.image && (
                          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Floating Bottom Cart Bar */}
      {cart.getItemCount() > 0 && (
        <div className="fixed bottom-3 inset-x-3 sm:max-w-md sm:mx-auto z-40">
          <button
            onClick={() => cart.openCartDrawer()}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white p-3.5 rounded-2xl shadow-floating flex items-center justify-between transition-all transform active:scale-95"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center font-bold text-xs text-white">
                {cart.getItemCount()}
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-slate-300">View Cart</div>
                <div className="text-sm font-extrabold text-white">
                  {business.currencySymbol}{cart.getSubtotal()}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-400">
              Continue
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Product Customization Modal (Variants & Addons) */}
      <Modal
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        title={selectedProduct?.name}
        description={selectedProduct?.description || undefined}
        maxWidth="md"
      >
        {selectedProduct && (
          <div className="space-y-5">
            {/* Base Image if available */}
            {selectedProduct.image && (
              <div className="h-44 w-full rounded-xl overflow-hidden -mt-2">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Dietary Badge in Modal */}
            <div className="flex items-center gap-2 -mt-1">
              {selectedProduct.foodType === 'NON_VEG' ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  <span className="w-3.5 h-3.5 border border-rose-700 p-0.5 rounded-sm flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-700" />
                  </span>
                  Non-Vegetarian
                </span>
              ) : selectedProduct.foodType === 'EGG' ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  <span className="w-3.5 h-3.5 border border-amber-600 p-0.5 rounded-sm flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  </span>
                  Contains Egg
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <span className="w-3.5 h-3.5 border border-emerald-600 p-0.5 rounded-sm flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  </span>
                  Vegetarian
                </span>
              )}
            </div>

            {/* Variant Groups (e.g. Size: Small, Medium, Large) */}
            {selectedProduct.variantGroups &&
              selectedProduct.variantGroups.map((group) => (
                <div key={group.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      {group.name} {group.required && <span className="text-rose-500">*</span>}
                    </span>
                    <span className="text-[11px] text-slate-400">Select 1</span>
                  </div>
                  <div className="space-y-1.5">
                    {group.options.map((opt) => {
                      const isSelected = selectedVariants[group.id]?.id === opt.id;
                      return (
                        <label
                          key={opt.id}
                          className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? 'border-brand-600 bg-brand-50/50 ring-1 ring-brand-500'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="radio"
                              name={group.id}
                              checked={isSelected}
                              onChange={() =>
                                setSelectedVariants({
                                  ...selectedVariants,
                                  [group.id]: opt,
                                })
                              }
                              className="text-brand-600 focus:ring-brand-500"
                            />
                            <span className="font-semibold text-slate-900">{opt.name}</span>
                          </div>
                          <span className="font-bold text-slate-700">
                            {opt.priceModifier > 0
                              ? `+${business.currencySymbol}${opt.priceModifier}`
                              : 'Included'}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

            {/* Addons (e.g. Extra Cheese, Dip) */}
            {selectedProduct.addons && selectedProduct.addons.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Add-ons & Extras
                  </span>
                  <span className="text-[11px] text-slate-400">Optional</span>
                </div>
                <div className="space-y-1.5">
                  {selectedProduct.addons.map((addon) => {
                    const isChecked = selectedAddons.some((a) => a.id === addon.id);
                    return (
                      <label
                        key={addon.id}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? 'border-brand-600 bg-brand-50/50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAddons([...selectedAddons, addon]);
                              } else {
                                setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
                              }
                            }}
                            className="rounded text-brand-600 focus:ring-brand-500"
                          />
                          <span className="font-semibold text-slate-900">{addon.name}</span>
                        </div>
                        <span className="font-bold text-slate-700">
                          +{business.currencySymbol}{addon.price}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector & Add Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
              <div className="flex items-center border border-slate-200 rounded-xl p-1 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                  className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-white"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-3 text-sm font-bold text-slate-900">{modalQuantity}</span>
                <button
                  type="button"
                  onClick={() => setModalQuantity(modalQuantity + 1)}
                  className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-white"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddModalProductToCart}
                className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-4 rounded-xl text-sm shadow-sm transition-all flex items-center justify-between"
              >
                <span>Add to Cart</span>
                <span>{business.currencySymbol}{calculateModalPrice()}</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Cart & WhatsApp Checkout Bottom Sheet / Drawer */}
      {cart.isCartDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => cart.closeCartDrawer()}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-brand-600" />
                  <h3 className="font-extrabold text-base text-slate-900">Your Order</h3>
                </div>
                <button
                  onClick={() => cart.closeCartDrawer()}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.items.length === 0 ? (
                  <div className="text-center py-12 space-y-2">
                    <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                    <p className="font-bold text-slate-700">Your cart is empty</p>
                    <p className="text-xs text-slate-400">Scan and add tasty dishes to start your order!</p>
                  </div>
                ) : (
                  cart.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-sm text-slate-900">{item.product.name}</div>
                          {item.selectedVariants.length > 0 && (
                            <div className="text-xs text-slate-500 font-medium">
                              {item.selectedVariants.map((v) => v.name).join(', ')}
                            </div>
                          )}
                          {item.selectedAddons.length > 0 && (
                            <div className="text-[11px] text-brand-700">
                              +{item.selectedAddons.map((a) => a.name).join(', ')}
                            </div>
                          )}
                        </div>
                        <span className="font-extrabold text-sm text-slate-900">
                          {business.currencySymbol}{item.totalPrice}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => cart.removeItem(item.id)}
                          className="text-[11px] text-rose-500 font-semibold hover:underline"
                        >
                          Remove
                        </button>
                        <div className="flex items-center border border-slate-300 rounded-lg bg-white">
                          <button
                            onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-slate-500 hover:text-slate-800"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-900">{item.quantity}</span>
                          <button
                            onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-slate-500 hover:text-slate-800"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Checkout Input Form */}
                {cart.items.length > 0 && (
                  <form id="orderForm" onSubmit={handleCheckoutSubmit} className="mt-6 space-y-3.5 pt-4 border-t border-slate-200">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Customer & Delivery Details
                    </h4>

                    {orderError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span>{orderError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Your Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Table / Seat No. (or Room No.)
                      </label>
                      <input
                        type="text"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        placeholder="e.g. Table 4"
                        className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        WhatsApp / Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Delivery Address (if takeaway / delivery)
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => {
                          setDeliveryAddress(e.target.value);
                          if (e.target.value.trim().length > 0) {
                            setIsDelivery(true);
                          }
                        }}
                        placeholder="House no., Landmark, Street"
                        className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Cooking Instructions / Notes
                      </label>
                      <input
                        type="text"
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        placeholder="e.g. Less spicy, send extra napkins"
                        className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </form>
                )}
              </div>

              {/* Drawer Footer with Totals and Big WhatsApp CTA */}
              {cart.items.length > 0 && (
                <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-slate-900">{business.currencySymbol}{subtotal}</span>
                    </div>
                    {business.isTaxEnabled && (
                      <div className="flex justify-between">
                        <span>Tax ({business.taxRate}%)</span>
                        <span className="font-semibold text-slate-900">{business.currencySymbol}{taxAmount}</span>
                      </div>
                    )}
                    {isDelivery && business.deliveryFee > 0 && (
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span className="font-semibold text-slate-900">{business.currencySymbol}{deliveryFee}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-200">
                      <span>Grand Total</span>
                      <span className="text-base text-brand-700">{business.currencySymbol}{grandTotal}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    form="orderForm"
                    disabled={cart.isOrdering || !storeStatus.isOpen}
                    className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-sm text-white shadow-md flex items-center justify-center gap-2 transition-all ${
                      storeStatus.isOpen
                        ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-emerald-600/20'
                        : 'bg-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {cart.isOrdering ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying & Opening WhatsApp...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Order on WhatsApp</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-slate-400">
                    No sign-up needed. Opens directly in your official WhatsApp app.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
