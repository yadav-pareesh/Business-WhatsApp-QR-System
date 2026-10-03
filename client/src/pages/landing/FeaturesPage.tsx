import React from 'react';
import { Link } from 'react-router-dom';
import {
  QrCode,
  Smartphone,
  Send,
  Printer,
  ShieldCheck,
  Clock,
  Layers,
  BarChart3,
  Palette,
  ArrowRight,
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export const FeaturesPage: React.FC = () => {
  const features = [
    {
      title: 'Stable Smart QR Code',
      icon: QrCode,
      desc: 'Your printed QR stands never change. Update items, prices, and phone numbers in seconds without re-printing posters.',
    },
    {
      title: 'Instant WhatsApp Deep Links',
      icon: Send,
      desc: 'Pre-generates cleanly formatted, emoji-accented WhatsApp order messages with itemized subtotals, notes, and table numbers.',
    },
    {
      title: 'Print-Ready QR Designer',
      icon: Printer,
      desc: 'Generate high-resolution printable table stands, counter tents, and wall posters with your logo and colors in 1-click.',
    },
    {
      title: 'Portion Variants & Add-ons',
      icon: Layers,
      desc: 'Support regular/medium/large sizes, crust choices, and toppings. Accurate automated calculations in cart.',
    },
    {
      title: 'Operating Hours & Split Shifts',
      icon: Clock,
      desc: 'Configure weekly schedules, lunch and dinner split shifts, and manual Store Open/Closed emergency override.',
    },
    {
      title: 'Lightweight Conversion Analytics',
      icon: BarChart3,
      desc: 'Track physical QR scans, storefront visits, cart additions, orders initiated, and your bestselling dishes.',
    },
    {
      title: 'Custom Brand Identity',
      icon: Palette,
      desc: 'Customize brand colors, store logos, and cover banners for an authentic, premium customer ordering experience.',
    },
    {
      title: 'Zero Commission Guaranteed',
      icon: ShieldCheck,
      desc: 'Keep 100% of customer payments. You receive payments directly through UPI, cash, or card at your counter.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full">
            Powerful Features
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-3">
            Engineered for Real-World Indian Commerce
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
            Everything your restaurant, cafe, or store needs to accept digital orders on WhatsApp without clunky hardware or expensive monthly fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-floating">
          <h2 className="text-2xl font-black text-slate-900">Experience it in action</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Test the complete customer journey on our live demo restaurant menu.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/demo"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
            >
              Launch Live Demo
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20"
            >
              Create Your Business QR
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
