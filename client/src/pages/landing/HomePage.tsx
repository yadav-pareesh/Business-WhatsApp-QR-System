import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  QrCode,
  Smartphone,
  Send,
  ShieldCheck,
  Check,
  ArrowRight,
  TrendingDown,
  Sparkles,
  UtensilsCrossed,
  Coffee,
  ShoppingBag,
  Scissors,
  Wrench,
  Cake,
  DollarSign,
  ChevronDown,
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const businessTypes = [
    { name: 'Restaurants & Dine-in', icon: UtensilsCrossed, desc: 'Table ordering, room service, takeaway' },
    { name: 'Cafes & Bakeries', icon: Coffee, desc: 'Brewed coffee, pastries, sandwiches' },
    { name: 'Sweet & Mithai Shops', icon: Cake, desc: 'Festival gift boxes, fresh sweets, snacks' },
    { name: 'Kirana & Grocery', icon: ShoppingBag, desc: 'Daily essentials, home delivery lists' },
    { name: 'Salons & Spas', icon: Scissors, desc: 'Service menu, appointment requests' },
    { name: 'Repair & Electronics', icon: Wrench, desc: 'Device issue intake, repair quotes' },
  ];

  const faqs = [
    {
      q: 'Does my customer need to download an app or create an account?',
      a: 'No! Customers simply open their regular phone camera, point it at your QR code, and your digital menu opens instantly in their browser. They build an order and tap "Order on WhatsApp", which launches their standard WhatsApp app.',
    },
    {
      q: 'Why pay ₹1,999 setup + ₹299/month instead of food aggregator apps?',
      a: 'Food aggregators charge 20% to 30% commission on every single order you take. With Business WhatsApp QR, you pay a flat ₹299/month and keep 100% of your earnings. Orders and customer phone numbers belong entirely to you.',
    },
    {
      q: 'Can I change my prices or products without printing a new QR code?',
      a: 'Yes, absolutely! Your printed QR code links to a stable web address. When you change prices, add dishes, or toggle sold-out items from your dashboard, the changes show up instantly for customers scanning your existing QR.',
    },
    {
      q: 'How does WhatsApp ordering work?',
      a: 'When a customer taps "Order on WhatsApp", our system calculates the verified order total and opens WhatsApp with a pre-filled, cleanly formatted message containing their items, table number or address, and cooking notes. The customer hits send, and you receive it directly!',
    },
    {
      q: 'Is it simple enough for a non-technical shop owner?',
      a: 'Yes! We designed the entire onboarding flow in 6 simple steps. It takes under 2 minutes. You can pick standard sample items for your business type, verify your WhatsApp number, and immediately download ready-to-print QR cards.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>0% Commission • Keep 100% of your profits</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Turn WhatsApp Into Your <br />
            <span className="text-brand-600 bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-emerald-500">
              Digital Ordering System
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Let customers scan your table or counter QR, browse your products, build their cart, and send structured orders directly to your WhatsApp in 1-click.
          </p>

          {/* Pricing Highlight Pill */}
          <div className="mt-4 flex items-center justify-center gap-3 text-xs sm:text-sm font-semibold text-slate-700">
            <span className="bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-subtle">
              Setup: <span className="font-bold text-slate-900">₹1,999</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-subtle">
              Subscription: <span className="font-bold text-brand-600">₹299 / month</span>
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-brand-600/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              Create Your Business QR
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/demo"
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 font-bold px-7 py-3.5 rounded-xl border border-slate-200 shadow-sm transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Smartphone className="w-4 h-4 text-brand-600" />
              View Interactive Demo
            </Link>
          </div>

          {/* Customer Journey Graphic Preview */}
          <div className="mt-14 max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-floating text-left">
            <div className="text-center mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full">
                Simple Customer Journey
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                Scan → Select → WhatsApp Order
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Step 1 */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <QrCode className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase">Step 1</div>
                <h3 className="font-extrabold text-slate-900 text-sm">Customer Scans QR</h3>
                <p className="text-xs text-slate-500">
                  Point any smartphone camera at your table tent or counter stand. No app install needed.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase">Step 2</div>
                <h3 className="font-extrabold text-slate-900 text-sm">Browse & Customize</h3>
                <p className="text-xs text-slate-500">
                  Browse photos, select portion sizes, choose toppings, and review live price totals.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-emerald-50/70 rounded-2xl p-5 border border-emerald-200 flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
                  <Send className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-emerald-700 uppercase">Step 3</div>
                <h3 className="font-extrabold text-emerald-950 text-sm">Send on WhatsApp</h3>
                <p className="text-xs text-emerald-700">
                  WhatsApp opens with a clean, pre-filled message with order items, table number & total!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Business Types Grid */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full">
              Versatile Platform
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Built For All Local Businesses
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Flexible order fields and catalogs adapt to dining, takeaways, appointments, or deliveries.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {businessTypes.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.name}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-brand-500/50 hover:shadow-card transition-all flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{b.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full">
            Transparent Pricing
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            Zero Commissions. Affordable SaaS.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Say goodbye to 30% platform cuts. Keep every rupee your hard work earns.
          </p>

          <div className="mt-10 bg-white rounded-3xl border-2 border-brand-500 p-8 sm:p-10 shadow-floating text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-brand-600 text-white font-extrabold text-[11px] uppercase tracking-wider px-4 py-1.5 rounded-bl-2xl">
              Most Popular
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Pro WhatsApp QR</h3>
                <p className="text-xs text-slate-500 mt-1">Complete digital ordering setup for one store</p>
              </div>

              <div className="text-left sm:text-right">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">₹299</span>
                  <span className="text-xs font-semibold text-slate-500">/ month</span>
                </div>
                <div className="text-xs font-semibold text-brand-700 mt-0.5">
                  ₹1,999 one-time assisted onboarding
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 font-medium">
              {[
                'Unlimited QR code scans',
                'Unlimited direct WhatsApp orders',
                '0% commission on all sales',
                'Print-Ready QR Designer (Table & Wall)',
                'Size variants & Add-on modifiers',
                'Real-time Store Open/Closed switch',
                'Daily hours & split shift timings',
                'Live sales & conversion analytics',
                'Custom brand colors & store logo',
                'Instant WhatsApp message generation',
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                Cancel anytime. No lock-in contracts or surprise deductions.
              </div>
              <Link
                to="/register"
                className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white font-bold px-8 py-3 rounded-xl text-sm shadow-md transition-all text-center"
              >
                Start Onboarding Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-slate-900">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-500 mt-1">Everything you need to know about setting up your QR menu</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="border border-slate-200 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left font-bold text-sm text-slate-900 flex items-center justify-between gap-3 hover:bg-slate-50"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isOpen ? 'rotate-180 text-brand-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="bg-slate-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Ready to receive direct WhatsApp orders today?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Set up your digital catalog in under 2 minutes. No technical background required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition-all"
            >
              Get Started for ₹1,999
            </Link>
            <Link
              to="/demo"
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-6 py-3.5 rounded-xl transition-all"
            >
              Try Demo First
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
