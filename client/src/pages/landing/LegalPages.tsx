import React from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-black text-slate-900">Privacy Policy</h1>
        <p className="text-xs text-slate-400">Last updated: October 2026</p>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs text-slate-600 leading-relaxed">
          <h2 className="text-sm font-bold text-slate-900">1. Information We Collect</h2>
          <p>
            We collect basic merchant business information (business name, category, phone number, and WhatsApp number) strictly to operate digital catalogs and QR codes. We do NOT track individual consumer browsing habits or sell customer information.
          </p>

          <h2 className="text-sm font-bold text-slate-900">2. Customer Orders</h2>
          <p>
            When a customer builds an order, order information is transmitted directly to the business owner via WhatsApp click-to-chat. We do not store sensitive payment card details.
          </p>

          <h2 className="text-sm font-bold text-slate-900">3. Analytics & Cookies</h2>
          <p>
            We only collect aggregated anonymous statistics such as page visits and QR scans to provide shop owners with insights on their menu performance.
          </p>

          <h2 className="text-sm font-bold text-slate-900">4. Contact Us</h2>
          <p>
            For privacy inquiries, contact support@whatsappqr.in.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-black text-slate-900">Terms of Service</h1>
        <p className="text-xs text-slate-400">Last updated: October 2026</p>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs text-slate-600 leading-relaxed">
          <h2 className="text-sm font-bold text-slate-900">1. Service Subscription</h2>
          <p>
            Business WhatsApp QR provides a software-as-a-service platform for digital catalog display and WhatsApp ordering. Pricing is structured as a ₹1,999 setup fee and a ₹299/month recurring subscription.
          </p>

          <h2 className="text-sm font-bold text-slate-900">2. Zero Commission</h2>
          <p>
            We do not participate in order transactions or take commissions on product sales. Business owners are solely responsible for fulfilling orders received on WhatsApp.
          </p>

          <h2 className="text-sm font-bold text-slate-900">3. Prohibited Use</h2>
          <p>
            Merchants may not list illegal products, hazardous goods, or deceptive items under applicable laws of India.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};
