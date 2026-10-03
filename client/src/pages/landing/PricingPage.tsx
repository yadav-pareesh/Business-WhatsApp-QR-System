import React from 'react';
import { Link } from 'react-router-dom';
import { Check, X, ShieldCheck, ArrowRight, HelpCircle } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export const PricingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full">
            Honest & Predictable
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-3">
            Zero Commission. Flat Subscription.
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
            Stop giving away 20% to 30% of your revenue. Own your customer relationships directly on WhatsApp.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="bg-white rounded-3xl border-2 border-brand-500 shadow-floating p-8 sm:p-12 mb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-brand-600 text-white font-black text-xs uppercase px-4 py-1.5 rounded-bl-2xl">
            Commercial SaaS Plan
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pb-8 border-b border-slate-100">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Merchant Growth Plan</h2>
              <p className="text-xs text-slate-500 mt-1">
                Everything you need to launch professional digital ordering.
              </p>
            </div>

            <div className="text-left md:text-right">
              <div className="flex items-baseline md:justify-end gap-1.5">
                <span className="text-4xl sm:text-5xl font-black text-slate-900">₹299</span>
                <span className="text-slate-500 text-sm font-semibold">/ month</span>
              </div>
              <div className="text-xs font-bold text-brand-700 mt-1">
                ₹1,999 one-time onboarding & digital menu setup
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-slate-700 font-medium">
            {[
              'Unlimited QR Scans & Visitors',
              'Unlimited Direct WhatsApp Orders',
              'Zero Commission on any order value',
              'Print-Ready QR Designer (Table & Counter)',
              'Variants (Portion sizes, Crusts)',
              'Add-on modifiers (Extra cheese, dips)',
              'Real-time Store Open/Closed toggle',
              'Operating hours & split shifts support',
              'Sales & scan analytics dashboard',
              'Customer phone numbers stay with you',
            ].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>{f}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Cancel anytime. No lock-in period. Instant WhatsApp ordering.
            </div>
            <Link
              to="/register"
              className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white font-bold px-8 py-3.5 rounded-xl text-sm shadow-md transition-all text-center"
            >
              Get Started for ₹1,999
            </Link>
          </div>
        </div>

        {/* Aggregator Comparison Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-16">
          <div className="p-6 border-b border-slate-200">
            <h3 className="font-extrabold text-base text-slate-900">
              Why Indian Merchants Choose WhatsApp QR
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparison with typical food aggregator and table ordering platforms
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Feature</th>
                  <th className="p-4 text-brand-700">Business WhatsApp QR</th>
                  <th className="p-4 text-slate-500">Traditional Aggregators</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-4 font-semibold text-slate-900">Per-Order Commission</td>
                  <td className="p-4 font-bold text-emerald-600">0% (Zero)</td>
                  <td className="p-4 text-rose-600">20% to 30% per order</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-900">Customer Data Ownership</td>
                  <td className="p-4 font-bold text-emerald-600">100% Direct on WhatsApp</td>
                  <td className="p-4 text-slate-500">Masked / Withheld</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-900">Payment Payouts</td>
                  <td className="p-4 font-bold text-emerald-600">Instant direct to merchant</td>
                  <td className="p-4 text-slate-500">Delayed 7 to 14 days</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-900">App Download Needed</td>
                  <td className="p-4 font-bold text-emerald-600">No (Instant mobile web)</td>
                  <td className="p-4 text-slate-500">Requires heavy app install</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-900">Monthly Cost</td>
                  <td className="p-4 font-bold text-brand-700">Flat ₹299/mo</td>
                  <td className="p-4 text-rose-600">₹15,000+ in commissions</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
