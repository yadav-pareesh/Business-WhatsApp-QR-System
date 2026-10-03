import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export const FAQPage: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Do customers need to install any app to view our menu?',
      a: 'Not at all. Customers just use their phone camera or any basic QR scanner. The menu opens immediately in their mobile web browser as a fast, responsive page with zero load friction.',
    },
    {
      q: 'How does payment collection work?',
      a: 'We purposefully do NOT charge commissions or withhold your funds. When the order arrives on your WhatsApp, you can collect payment via your existing UPI QR counter stand, cash, card machine, or GPay/PhonePe number.',
    },
    {
      q: 'Can I add multiple categories, portion sizes, and toppings?',
      a: 'Yes. Our catalog engine supports multiple categories, portion sizes (Regular, Medium, Large), preparation choices, and optional add-ons (Extra cheese, dips, cutlery). Prices update automatically in the customer cart.',
    },
    {
      q: 'What happens if an item runs out of stock during service?',
      a: 'You can tap the toggle next to that item in your Merchant Dashboard to mark it "Sold Out". It immediately disables for new customer scans without requiring any QR re-printing.',
    },
    {
      q: 'Can I configure business hours and split shifts?',
      a: 'Yes. You can define daily opening and closing times, set split lunch and dinner hours, or click the 1-tap "Store Open / Closed" override at any time.',
    },
    {
      q: 'How do I print table tents and QR posters?',
      a: 'Inside your dashboard, our built-in Print Designer lets you generate and download high-resolution Table Tent stands, counter displays, and A4 wall posters with your logo and store link ready for printing.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full">
            Got Questions?
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
            Frequently Asked Questions
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Clear, honest answers to help you get the most out of your digital ordering system.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={faq.q}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left font-bold text-sm text-slate-900 flex items-center justify-between gap-4 hover:bg-slate-50"
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
      </main>

      <Footer />
    </div>
  );
};
