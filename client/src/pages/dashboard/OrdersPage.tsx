import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Eye,
  Filter,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Order } from '../../types';
import { api } from '../../utils/api';
import { Modal } from '../../components/common/Modal';

export const OrdersPage: React.FC = () => {
  const { currentBusiness } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadOrders = async () => {
    if (!currentBusiness) return;
    setIsLoading(true);
    try {
      const statusParam = selectedStatus !== 'ALL' ? `&status=${selectedStatus}` : '';
      const searchParam = searchQuery.trim() ? `&search=${encodeURIComponent(searchQuery.trim())}` : '';
      const res = await api.get<{ orders: Order[] }>(
        `/orders/${currentBusiness.id}?limit=50${statusParam}${searchParam}`
      );
      setOrders(res.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [currentBusiness, selectedStatus]);

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    if (!currentBusiness) return;
    try {
      await api.put(`/orders/${currentBusiness.id}/${orderId}/status`, { status: nextStatus });
      setOrders(
        orders.map((o) => (o.id === orderId ? { ...o, status: nextStatus as any } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: nextStatus as any });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Order Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track customer orders, table dining requests, and order progress.
          </p>
        </div>
      </div>

      {/* Filter and Status Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {['ALL', 'NEW', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedStatus === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All Orders' : st}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadOrders()}
            placeholder="Search by order ID (#ABC-1024), customer name, or phone number..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-2">
          <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-700 text-sm">No orders matching criteria</p>
          <p className="text-xs text-slate-400">Orders placed by customers will automatically appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div
                className="flex items-start gap-3 cursor-pointer flex-1"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {order.tableNumber ? order.tableNumber.slice(0, 4) : 'ORD'}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">{order.orderNumber}</span>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    <span className="font-semibold">{order.customerName}</span>
                    {order.customerPhone && <span className="text-slate-400"> • {order.customerPhone}</span>}
                    {order.tableNumber && (
                      <span className="text-brand-700 font-semibold"> • {order.tableNumber}</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {order.items.length} item(s) • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                <div className="text-left sm:text-right">
                  <div className="font-extrabold text-base text-slate-900">
                    {currentBusiness?.currencySymbol}{order.totalAmount}
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="flex items-center gap-1.5">
                  {order.status === 'NEW' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'ACCEPTED')}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                    >
                      Accept
                    </button>
                  )}
                  {order.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                    >
                      Cook
                    </button>
                  )}
                  {order.status === 'PREPARING' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'READY')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                    >
                      Ready
                    </button>
                  )}
                  {order.status === 'READY' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                    >
                      Complete
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      <Modal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={`Order: ${selectedOrder?.orderNumber}`}
        description={`Placed on ${selectedOrder ? new Date(selectedOrder.createdAt).toLocaleString() : ''}`}
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Customer</span>
                <div className="font-bold text-sm text-slate-900">{selectedOrder.customerName}</div>
                {selectedOrder.customerPhone && (
                  <div className="text-xs text-slate-500">{selectedOrder.customerPhone}</div>
                )}
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Location / Table</span>
                <div className="font-bold text-sm text-slate-900">
                  {selectedOrder.tableNumber || selectedOrder.deliveryAddress || 'Dine-in / Pickup'}
                </div>
              </div>
            </div>

            {selectedOrder.customerNotes && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                <span className="font-bold">Instructions: </span>
                {selectedOrder.customerNotes}
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Order Items
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{item.quantity} × {item.productName}</span>
                    </div>
                    <span className="font-bold text-slate-800">
                      {currentBusiness?.currencySymbol}{item.totalPrice}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total breakdown */}
            <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{currentBusiness?.currencySymbol}{selectedOrder.subtotal}</span>
              </div>
              {selectedOrder.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{currentBusiness?.currencySymbol}{selectedOrder.taxAmount}</span>
                </div>
              )}
              {selectedOrder.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>{currentBusiness?.currencySymbol}{selectedOrder.deliveryFee}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-slate-200 text-slate-900">
                <span>Total Amount</span>
                <span className="text-brand-600">
                  {currentBusiness?.currencySymbol}{selectedOrder.totalAmount}
                </span>
              </div>
            </div>

            {/* Change Status Dropdown */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-slate-600">Update Status:</span>
              <select
                value={selectedOrder.status}
                onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 font-semibold"
              >
                <option value="NEW">NEW</option>
                <option value="ACCEPTED">ACCEPTED</option>
                <option value="PREPARING">PREPARING</option>
                <option value="READY">READY</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
