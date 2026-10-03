import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QrCode, Menu, X, ArrowRight, Store, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, currentBusiness } = useAuthStore();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                WhatsApp<span className="text-brand-600">QR</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wider text-slate-500 uppercase block -mt-1">
                Zero Commission SaaS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7">
            <Link to="/features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Features
            </Link>
            <Link to="/pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Pricing
            </Link>
            <Link to="/business-types" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Business Types
            </Link>
            <Link to="/demo" className="text-sm font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1 rounded-full transition-colors flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
              Live Demo
            </Link>
            <Link to="/faq" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              FAQ
            </Link>
          </nav>

          {/* CTA Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {currentBusiness && (
                  <Link
                    to={`/business/${currentBusiness.slug}`}
                    target="_blank"
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 border border-slate-200 px-3 py-2 rounded-lg"
                  >
                    <Store className="w-3.5 h-3.5" />
                    View Store
                  </Link>
                )}
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5"
                >
                  Dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm shadow-brand-500/20 hover:shadow-md transition-all flex items-center gap-1.5"
                >
                  Create Your Business QR
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              to="/demo"
              className="text-xs font-semibold bg-brand-50 text-brand-700 px-2.5 py-1.5 rounded-lg flex items-center gap-1"
            >
              Demo
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Features
          </Link>
          <Link
            to="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Pricing (₹1,999 setup + ₹299/mo)
          </Link>
          <Link
            to="/business-types"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Business Categories
          </Link>
          <Link
            to="/demo"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-brand-700 bg-brand-50"
          >
            Try Live Demo
          </Link>
          <Link
            to="/faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Frequently Asked Questions
          </Link>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/dashboard');
                }}
                className="w-full text-center bg-brand-600 text-white py-2.5 rounded-lg font-medium"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center border border-slate-200 text-slate-700 py-2.5 rounded-lg font-medium"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center bg-brand-600 text-white py-2.5 rounded-lg font-medium"
                >
                  Create Your Business QR
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
