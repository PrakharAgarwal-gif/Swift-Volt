"use client";

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Plus,
  Settings,
  ChevronDown
} from 'lucide-react';
import { io } from 'socket.io-client';

const MANUFACTURING_STEPS = [
  'Order Confirmed', 'Production Scheduled', 'Frame Assembly', 'Painting', 
  'Motor Installation', 'Battery Installation', 'Electrical Wiring', 
  'Software Programming', 'Quality Inspection', 'Road Testing', 
  'Packaging', 'Ready for Dispatch', 'Dispatched', 'Delivered'
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Dispatch Modal State
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [dispatchDetails, setDispatchDetails] = useState({
    transportCompany: '',
    driverName: '',
    driverMobile: '',
    vehicleNumber: '',
    lrNumber: ''
  });

  useEffect(() => {
    const userCookie = Cookies.get('user');
    if (userCookie) {
      setUser(JSON.parse(userCookie));
    }
    
    fetchOrders();

    const socketUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://swift-volt.onrender.com';
    const socket = io(socketUrl);
    socket.on('new_order', (order) => {
      setOrders(prev => [order, ...prev]);
    });
    socket.on('order_updated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (newStatus === 'Dispatched') {
      setSelectedOrder(orders.find(o => o.id === orderId));
      setDispatchModalOpen(true);
      return;
    }
    
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? res.data : o));
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const submitDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    
    try {
      const res = await api.put(`/orders/${selectedOrder.id}/status`, { 
        status: 'Dispatched',
        dispatchDetails
      });
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? res.data : o));
      setDispatchModalOpen(false);
      setSelectedOrder(null);
    } catch (err) {
      console.error("Failed to dispatch order", err);
    }
  };

  const getStepProgress = (status: string) => {
    const idx = MANUFACTURING_STEPS.indexOf(status);
    if (idx === -1) return 0;
    return Math.round(((idx + 1) / MANUFACTURING_STEPS.length) * 100);
  };

  if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Order & Manufacturing Pipeline</h1>
          <p className="text-gray-500 dark:text-gray-400">Track production, assembly, and dispatch.</p>
        </div>
        {user?.role === 'DEALER' && (
          <a
            href="/dashboard/orders/new"
            className="flex items-center px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Place New Order
          </a>
        )}
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const progress = getStepProgress(order.status);
          
          return (
            <div key={order.id} className="bg-white dark:bg-[#0f172a] shadow-sm rounded-xl border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Order #{order.id.substring(0, 8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {order.quantity}x {order.scooterModel} ({order.color}) 
                      {user?.role === 'ADMIN' && ` • Dealer: ${order.dealer?.companyName}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col md:items-end gap-2">
                  {user?.role === 'ADMIN' ? (
                    <select 
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                    >
                      {MANUFACTURING_STEPS.map(step => (
                        <option key={step} value={step}>{step}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="px-3 py-1 bg-primary/10 text-primary font-medium rounded-full text-sm">
                      {order.status}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    Expected: {order.expectedArrival ? new Date(order.expectedArrival).toLocaleDateString() : 'TBD'}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mb-2">
                <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 font-medium">
                <span>Order Confirmed</span>
                <span className="text-primary">{progress}% Completed</span>
                <span>Delivered</span>
              </div>
              
              <div className="mt-4 flex justify-end">
                <a href={`/dashboard/tracking/${order.id}`} className="text-sm font-medium text-primary hover:underline flex items-center">
                  Track Shipment <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              </div>

              {/* Dispatch Details if available */}
              {order.dispatchDate && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Transport</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{order.transportCompany}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Driver</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{order.driverName} ({order.driverMobile})</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Vehicle No</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{order.vehicleNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">LR Number</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{order.lrNumber}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {orders.length === 0 && (
          <div className="text-center p-12 bg-white dark:bg-[#0f172a] rounded-xl border border-gray-100 dark:border-gray-800">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No orders found.</p>
          </div>
        )}
      </div>

      {/* Dispatch Modal */}
      {dispatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Dispatch Order</h3>
            </div>
            <form onSubmit={submitDispatch} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transport Company</label>
                <input required type="text" className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={dispatchDetails.transportCompany} onChange={e => setDispatchDetails({...dispatchDetails, transportCompany: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Driver Name</label>
                  <input required type="text" className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={dispatchDetails.driverName} onChange={e => setDispatchDetails({...dispatchDetails, driverName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Driver Mobile</label>
                  <input required type="text" className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={dispatchDetails.driverMobile} onChange={e => setDispatchDetails({...dispatchDetails, driverMobile: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vehicle No</label>
                  <input required type="text" className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={dispatchDetails.vehicleNumber} onChange={e => setDispatchDetails({...dispatchDetails, vehicleNumber: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">LR Number</label>
                  <input required type="text" className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={dispatchDetails.lrNumber} onChange={e => setDispatchDetails({...dispatchDetails, lrNumber: e.target.value})} />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200 dark:border-gray-800 mt-6">
                <button type="button" onClick={() => setDispatchModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors flex items-center">
                  <Truck className="w-4 h-4 mr-2" />
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
