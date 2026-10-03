import React from 'react';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  Coffee,
  Scissors,
  ShoppingBag,
  Cake,
  Wrench,
  Stethoscope,
  Pill,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export const BusinessTypesPage: React.FC = () => {
  const categories = [
    {
      name: 'Restaurants & Dine-in',
      icon: UtensilsCrossed,
      desc: 'Let diners scan table QR stands, browse photo menus, pick portion sizes & spicy levels, and place table orders on WhatsApp.',
      customFields: 'Table / Seat Number, Cooking Notes, Cutlery request',
    },
    {
      name: 'Cafes & Coffee Bars',
      icon: Coffee,
      desc: 'Offer artisanal espresso, pour-overs, sandwiches, and bakery goods. Fast counter pickup or table service.',
      customFields: 'Milk type (Oat/Almond), Sugar level, Counter pickup',
    },
    {
      name: 'Salons & Spas',
      icon: Scissors,
      desc: 'List haircuts, facial packages, and grooming treatments. Clients pick their preferred appointment date and time slot.',
      customFields: 'Preferred stylist, Appointment date & time, Notes',
    },
    {
      name: 'Sweet Shops & Bakeries',
      icon: Cake,
      desc: 'Showcase desi ghee mithai boxes, party cakes, and festive gift hampers with custom occasion messaging.',
      customFields: 'Pickup date, Message on cake, Delivery address',
    },
    {
      name: 'Kirana & Grocery Stores',
      icon: ShoppingBag,
      desc: 'Enable neighborhood customers to send their monthly grocery lists or staple orders directly for doorstep delivery.',
      customFields: 'Delivery address, Preferred delivery slot, Notes',
    },
    {
      name: 'Electronics & Repair Shops',
      icon: Wrench,
      desc: 'Accept diagnostic requests, screen replacement bookings, and spare accessory orders directly.',
      customFields: 'Device brand/model, Issue description, Phone',
    },
    {
      name: 'Clinics & Wellness Centers',
      icon: Stethoscope,
      desc: 'Display consultation fees, wellness therapy sessions, and diagnostic test bookings.',
      customFields: 'Patient name, Consultation type, Preferred slot',
    },
    {
      name: 'Pharmacies & Chemists',
      icon: Pill,
      desc: 'Allow local patients to upload or text prescription lists and request doorstep medicine delivery.',
      customFields: 'Patient address, Delivery notes, Prescription',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full">
            Tailored Experience
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-3">
            Not Just For Food. Built For Every Business.
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
            Our flexible catalog architecture supports products, services, appointments, portion sizes, add-ons, and dynamic intake fields.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.name}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900">{cat.name}</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{cat.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                  <span className="font-bold text-slate-600">Intake fields: </span>
                  {cat.customFields}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center bg-brand-50 border border-brand-200 rounded-3xl p-8 sm:p-12">
          <h2 className="text-2xl font-black text-slate-900">Don't see your specific category?</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
            You can customize fields, labels, and products to match any commerce model in India.
          </p>
          <div className="mt-6">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-7 py-3 rounded-xl text-sm shadow-md"
            >
              Start Free Setup Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
