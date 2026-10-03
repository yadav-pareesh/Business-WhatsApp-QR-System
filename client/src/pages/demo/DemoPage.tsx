import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Sparkles, ArrowRight, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export const DemoPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
        {/* Banner */}
        <div className="bg-emerald-900 text-white rounded-3xl p-6 sm:p-10 shadow-floating flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800 text-brand-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              Live Interactive Sandbox
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Test "ABC Restaurant" Digital Menu
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200 max-w-xl">
              Experience the exact customer journey: browse pizzas and burgers, configure crusts and sizes, add items to cart, and generate a validated WhatsApp order.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <a
              href="/business/abc-restaurant"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto bg-brand-500 hover:bg-brand-400 text-white font-black px-6 py-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg"
            >
              <Smartphone className="w-4 h-4" />
              Open Mobile Storefront
            </a>
            <Link
              to="/register"
              className="w-full sm:w-auto bg-white hover:bg-slate-100 text-slate-900 font-bold px-5 py-3.5 rounded-xl text-xs sm:text-sm text-center"
            >
              Create My Store (₹1,999)
            </Link>
          </div>
        </div>

        {/* Embedded Interactive Mobile Phone Frame */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Explanation */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-extrabold text-base text-slate-900">What to test in the demo:</h3>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Pizzas with Variants:</strong> Tap "Paneer Makhani Pizza" to test portion size pricing (Regular, Medium, Large) and extra cheese burst add-on.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Mobile Bottom Sheet Cart:</strong> Notice the floating bottom cart bar updating dynamically with zero layout shifts.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Server Price Verification:</strong> Totals are authoritatively calculated server-side before opening WhatsApp.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Safe Sandbox:</strong> Demo orders use a sandbox WhatsApp number (+91 9876543210) so real businesses are never disturbed.
                  </span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-brand-50 border border-brand-200 rounded-2xl text-xs text-brand-900">
              <span className="font-bold">Want to see the Merchant Dashboard too?</span>
              <p className="mt-1">
                Log in with the pre-seeded demo account:
                <br />
                <code className="font-mono bg-white px-2 py-0.5 rounded border border-brand-300 mt-1 inline-block">
                  owner@abcrestaurant.com / DemoPassword123!
                </code>
              </p>
              <div className="mt-3">
                <Link
                  to="/login"
                  className="font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1"
                >
                  Log into Demo Dashboard →
                </Link>
              </div>
            </div>
          </div>

          {/* Right Live Embedded Frame */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-sm rounded-[40px] border-[10px] border-slate-900 shadow-2xl overflow-hidden bg-slate-900 relative">
              {/* Phone Speaker Notch */}
              <div className="h-5 bg-slate-900 flex justify-center items-center">
                <div className="w-16 h-2 bg-slate-800 rounded-full"></div>
              </div>

              <iframe
                src="/business/abc-restaurant"
                title="ABC Restaurant Live Demo"
                className="w-full h-[640px] bg-slate-50 border-0"
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
