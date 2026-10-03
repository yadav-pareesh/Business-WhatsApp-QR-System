import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  Sparkles,
  Image,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Category, Product, ProductVariantGroup, ProductAddon } from '../../types';
import { api } from '../../utils/api';
import { Modal } from '../../components/common/Modal';

export const CatalogPage: React.FC = () => {
  const { currentBusiness } = useAuthStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCompareAtPrice, setFormCompareAtPrice] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formFoodType, setFormFoodType] = useState<'VEG' | 'NON_VEG' | 'EGG'>('VEG');
  const [formIsAvailable, setFormIsAvailable] = useState(true);
  const [formIsFeatured, setFormIsFeatured] = useState(false);

  // Variants in Modal
  const [variantGroupName, setVariantGroupName] = useState('Size');
  const [variantOptions, setVariantOptions] = useState<
    { name: string; priceModifier: number }[]
  >([
    { name: 'Regular', priceModifier: 0 },
    { name: 'Large', priceModifier: 100 },
  ]);
  const [hasVariants, setHasVariants] = useState(false);

  // Add-ons in Modal
  const [addonsList, setAddonsList] = useState<{ name: string; price: number }[]>([]);
  const [hasAddons, setHasAddons] = useState(false);

  // Error / Loading
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCatalog = async () => {
    if (!currentBusiness) return;
    setIsLoading(true);
    try {
      const [prodsRes, catsRes] = await Promise.all([
        api.get<Product[]>(`/catalog/${currentBusiness.id}/products`),
        api.get<Category[]>(`/catalog/${currentBusiness.id}/categories`),
      ]);
      setProducts(prodsRes);
      setCategories(catsRes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, [currentBusiness]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategoryId(categories.length > 0 ? categories[0].id : '');
    setFormPrice('');
    setFormCompareAtPrice('');
    setFormDescription('');
    setFormImage('');
    setFormFoodType(currentBusiness?.dietaryType === 'NON_VEG' ? 'NON_VEG' : 'VEG');
    setFormIsAvailable(true);
    setFormIsFeatured(false);
    setHasVariants(false);
    setVariantOptions([
      { name: 'Regular', priceModifier: 0 },
      { name: 'Large', priceModifier: 100 },
    ]);
    setHasAddons(false);
    setAddonsList([{ name: 'Extra Dip', price: 25 }]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategoryId(p.categoryId);
    setFormPrice(String(p.price));
    setFormCompareAtPrice(p.compareAtPrice ? String(p.compareAtPrice) : '');
    setFormDescription(p.description || '');
    setFormImage(p.image || '');
    setFormFoodType((p.foodType as 'VEG' | 'NON_VEG' | 'EGG') || 'VEG');
    setFormIsAvailable(p.isAvailable);
    setFormIsFeatured(p.isFeatured);

    if (p.variantGroups && p.variantGroups.length > 0) {
      setHasVariants(true);
      setVariantGroupName(p.variantGroups[0].name);
      setVariantOptions(
        p.variantGroups[0].options.map((o) => ({
          name: o.name,
          priceModifier: o.priceModifier,
        }))
      );
    } else {
      setHasVariants(false);
      setVariantOptions([]);
    }

    if (p.addons && p.addons.length > 0) {
      setHasAddons(true);
      setAddonsList(p.addons.map((a) => ({ name: a.name, price: a.price })));
    } else {
      setHasAddons(false);
      setAddonsList([]);
    }

    setFormError(null);
    setIsModalOpen(true);
  };

  const handleToggleAvailability = async (p: Product) => {
    if (!currentBusiness) return;
    try {
      const nextStatus = !p.isAvailable;
      await api.put(`/catalog/${currentBusiness.id}/products/${p.id}/toggle-availability`, {
        isAvailable: nextStatus,
      });
      setProducts(products.map((item) => (item.id === p.id ? { ...item, isAvailable: nextStatus } : item)));
    } catch (err: any) {
      alert(err.message || 'Failed to update availability');
    }
  };

  const handleDuplicateProduct = async (p: Product) => {
    if (!currentBusiness) return;
    try {
      await api.post(`/catalog/${currentBusiness.id}/products/${p.id}/duplicate`);
      await loadCatalog();
    } catch (err: any) {
      alert(err.message || 'Failed to duplicate product');
    }
  };

  const handleDeleteProduct = async (p: Product) => {
    if (!currentBusiness) return;
    if (!confirm(`Are you sure you want to delete "${p.name}"?`)) return;
    try {
      await api.delete(`/catalog/${currentBusiness.id}/products/${p.id}`);
      setProducts(products.filter((item) => item.id !== p.id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBusiness) return;
    if (!formCategoryId) {
      setFormError('Please select or create a category first.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const payload: any = {
        name: formName.trim(),
        categoryId: formCategoryId,
        price: parseFloat(formPrice),
        compareAtPrice: formCompareAtPrice ? parseFloat(formCompareAtPrice) : null,
        foodType: formFoodType,
        description: formDescription.trim() || undefined,
        image: formImage.trim() || null,
        isAvailable: formIsAvailable,
        isFeatured: formIsFeatured,
      };

      if (hasVariants && variantOptions.length > 0) {
        payload.variantGroups = [
          {
            name: variantGroupName.trim() || 'Size',
            required: true,
            options: variantOptions.filter((o) => o.name.trim().length > 0),
          },
        ];
      }

      if (hasAddons && addonsList.length > 0) {
        payload.addons = addonsList.filter((a) => a.name.trim().length > 0);
      }

      if (editingProduct) {
        await api.put(`/catalog/${currentBusiness.id}/products/${editingProduct.id}`, payload);
      } else {
        await api.post(`/catalog/${currentBusiness.id}/products`, payload);
      }

      setIsModalOpen(false);
      await loadCatalog();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategoryId === 'all' || p.categoryId === selectedCategoryId;
    const matchesQuery =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Catalog & Products
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage dishes, prices, photos, size variants, and add-ons.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-sm flex items-center justify-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Product / Dish
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items by name..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Category:</span>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <Plus className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No items found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Get started by adding your first product, pricing, and category.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2 rounded-xl text-xs"
          >
            Add First Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className={`bg-white rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                p.isAvailable ? 'border-slate-200 shadow-sm' : 'border-rose-100 bg-rose-50/20'
              }`}
            >
              <div>
                <div className="flex items-start gap-3">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                      <Image className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {p.foodType === 'NON_VEG' ? (
                        <span className="w-3.5 h-3.5 border-2 border-rose-700 rounded-sm flex items-center justify-center p-0.5 flex-shrink-0" title="Non-Vegetarian">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-700 block"></span>
                        </span>
                      ) : p.foodType === 'EGG' ? (
                        <span className="w-3.5 h-3.5 border-2 border-amber-600 rounded-sm flex items-center justify-center p-0.5 flex-shrink-0" title="Contains Egg">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 block"></span>
                        </span>
                      ) : (
                        <span className="w-3.5 h-3.5 border-2 border-emerald-600 rounded-sm flex items-center justify-center p-0.5 flex-shrink-0" title="Pure Vegetarian">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 block"></span>
                        </span>
                      )}
                      <span className="font-extrabold text-sm text-slate-900 truncate">{p.name}</span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-400">
                      {p.category?.name || 'Uncategorized'}
                    </div>
                    <div className="text-sm font-extrabold text-brand-700 mt-1">
                      {currentBusiness?.currencySymbol}{p.price}
                      {p.compareAtPrice && (
                        <span className="text-xs text-slate-400 line-through ml-1.5 font-normal">
                          {currentBusiness?.currencySymbol}{p.compareAtPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {p.description && (
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{p.description}</p>
                )}

                {/* Variants & Addons count badges */}
                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  {p.variantGroups && p.variantGroups.length > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                      {p.variantGroups[0].options.length} Sizes/Options
                    </span>
                  )}
                  {p.addons && p.addons.length > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                      {p.addons.length} Add-ons
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleToggleAvailability(p)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors ${
                    p.isAvailable
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  }`}
                >
                  {p.isAvailable ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {p.isAvailable ? 'In Stock' : 'Sold Out'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDuplicateProduct(p)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                    title="Duplicate item"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(p)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                    title="Edit item"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(p)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        description="Configure product details, prices, variants, and optional add-ons."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Product / Item Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Paneer Makhani Pizza"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formCategoryId}
                onChange={(e) => setFormCategoryId(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Base Price (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                placeholder="250"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Food Type (Dietary Classification)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFormFoodType('VEG')}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  formFoodType === 'VEG'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <span className="w-3.5 h-3.5 border-2 border-emerald-600 rounded-sm flex items-center justify-center p-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 block"></span>
                </span>
                Veg
              </button>

              <button
                type="button"
                onClick={() => setFormFoodType('NON_VEG')}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  formFoodType === 'NON_VEG'
                    ? 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <span className="w-3.5 h-3.5 border-2 border-rose-700 rounded-sm flex items-center justify-center p-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-700 block"></span>
                </span>
                Non-Veg
              </button>

              <button
                type="button"
                onClick={() => setFormFoodType('EGG')}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  formFoodType === 'EGG'
                    ? 'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <span className="w-3.5 h-3.5 border-2 border-amber-600 rounded-sm flex items-center justify-center p-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 block"></span>
                </span>
                Egg
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Fresh toppings, spices, ingredients..."
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Image URL (Optional)
            </label>
            <input
              type="url"
              value={formImage}
              onChange={(e) => setFormImage(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          {/* Variants Checkbox & Section */}
          <div className="pt-2 border-t border-slate-200">
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={hasVariants}
                onChange={(e) => setHasVariants(e.target.checked)}
                className="rounded text-brand-600 focus:ring-brand-500"
              />
              <span className="text-xs font-bold text-slate-800">
                This product has Size / Style variants (e.g. Small, Medium, Large)
              </span>
            </label>

            {hasVariants && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <input
                  type="text"
                  value={variantGroupName}
                  onChange={(e) => setVariantGroupName(e.target.value)}
                  placeholder="Variant Group Name (e.g. Size, Crust, Portions)"
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300"
                />

                <div className="space-y-1.5">
                  {variantOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={opt.name}
                        onChange={(e) => {
                          const updated = [...variantOptions];
                          updated[idx].name = e.target.value;
                          setVariantOptions(updated);
                        }}
                        placeholder="Option name (e.g. Regular)"
                        className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300"
                      />
                      <input
                        type="number"
                        value={opt.priceModifier}
                        onChange={(e) => {
                          const updated = [...variantOptions];
                          updated[idx].priceModifier = parseFloat(e.target.value) || 0;
                          setVariantOptions(updated);
                        }}
                        placeholder="+ Price modifier (e.g. 100)"
                        className="w-28 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300"
                      />
                      <button
                        type="button"
                        onClick={() => setVariantOptions(variantOptions.filter((_, i) => i !== idx))}
                        className="text-rose-500 text-xs px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setVariantOptions([...variantOptions, { name: 'New Option', priceModifier: 50 }])
                    }
                    className="text-xs text-brand-600 font-bold hover:underline"
                  >
                    + Add Option
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Add-ons Checkbox & Section */}
          <div className="pt-2 border-t border-slate-200">
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={hasAddons}
                onChange={(e) => setHasAddons(e.target.checked)}
                className="rounded text-brand-600 focus:ring-brand-500"
              />
              <span className="text-xs font-bold text-slate-800">
                Offer Add-ons & Extras (e.g. Extra Cheese +₹50, Dips +₹25)
              </span>
            </label>

            {hasAddons && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                {addonsList.map((addon, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={addon.name}
                      onChange={(e) => {
                        const updated = [...addonsList];
                        updated[idx].name = e.target.value;
                        setAddonsList(updated);
                      }}
                      placeholder="Addon name (e.g. Extra Sauce)"
                      className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300"
                    />
                    <input
                      type="number"
                      value={addon.price}
                      onChange={(e) => {
                        const updated = [...addonsList];
                        updated[idx].price = parseFloat(e.target.value) || 0;
                        setAddonsList(updated);
                      }}
                      placeholder="Price (₹)"
                      className="w-24 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() => setAddonsList(addonsList.filter((_, i) => i !== idx))}
                      className="text-rose-500 text-xs px-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setAddonsList([...addonsList, { name: 'Extra Cheese', price: 50 }])}
                  className="text-xs text-brand-600 font-bold hover:underline"
                >
                  + Add Extra Add-on
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
            >
              {isSubmitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
