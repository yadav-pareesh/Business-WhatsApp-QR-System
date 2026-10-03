import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  QrCode,
  Sparkles,
  Phone,
  Building,
  Palette,
  ShoppingBag,
  Download,
  Printer,
  Copy,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../utils/api';
import { BUSINESS_PRESETS } from '../../utils/presets';
import { generateQrDataUrl, generateQrSvg, downloadDataUrl, downloadSvg } from '../../utils/qr';

export const OnboardWizardPage: React.FC = () => {
  const { user, login } = useAuthStore();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('Restaurant');
  const [dietaryType, setDietaryType] = useState<'PURE_VEG' | 'VEG_NON_VEG' | 'NON_VEG'>('VEG_NON_VEG');
  const [phone, setPhone] = useState(user?.phone || '');
  const [whatsappNumber, setWhatsappNumber] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [pinCode, setPinCode] = useState('');
  const [openingHoursText, setOpeningHoursText] = useState('10:00 AM - 10:00 PM');

  const [primaryColor, setPrimaryColor] = useState('#10b981');
  const [secondaryColor, setSecondaryColor] = useState('#065f46');
  const [logo, setLogo] = useState('');
  const [coverImage, setCoverImage] = useState('');

  // Selected Preset catalog items
  const [usePresetCatalog, setUsePresetCatalog] = useState(true);

  // Created QR Details for Step 6
  const [createdBusinessSlug, setCreatedBusinessSlug] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrSvg, setQrSvg] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const selectedPreset = BUSINESS_PRESETS[category] || BUSINESS_PRESETS.Restaurant;

  const handleNextStep = () => {
    setErrorMessage(null);
    if (step === 1) {
      if (!businessName.trim() || !phone.trim() || !whatsappNumber.trim()) {
        setErrorMessage('Please fill in business name, contact phone, and WhatsApp number.');
        return;
      }
    }
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setErrorMessage(null);
    setStep(Math.max(1, step - 1));
  };

  const handleCompleteOnboarding = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const initialCategories = usePresetCatalog ? selectedPreset.sampleCategories : [];

      const payload = {
        name: businessName.trim(),
        category,
        phone: phone.trim(),
        whatsappNumber: whatsappNumber.trim(),
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        pinCode: pinCode.trim() || undefined,
        openingHoursText: openingHoursText.trim() || undefined,
        logo: logo.trim() || undefined,
        coverImage: coverImage.trim() || undefined,
        primaryColor,
        secondaryColor,
        dietaryType,
        initialCategories,
      };

      const res = await api.post<{ business: any; publicUrl: string }>('/business/onboard', payload);
      setCreatedBusinessSlug(res.business.slug);

      // Generate QR Code assets
      const fullUrl = `${window.location.origin}/business/${res.business.slug}`;
      const dataUrl = await generateQrDataUrl(fullUrl);
      const svg = await generateQrSvg(fullUrl);
      setQrDataUrl(dataUrl);
      setQrSvg(svg);

      // Move to Step 6 (Celebration)
      setStep(6);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Refresh auth user businesses in background
      const profile = await api.get<{ user: any; businesses: any[] }>('/auth/me');
      const token = localStorage.getItem('bwqr_auth_token') || '';
      login(token, profile.user, profile.businesses);
    } catch (err: any) {
      setErrorMessage(err.message || 'Onboarding failed. Please review your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}/business/${createdBusinessSlug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleShare = () => {
    const fullUrl = `${window.location.origin}/business/${createdBusinessSlug}`;
    if (navigator.share) {
      navigator.share({
        title: businessName,
        text: `Check out our digital menu & order on WhatsApp!`,
        url: fullUrl,
      });
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto w-full">
        {/* Wizard Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Quick 2-Minute Setup for Indian Businesses
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Set Up Your Digital QR Menu
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Step {step} of 6 — {
              step === 1
                ? 'Basic Information'
                : step === 2
                ? 'Store Location & Timings'
                : step === 3
                ? 'Branding & Theme'
                : step === 4
                ? 'Initial Catalog'
                : step === 5
                ? 'Verify WhatsApp'
                : 'QR Ready!'
            }
          </p>

          {/* Stepper Progress Bar */}
          <div className="flex items-center justify-center gap-2 mt-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step
                    ? 'w-8 bg-brand-600'
                    : i < step
                    ? 'w-4 bg-emerald-500'
                    : 'w-4 bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Wizard Card Body */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6 sm:p-8">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              {errorMessage}
            </div>
          )}

          {/* STEP 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Step 1: Business Information</h2>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business / Store Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Chai Point Cafe, Royal Sweets, Sharma Medical"
                  className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                >
                  <option value="Restaurant">Restaurant / Dine-in</option>
                  <option value="Cafe">Cafe & Coffee Shop</option>
                  <option value="Salon">Salon & Spa / Beauty Parlour</option>
                  <option value="Grocery">Grocery / Kirana Store</option>
                  <option value="SweetShop">Sweet Shop & Bakery</option>
                  <option value="RepairShop">Repair & Electronics Shop</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  We pre-tune order fields and categories according to your category.
                </p>
              </div>

              {['Restaurant', 'Cafe', 'SweetShop'].includes(category) && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Dietary Classification (Restaurant Type)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setDietaryType('PURE_VEG')}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                        dietaryType === 'PURE_VEG'
                          ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                        <span className="w-3.5 h-3.5 border-2 border-emerald-600 rounded-sm flex items-center justify-center p-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 block"></span>
                        </span>
                        100% Pure Veg
                      </div>
                      <p className="text-[11px] text-slate-500">Only vegetarian food served</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDietaryType('VEG_NON_VEG')}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                        dietaryType === 'VEG_NON_VEG'
                          ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                        <span className="w-3.5 h-3.5 border-2 border-emerald-600 rounded-sm flex items-center justify-center p-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 block"></span>
                        </span>
                        <span className="w-3.5 h-3.5 border-2 border-rose-700 rounded-sm flex items-center justify-center p-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-700 block"></span>
                        </span>
                        Veg & Non-Veg
                      </div>
                      <p className="text-[11px] text-slate-500">Both veg & non-veg options</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDietaryType('NON_VEG')}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                        dietaryType === 'NON_VEG'
                          ? 'border-rose-500 bg-rose-50/60 ring-2 ring-rose-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                        <span className="w-3.5 h-3.5 border-2 border-rose-700 rounded-sm flex items-center justify-center p-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-700 block"></span>
                        </span>
                        Non-Veg Specialty
                      </div>
                      <p className="text-[11px] text-slate-500">Primarily non-veg cuisine</p>
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Calling Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    WhatsApp Number (for receiving orders) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Store Email (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@yourbusiness.com"
                  className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Address & Timings */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Step 2: Store Location & Timings</h2>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Street Address / Shop Number
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Shop No. 12, Main Market Road"
                  className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bengaluru"
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Karnataka"
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="560038"
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Display Opening Hours
                </label>
                <input
                  type="text"
                  value={openingHoursText}
                  onChange={(e) => setOpeningHoursText(e.target.value)}
                  placeholder="e.g. 10:00 AM - 10:30 PM (All days)"
                  className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Branding */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Step 3: Branding & Colors</h2>
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
                      className="text-sm px-3 py-2 rounded-xl border border-slate-300 w-full font-mono uppercase"
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
                      className="text-sm px-3 py-2 rounded-xl border border-slate-300 w-full font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Logo Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Header Cover Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://example.com/storefront.jpg"
                  className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Initial Catalog */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Step 4: Initial Catalog Setup</h2>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={usePresetCatalog}
                    onChange={(e) => setUsePresetCatalog(e.target.checked)}
                    className="mt-1 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <span className="font-bold text-sm text-slate-900">
                      Pre-load starter sample categories for {selectedPreset.name}
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      We will populate your menu with standard sample items ({selectedPreset.sampleCategories.map(c => c.name).join(', ')}). You can easily edit or delete them anytime in your dashboard.
                    </p>
                  </div>
                </label>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-white">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  What gets created:
                </h4>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                  {selectedPreset.sampleCategories.map((cat) => (
                    <li key={cat.name}>
                      <span className="font-semibold text-slate-800">{cat.name}</span> — {cat.products.length} sample items
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* STEP 5: Verify WhatsApp */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Step 5: Verify WhatsApp Number</h2>
              <p className="text-xs text-slate-500">
                This is the exact number where customers will send structured orders directly.
              </p>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-emerald-800">Target WhatsApp Number</div>
                  <div className="text-lg font-extrabold text-emerald-900 font-mono">
                    +91 {whatsappNumber}
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                <p className="font-semibold text-slate-700">How ordering works:</p>
                <p>1. Customer scans your physical QR code with their mobile phone.</p>
                <p>2. Customer browses your items, customizes options, and taps "Order on WhatsApp".</p>
                <p>3. WhatsApp automatically opens with a formatted order ready to send to this number!</p>
              </div>
            </div>
          )}

          {/* STEP 6: QR Ready Celebration */}
          {step === 6 && (
            <div className="text-center space-y-6 py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-900">Your Business QR is Ready! 🎉</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Customers can now scan this QR code to access your digital catalog.
                </p>
              </div>

              {/* QR Image Canvas Display */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 max-w-xs mx-auto flex flex-col items-center">
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="Your Business QR"
                    className="w-48 h-48 rounded-xl shadow-sm bg-white p-2"
                  />
                )}
                <div className="text-xs font-bold text-slate-900 mt-3">{businessName}</div>
                <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                  /business/{createdBusinessSlug}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-lg mx-auto">
                <button
                  onClick={() => downloadDataUrl(qrDataUrl, `${createdBusinessSlug}-qr.png`)}
                  className="p-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex flex-col items-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4 text-brand-600" />
                  Download PNG
                </button>
                <button
                  onClick={() => downloadSvg(qrSvg, `${createdBusinessSlug}-qr.svg`)}
                  className="p-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex flex-col items-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4 text-brand-600" />
                  Download SVG
                </button>
                <button
                  onClick={handleCopyLink}
                  className="p-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex flex-col items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-4 h-4 text-brand-600" />
                  {copySuccess ? 'Copied!' : 'Copy Link'}
                </button>
                <button
                  onClick={handleShare}
                  className="p-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex flex-col items-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-4 h-4 text-brand-600" />
                  Share Store
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`/business/${createdBusinessSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Preview Public Store
                </a>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20"
                >
                  Open Business Dashboard →
                </button>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          {step < 6 && (
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePreviousStep}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <div />
              )}

              {step < 5 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleCompleteOnboarding}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-brand-500/20"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating QR...</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4" />
                      <span>Finish & Generate QR</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
