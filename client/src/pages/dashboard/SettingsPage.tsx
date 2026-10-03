import React, { useState, useEffect } from 'react';
import {
  Settings,
  Phone,
  Palette,
  Clock,
  Save,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { BusinessHours, Business } from '../../types';
import { api } from '../../utils/api';

type Tab = 'general' | 'whatsapp' | 'appearance' | 'hours';

export const SettingsPage: React.FC = () => {
  const { currentBusiness, updateBusinessState } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('general');

  // General Settings
  const [name, setName] = useState(currentBusiness?.name || '');
  const [category, setCategory] = useState(currentBusiness?.category || 'Restaurant');
  const [address, setAddress] = useState(currentBusiness?.address || '');
  const [city, setCity] = useState(currentBusiness?.city || '');
  const [isTaxEnabled, setIsTaxEnabled] = useState(currentBusiness?.isTaxEnabled || false);
  const [taxRate, setTaxRate] = useState(currentBusiness?.taxRate || 5);
  const [deliveryFee, setDeliveryFee] = useState(currentBusiness?.deliveryFee || 0);
  const [minOrderAmount, setMinOrderAmount] = useState(currentBusiness?.minOrderAmount || 0);
  const [dietaryType, setDietaryType] = useState<'PURE_VEG' | 'VEG_NON_VEG' | 'NON_VEG'>(
    currentBusiness?.dietaryType || 'VEG_NON_VEG'
  );

  // WhatsApp
  const [whatsappNumber, setWhatsappNumber] = useState(currentBusiness?.whatsappNumber || '');

  // Appearance
  const [primaryColor, setPrimaryColor] = useState(currentBusiness?.primaryColor || '#10b981');
  const [secondaryColor, setSecondaryColor] = useState(currentBusiness?.secondaryColor || '#065f46');
  const [logo, setLogo] = useState(currentBusiness?.logo || '');
  const [coverImage, setCoverImage] = useState(currentBusiness?.coverImage || '');

  // Hours
  const [hours, setHours] = useState<BusinessHours[]>([]);

  // Status
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!currentBusiness) return;
    setName(currentBusiness.name);
    setCategory(currentBusiness.category);
    setAddress(currentBusiness.address || '');
    setCity(currentBusiness.city || '');
    setIsTaxEnabled(currentBusiness.isTaxEnabled);
    setTaxRate(currentBusiness.taxRate);
    setDeliveryFee(currentBusiness.deliveryFee);
    setMinOrderAmount(currentBusiness.minOrderAmount);
    setDietaryType(currentBusiness.dietaryType || 'VEG_NON_VEG');
    setWhatsappNumber(currentBusiness.whatsappNumber);
    setPrimaryColor(currentBusiness.primaryColor);
    setSecondaryColor(currentBusiness.secondaryColor);
    setLogo(currentBusiness.logo || '');
    setCoverImage(currentBusiness.coverImage || '');

    const loadHours = async () => {
      try {
        const res = await api.get<BusinessHours[]>(`/business/${currentBusiness.id}/hours`);
        if (res.length > 0) {
          setHours(res);
        } else {
          // Initialize 7 days
          const defaults: BusinessHours[] = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
            id: `temp-${day}`,
            businessId: currentBusiness.id,
            dayOfWeek: day,
            isOpen: true,
            openTime: '10:00',
            closeTime: '22:00',
          }));
          setHours(defaults);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadHours();
  }, [currentBusiness]);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBusiness) return;
    setIsSaving(true);
    setFeedback(null);
    try {
      const updated = await api.put<Business>(`/business/${currentBusiness.id}`, {
        name,
        category,
        address,
        city,
        isTaxEnabled,
        taxRate: Number(taxRate),
        deliveryFee: Number(deliveryFee),
        minOrderAmount: Number(minOrderAmount),
        dietaryType,
      });
      updateBusinessState(updated);
      setFeedback({ type: 'success', message: 'General settings saved successfully.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBusiness) return;
    setIsSaving(true);
    setFeedback(null);
    try {
      const updated = await api.put<{ whatsappNumber: string }>(`/business/${currentBusiness.id}/whatsapp`, {
        whatsappNumber,
      });
      updateBusinessState({ whatsappNumber: updated.whatsappNumber });
      setFeedback({ type: 'success', message: 'WhatsApp number verified and updated successfully.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update WhatsApp number.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAppearance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBusiness) return;
    setIsSaving(true);
    setFeedback(null);
    try {
      const updated = await api.put<Business>(`/business/${currentBusiness.id}/appearance`, {
        primaryColor,
        secondaryColor,
        logo: logo.trim() || null,
        coverImage: coverImage.trim() || null,
      });
      updateBusinessState(updated);
      setFeedback({ type: 'success', message: 'Appearance settings saved.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update appearance.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveHours = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBusiness) return;
    setIsSaving(true);
    setFeedback(null);
    try {
      const updated = await api.put<BusinessHours[]>(`/business/${currentBusiness.id}/hours`, {
        hours,
      });
      setHours(updated);
      setFeedback({ type: 'success', message: 'Business hours and schedule saved.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update hours.' });
    } finally {
      setIsSaving(false);
    }
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Store Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure business details, WhatsApp ordering number, brand colors, and operating hours.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'general', label: 'General & Pricing', icon: Settings },
          { id: 'whatsapp', label: 'WhatsApp Number', icon: Phone },
          { id: 'appearance', label: 'Theme & Branding', icon: Palette },
          { id: 'hours', label: 'Opening Hours', icon: Clock },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => {
                setActiveTab(t.id as Tab);
                setFeedback(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: General */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveGeneral} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Business Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
              >
                <option value="Restaurant">Restaurant</option>
                <option value="Cafe">Cafe</option>
                <option value="Salon">Salon</option>
                <option value="Grocery">Grocery</option>
                <option value="SweetShop">Sweet Shop</option>
                <option value="RepairShop">Repair Shop</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Restaurant Food Type / Dietary Classification */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Restaurant Food Type / Dietary Classification
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Set whether your business is 100% Pure Vegetarian or serves Non-Vegetarian food. This displays an official badge on your customer digital menu.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setDietaryType('PURE_VEG')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  dietaryType === 'PURE_VEG'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border border-emerald-600 p-0.5 rounded-sm flex items-center justify-center flex-shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  </span>
                  <span className="font-extrabold text-xs text-emerald-950">100% Pure Veg</span>
                </div>
                <p className="text-[11px] text-emerald-800 mt-1">Strict vegetarian, no meat or eggs</p>
              </button>

              <button
                type="button"
                onClick={() => setDietaryType('VEG_NON_VEG')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  dietaryType === 'VEG_NON_VEG'
                    ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <span className="w-3.5 h-3.5 border border-emerald-600 p-0.5 rounded-sm flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    </span>
                    <span className="w-3.5 h-3.5 border border-rose-600 p-0.5 rounded-sm flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                    </span>
                  </span>
                  <span className="font-extrabold text-xs text-slate-900">Veg & Non-Veg</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Both vegetarian & non-veg options</p>
              </button>

              <button
                type="button"
                onClick={() => setDietaryType('NON_VEG')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  dietaryType === 'NON_VEG'
                    ? 'border-rose-600 bg-rose-50/70 ring-2 ring-rose-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border border-rose-600 p-0.5 rounded-sm flex items-center justify-center flex-shrink-0">
                    <span className="w-2 h-2 rounded-full bg-rose-600" />
                  </span>
                  <span className="font-extrabold text-xs text-rose-950">Non-Veg Specialty</span>
                </div>
                <p className="text-[11px] text-rose-800 mt-1">Chicken, mutton, seafood, etc.</p>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Taxes & Charges (Zero Hidden Fee)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={isTaxEnabled}
                    onChange={(e) => setIsTaxEnabled(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-xs font-bold text-slate-800">Enable Tax / GST</span>
                </label>
                {isTaxEnabled && (
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Tax Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Delivery Fee (₹)
                </label>
                <input
                  type="number"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Min Order Amount (₹)
                </label>
                <input
                  type="number"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: WhatsApp Number */}
      {activeTab === 'whatsapp' && (
        <form onSubmit={handleSaveWhatsApp} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              WhatsApp Order Receiving Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="e.g. +91 9876543210 or 9876543210"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono"
            />
            <p className="text-xs text-slate-500 mt-1">
              Supports Indian formats with or without country code. We normalize it automatically.
            </p>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
            <p className="font-bold">Test Message Preview:</p>
            <p className="font-mono text-[11px] bg-white p-2.5 rounded-lg border border-emerald-200">
              *New Order for {name}* 🛍️<br />
              Order ID: *#ABC-1024*<br />
              Subtotal: ₹650<br />
              Customer: Rahul
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Verifying...' : 'Save WhatsApp Number'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: Appearance & Branding */}
      {activeTab === 'appearance' && (
        <form onSubmit={handleSaveAppearance} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Brand Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="text-xs px-3 py-2 rounded-xl border border-slate-300 w-full font-mono uppercase"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Secondary Accent Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-12 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="text-xs px-3 py-2 rounded-xl border border-slate-300 w-full font-mono uppercase"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Logo URL</label>
            <input
              type="url"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Cover Image URL</label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Branding'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: Business Hours with Split Shifts */}
      {activeTab === 'hours' && (
        <form onSubmit={handleSaveHours} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="text-xs text-slate-500">
            Set your daily operating hours. When closed, customers cannot place orders. Supports lunch & dinner split shifts.
          </div>

          <div className="space-y-3">
            {hours.map((h, idx) => (
              <div
                key={h.dayOfWeek}
                className="p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="w-28 font-bold text-slate-900">{dayNames[h.dayOfWeek]}</div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={h.isOpen}
                      onChange={(e) => {
                        const updated = [...hours];
                        updated[idx].isOpen = e.target.checked;
                        setHours(updated);
                      }}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <span className="font-semibold">{h.isOpen ? 'Open' : 'Closed'}</span>
                  </label>
                </div>

                {h.isOpen && (
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">Shift 1:</span>
                      <input
                        type="time"
                        value={h.openTime}
                        onChange={(e) => {
                          const updated = [...hours];
                          updated[idx].openTime = e.target.value;
                          setHours(updated);
                        }}
                        className="px-2 py-1 rounded border border-slate-300"
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={h.closeTime}
                        onChange={(e) => {
                          const updated = [...hours];
                          updated[idx].closeTime = e.target.value;
                          setHours(updated);
                        }}
                        className="px-2 py-1 rounded border border-slate-300"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Hours'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
