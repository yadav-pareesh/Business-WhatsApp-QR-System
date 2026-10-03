import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  QrCode,
  Eye,
  ShoppingBag,
  TrendingUp,
  Percent,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { AnalyticsSummary } from '../../types';
import { api } from '../../utils/api';

export const AnalyticsPage: React.FC = () => {
  const { currentBusiness } = useAuthStore();
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentBusiness) return;
    const loadAnalytics = async () => {
      setIsLoading(true);
      try {
        const res = await api.get<AnalyticsSummary>(`/analytics/${currentBusiness.id}`);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadAnalytics();
  }, [currentBusiness]);

  if (isLoading || !data || !currentBusiness) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const metrics = [
    { title: 'Total QR Scans', value: data.qrScans, icon: QrCode, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Store Page Visits', value: data.pageViews, icon: Eye, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Add to Cart Events', value: data.addToCartCount, icon: ShoppingBag, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Orders Initiated', value: data.ordersInitiated, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Conversion Rate', value: data.conversionRate, icon: Percent, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Total Completed Orders', value: data.totalOrders, icon: BarChart3, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Sales & Scan Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor your customer journey: from table QR scan to WhatsApp order completion.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.title} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{m.title}</span>
                <div className={`w-8 h-8 rounded-xl ${m.bg} ${m.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{m.value}</div>
            </div>
          );
        })}
      </div>

      {/* Top Performing Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Bestselling Items & Dishes</h2>
            <p className="text-xs text-slate-500">Most ordered products through customer WhatsApp orders</p>
          </div>
          <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">
            Top 5
          </span>
        </div>

        {data.topItems.length === 0 ? (
          <div className="p-12 text-center space-y-1">
            <p className="font-semibold text-sm text-slate-700">No order data yet</p>
            <p className="text-xs text-slate-400">Items will rank here automatically as customers send orders.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.topItems.map((item, index) => (
              <div key={item.name} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 font-extrabold text-xs text-slate-600 flex items-center justify-center">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">{item.name}</div>
                    <div className="text-xs text-slate-400">{item.totalQuantity} items ordered</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-extrabold text-sm text-slate-900">
                    {currentBusiness.currencySymbol}{item.totalRevenue}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">Revenue generated</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
