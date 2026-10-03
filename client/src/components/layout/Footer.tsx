import React from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Shield, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white">
                <QrCode className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white">
                WhatsApp<span className="text-brand-400">QR</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering Indian shop owners, cafes, and service providers with frictionless digital QR catalogs and direct WhatsApp ordering.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-400 bg-brand-950/60 border border-brand-800/60 px-3 py-1.5 rounded-lg w-fit">
              <Shield className="w-3.5 h-3.5" />
              <span>100% Commission-Free</span>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/features" className="hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-white transition-colors">
                  Pricing (₹1,999 setup)
                </Link>
              </li>
              <li>
                <Link to="/business-types" className="hover:text-white transition-colors">
                  Supported Businesses
                </Link>
              </li>
              <li>
                <Link to="/demo" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                  Live Interactive Demo
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources & Support */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  FAQ & Guide
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Help & Contact Us
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Start Onboarding
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Merchant Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">Trust & Compliance</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
            <div className="mt-6 text-xs text-slate-500">
              Made with <Heart className="w-3 h-3 inline text-rose-500 fill-rose-500" /> for Indian commerce.
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Business WhatsApp QR SaaS. All rights reserved.</p>
          <p>Transparent pricing: ₹1,999 setup + ₹299/month. Zero hidden commission.</p>
        </div>
      </div>
    </footer>
  );
};
