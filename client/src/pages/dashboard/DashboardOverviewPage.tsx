import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  TrendingUp,
  QrCode,
  UtensilsCrossed,
  Plus,
  ExternalLink,
  Share2,
  CheckCircle2,
  Clock,
  ChevronRight,
  Eye,
  Store,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Order, AnalyticsSummary } from '../../types';
import { api } from '../../utils/api';
import { Modal } from '../../components/common/Modal';

export const DashboardOverviewPage: React.FC = () => {
  const { currentBusiness } = useAuthStore();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!currentBusiness) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [ordersRes, analyticsRes] = await Promise.all([
          api.get<{ orders: Order[] }>(`/orders/${currentBusiness.id}?limit=6`),
          api.get<AnalyticsSummary>(`/analytics/${currentBusiness.id}`),
        ]);
        setOrders(ordersRes.orders);
        setAnalytics(analyticsRes);
      } catch (err) {
        console.error('Failed to load overview data', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentBusiness]);

  if (!currentBusiness) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">No active business found. Please complete onboarding.</p>
        <Link
          to="/onboard"
          className="inline-block mt-4 bg-brand-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm"
        >
          Create Business
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">New Order</span>;
      case 'ACCEPTED':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">Accepted</span>;
      case 'PREPARING':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">Preparing</span>;
      case 'READY':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Ready</span>;
      case 'COMPLETED':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">Completed</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700">Cancelled</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Welcome back, {currentBusiness.name} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Zero-commission QR digital catalog & WhatsApp ordering overview.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/business/${currentBusiness.slug}`}
            target="_blank"
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
          >
            <Store className="w-4 h-4 text-brand-600" />
            Live Store
          </Link>
          <Link
            to="/dashboard/qr"
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <QrCode className="w-4 h-4" />
            QR & Prints
          </Link>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Today's Orders */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Today's Orders</span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {analytics?.todayOrdersCount || 0}
          </div>
          <div className="text-[11px] text-slate-400">Received via WhatsApp</div>
        </div>

        {/* Today's Revenue */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Today's Sales</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {currentBusiness.currencySymbol}{analytics?.todayRevenue || 0}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">100% directly to you</div>
        </div>

        {/* Total QR Scans */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total QR Scans</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {analytics?.qrScans || 0}
          </div>
          <div className="text-[11px] text-slate-400">Physical table & counter scans</div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Conversion Rate</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {analytics?.conversionRate || '0.0%'}
          </div>
          <div className="text-[11px] text-slate-400">Visitors who ordered</div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md">
        <h2 className="text-xs font-bold text-brand-400 uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => navigate('/dashboard/catalog')}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center flex-shrink-0">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Add Product</div>
              <div className="text-[10px] text-slate-400">Create item</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/dashboard/categories')}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Categories</div>
              <div className="text-[10px] text-slate-400">Organize menu</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/dashboard/qr')}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Print QR Cards</div>
              <div className="text-[10px] text-slate-400">Table stands</div>
            </div>
          </button>

          <button
            onClick={() => {
              const fullUrl = `${window.location.origin}/business/${currentBusiness.slug}`;
              if (navigator.share) {
                navigator.share({ title: currentBusiness.name, url: fullUrl });
              } else {
                navigator.clipboard.writeText(fullUrl);
                alert('Store link copied to clipboard!');
              }
            }}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Share Store</div>
              <div className="text-[10px] text-slate-400">Copy URL</div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Customer Orders</h2>
            <p className="text-xs text-slate-500">Live feed of orders received from customer scans</p>
          </div>
          <Link
            to="/dashboard/orders"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            View all
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No orders yet</p>
            <p className="text-xs text-slate-400">
              Print your QR code stand and place it on tables to start getting orders!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                    {order.tableNumber ? order.tableNumber.slice(0, 4) : 'ORD'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">{order.orderNumber}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {order.customerName} {order.customerPhone ? `• ${order.customerPhone}` : ''}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-extrabold text-sm text-slate-900">
                    {currentBusiness.currencySymbol}{order.totalAmount}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={`Order Details: ${selectedOrder?.orderNumber}`}
        description={`Placed on ${selectedOrder ? new Date(selectedOrder.createdAt).toLocaleString() : ''}`}
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-xs font-semibold text-slate-500">Customer</span>
                <div className="font-bold text-sm text-slate-900">{selectedOrder.customerName}</div>
                {selectedOrder.customerPhone && (
                  <div className="text-xs text-slate-500">{selectedOrder.customerPhone}</div>
                )}
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-500">Location</span>
                <div className="font-bold text-sm text-slate-900">
                  {selectedOrder.tableNumber || selectedOrder.deliveryAddress || 'Dine-in / Pickup'}
                </div>
              </div>
            </div>

            {selectedOrder.customerNotes && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                <span className="font-bold">Notes: </span>
                {selectedOrder.customerNotes}
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Ordered Items
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{item.quantity} × {item.productName}</span>
                    </div>
                    <span className="font-bold text-slate-800">
                      {currentBusiness.currencySymbol}{item.totalPrice}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-sm font-extrabold text-slate-900">
              <span>Total Amount</span>
              <span className="text-base text-brand-600">
                {currentBusiness.currencySymbol}{selectedOrder.totalAmount}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
