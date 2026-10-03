import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Check,
  ShieldCheck,
  Download,
  Calendar,
  Sparkles,
  Key,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Terminal,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../utils/api';

export const BillingPage: React.FC = () => {
  const { currentBusiness } = useAuthStore();
  const [billingData, setBillingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Stripe Test States
  const [stripeTesting, setStripeTesting] = useState(false);
  const [stripeTestResult, setStripeTestResult] = useState<any>(null);
  const [stripeTestEmail, setStripeTestEmail] = useState('jenny.rosen@example.com');
  const [stripeTestError, setStripeTestError] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const loadBilling = async () => {
    if (!currentBusiness) return;
    setIsLoading(true);
    try {
      const data = await api.get<any>(`/billing/${currentBusiness.id}`);
      setBillingData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBilling();
  }, [currentBusiness]);

  const handleSwitchPlan = async (plan: string) => {
    if (!currentBusiness) return;
    setIsUpdating(true);
    try {
      await api.post(`/billing/${currentBusiness.id}/change-plan`, { plan });
      await loadBilling();
      alert('Subscription plan updated!');
    } catch (err: any) {
      alert(err.message || 'Failed to update plan');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRunStripeTest = async () => {
    setStripeTesting(true);
    setStripeTestError(null);
    setStripeTestResult(null);
    try {
      const res = await api.post<any>('/billing/stripe/test-customer', {
        email: stripeTestEmail.trim() || 'jenny.rosen@example.com',
        name: 'Jenny Rosen',
        paymentMethod: 'pm_card_visa',
      });
      setStripeTestResult(res);
    } catch (err: any) {
      setStripeTestError(err.message || 'Failed to call Stripe API');
    } finally {
      setStripeTesting(false);
    }
  };

  const handleStripeCheckout = async (plan: 'PRO_MONTHLY' | 'PRO_YEARLY') => {
    if (!currentBusiness) return;
    setIsCheckingOut(true);
    try {
      const res = await api.post<{ sessionId: string; url: string }>(
        `/billing/${currentBusiness.id}/stripe/checkout-session`,
        { plan }
      );
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (err: any) {
      alert(err.message || 'Stripe Checkout generation failed');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (isLoading || !billingData || !currentBusiness) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Subscription & Invoices
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Simple, honest pricing for Indian merchants: ₹1,999 setup + ₹299/month. Zero commissions on sales.
        </p>
      </div>

      {/* Plan Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-7 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
              ACTIVE PLAN
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Renews {new Date(billingData.renewalDate).toLocaleDateString()}
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900">{billingData.name}</h2>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-extrabold text-slate-900">₹{billingData.monthlyPrice}</span>
              <span className="text-xs text-slate-500 font-semibold">/ month</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              One-time setup fee: ₹{billingData.setupFee} (Paid)
            </div>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
            {billingData.features.map((f: string) => (
              <li key={f} className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Upgrade / Annual savings box */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 space-y-4 shadow-md">
          <div className="flex items-center gap-2 text-brand-400 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            Switch to Annual & Save
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Get 2 months free with our Annual Subscription at ₹2,990/year instead of ₹3,588/year.
          </p>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleSwitchPlan('PRO_YEARLY')}
              disabled={isUpdating}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm transition-all text-center border border-slate-700"
            >
              Switch Plan (Manual)
            </button>
            <button
              onClick={() => handleStripeCheckout('PRO_YEARLY')}
              disabled={isCheckingOut}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm transition-all text-center flex items-center justify-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{isCheckingOut ? 'Opening Stripe...' : 'Pay with Stripe (₹2,990/yr)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stripe Payment & Testing Console */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <h3 className="font-extrabold text-base text-slate-900">
                Stripe Payments & Testing Console
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live testing environment configured with your Stripe API key.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {billingData.stripe?.maskedKey || 'sk_test_...4drZy'}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              Test Mode
            </span>
          </div>
        </div>

        {/* Deploy Note */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
          <Key className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-slate-800">Production Deployment Instructions:</span>
            <p>
              Your application is architected so that when deploying to production, you <strong>only need to change the API key</strong> in your environment configuration (<code>STRIPE_SECRET_KEY="sk_live_..."</code> in <code>server/.env</code>). No code changes are required!
            </p>
          </div>
        </div>

        {/* Test Customer Generator (User's exact testing code) */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-slate-500" />
              Stripe Customer Creation Test (pm_card_visa)
            </span>
            <span className="text-[11px] text-slate-400">Creates customer & attaches default Visa test card</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="email"
                value={stripeTestEmail}
                onChange={(e) => setStripeTestEmail(e.target.value)}
                placeholder="jenny.rosen@example.com"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleRunStripeTest}
              disabled={stripeTesting}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all"
            >
              {stripeTesting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Calling Stripe API...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run Stripe Test Customer API</span>
                </>
              )}
            </button>
          </div>

          {stripeTestError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{stripeTestError}</span>
            </div>
          )}

          {stripeTestResult && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Stripe API Response: Customer Created Successfully!</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                  <span className="text-slate-400 block text-[10px]">CUSTOMER ID</span>
                  <span className="font-bold text-slate-800">{stripeTestResult.data.id}</span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                  <span className="text-slate-400 block text-[10px]">EMAIL</span>
                  <span className="font-bold text-slate-800">{stripeTestResult.data.email}</span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                  <span className="text-slate-400 block text-[10px]">PAYMENT METHOD</span>
                  <span className="font-bold text-slate-800">{stripeTestResult.data.defaultPaymentMethod}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invoices History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h3 className="font-bold text-base text-slate-900">Billing History & GST Invoices</h3>
          <p className="text-xs text-slate-500">Download past subscription receipts and invoices</p>
        </div>

        <div className="divide-y divide-slate-100">
          {billingData.invoices.map((inv: any) => (
            <div key={inv.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50">
              <div>
                <div className="font-bold text-slate-900">{inv.description}</div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  Invoice ID: {inv.id} • Date: {inv.date}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-bold text-slate-900">₹{inv.amount}</div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {inv.status}
                  </span>
                </div>
                <button
                  onClick={() => alert(`Downloading invoice ${inv.id}...`)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                  title="Download receipt"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
