import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QrCode, Lock, Mail, ArrowRight, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../utils/api';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('owner@abcrestaurant.com');
  const [password, setPassword] = useState('DemoPassword123!');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await api.post<{
        token: string;
        user: any;
        businesses: any[];
      }>('/auth/login', { email, password });

      login(res.token, res.user, res.businesses);
      if (res.businesses.length === 0) {
        navigate('/onboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Incorrect email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-black shadow-md shadow-brand-500/20">
            <QrCode className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-xl text-slate-900 tracking-tight">
            WhatsApp<span className="text-brand-600">QR</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-black text-slate-900">Merchant Sign In</h2>
        <p className="mt-1 text-xs text-slate-500">Access your store catalog, orders, and QR settings</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200 shadow-card">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Demo Fill Pill */}
          <div className="mb-5 p-3 rounded-xl bg-brand-50/80 border border-brand-200 text-[11px] text-brand-900 flex items-center justify-between">
            <span>Demo merchant account credentials are pre-filled!</span>
            <button
              type="button"
              onClick={() => {
                setEmail('owner@abcrestaurant.com');
                setPassword('DemoPassword123!');
              }}
              className="text-brand-700 font-bold hover:underline"
            >
              Reset
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@business.com"
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/20 transition-all"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In to Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have a business account yet?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
              Create your QR (₹1,999)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
