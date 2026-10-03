import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Layers,
  ShoppingBag,
  QrCode,
  BarChart3,
  Settings,
  CreditCard,
  LogOut,
  ExternalLink,
  Store,
  Menu,
  X,
  Power,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../utils/api';

export const DashboardLayout: React.FC = () => {
  const { user, currentBusiness, updateBusinessState, logout } = useAuthStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const navigate = useNavigate();

  const handleToggleStoreStatus = async () => {
    if (!currentBusiness) return;
    setIsTogglingStatus(true);
    try {
      const nextStatus = !currentBusiness.isStoreOpenManual;
      await api.put(`/business/${currentBusiness.id}/toggle-status`, {
        isStoreOpenManual: nextStatus,
      });
      updateBusinessState({ isStoreOpenManual: nextStatus });
    } catch (err: any) {
      alert(err.message || 'Failed to toggle store status');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Overview', to: '/dashboard', icon: LayoutDashboard, end: true },
    { name: 'Catalog', to: '/dashboard/catalog', icon: UtensilsCrossed },
    { name: 'Categories', to: '/dashboard/categories', icon: Layers },
    { name: 'Orders', to: '/dashboard/orders', icon: ShoppingBag },
    { name: 'QR Code & Prints', to: '/dashboard/qr', icon: QrCode },
    { name: 'Analytics', to: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Settings', to: '/dashboard/settings', icon: Settings },
    { name: 'Billing', to: '/dashboard/billing', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-1.5 text-slate-600 rounded-lg hover:bg-slate-100"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
            <QrCode className="w-4 h-4 text-brand-600" />
            <span className="truncate max-w-[150px]">{currentBusiness?.name || 'Dashboard'}</span>
          </div>
        </div>

        {currentBusiness && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleStoreStatus}
              disabled={isTogglingStatus}
              className={`text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 transition-colors ${
                currentBusiness.isStoreOpenManual
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  currentBusiness.isStoreOpenManual ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              {currentBusiness.isStoreOpenManual ? 'Open' : 'Closed'}
            </button>

            <Link
              to={`/business/${currentBusiness.slug}`}
              target="_blank"
              className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 rounded-lg"
              title="Preview Public Store"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        )}
      </header>

      {/* Sidebar for Desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-black text-sm">
              QR
            </div>
            <span className="font-extrabold text-white text-base tracking-tight">WhatsApp QR</span>
          </Link>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Business Selector / Status Card */}
        {currentBusiness && (
          <div className="p-4 border-b border-slate-800 bg-slate-950/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Business</span>
              <button
                onClick={handleToggleStoreStatus}
                disabled={isTogglingStatus}
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors ${
                  currentBusiness.isStoreOpenManual
                    ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                }`}
                title="Click to toggle store open/close state"
              >
                <Power className="w-2.5 h-2.5" />
                {currentBusiness.isStoreOpenManual ? 'Store Open' : 'Store Closed'}
              </button>
            </div>
            <div className="font-bold text-white text-sm truncate">{currentBusiness.name}</div>
            <div className="text-xs text-slate-400 truncate mt-0.5">{currentBusiness.category}</div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <Link
                to={`/business/${currentBusiness.slug}`}
                target="_blank"
                className="text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1"
              >
                <Store className="w-3.5 h-3.5" />
                Preview Store
              </Link>
              <span className="text-slate-500 font-mono text-[11px]">/{currentBusiness.slug}</span>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.to}
                end={item.end}
                onClick={() => setMobileSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white font-semibold shadow-md shadow-brand-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile & Sign Out Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between px-2 py-2">
            <div className="truncate mr-2">
              <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
              <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar for quick thumb access */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg safe-pb">
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 text-[10px] font-medium rounded-lg ${
              isActive ? 'text-brand-600 font-bold' : 'text-slate-500'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          Home
        </NavLink>
        <NavLink
          to="/dashboard/catalog"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 text-[10px] font-medium rounded-lg ${
              isActive ? 'text-brand-600 font-bold' : 'text-slate-500'
            }`
          }
        >
          <UtensilsCrossed className="w-5 h-5 mb-0.5" />
          Catalog
        </NavLink>
        <NavLink
          to="/dashboard/orders"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 text-[10px] font-medium rounded-lg ${
              isActive ? 'text-brand-600 font-bold' : 'text-slate-500'
            }`
          }
        >
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          Orders
        </NavLink>
        <NavLink
          to="/dashboard/qr"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 text-[10px] font-medium rounded-lg ${
              isActive ? 'text-brand-600 font-bold' : 'text-slate-500'
            }`
          }
        >
          <QrCode className="w-5 h-5 mb-0.5" />
          QR
        </NavLink>
        <NavLink
          to="/dashboard/settings"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 text-[10px] font-medium rounded-lg ${
              isActive ? 'text-brand-600 font-bold' : 'text-slate-500'
            }`
          }
        >
          <Settings className="w-5 h-5 mb-0.5" />
          Settings
        </NavLink>
      </nav>
    </div>
  );
};
