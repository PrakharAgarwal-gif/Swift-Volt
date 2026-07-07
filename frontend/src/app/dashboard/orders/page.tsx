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
  Plus
} from 'lucide-react';
import { io } from 'socket.io-client';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userCookie = Cookies.get('user');
    if (userCookie) {
      setUser(JSON.parse(userCookie));
    }
    
    fetchOrders();

    const token = Cookies.get('token');
    const socketUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://swift-volt.onrender.com';
    const socket = io(socketUrl);
    socket.on('new_order', (order) => {
      setOrders(prev => [order, ...prev]);
    });
    socket.on('order_status_update', (updatedOrder) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLACED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'APPROVED': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'PROCESSING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'DISPATCHED': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'IN_TRANSIT': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED': return <CheckCircle2 className="w-4 h-4 mr-1" />;
      case 'IN_TRANSIT': 
      case 'DISPATCHED': return <Truck className="w-4 h-4 mr-1" />;
      default: return <Clock className="w-4 h-4 mr-1" />;
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Order Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Track and manage your scooter orders.</p>
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

      <div className="bg-white dark:bg-[#0f172a] shadow-sm rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">Order ID</th>
                {user?.role === 'ADMIN' && <th scope="col" className="px-6 py-4 font-semibold">Dealer</th>}
                <th scope="col" className="px-6 py-4 font-semibold">Product</th>
                <th scope="col" className="px-6 py-4 font-semibold">Quantity</th>
                <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                <th scope="col" className="px-6 py-4 font-semibold">Expected Arrival</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    #{order.id.substring(0, 8).toUpperCase()}
                    <div className="text-xs text-gray-500 mt-1 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {order.deliveryAddress.substring(0, 25)}...
                    </div>
                  </td>
                  {user?.role === 'ADMIN' && (
                    <td className="px-6 py-4">
                      {order.dealer?.companyName || 'Unknown'}
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Package className="w-4 h-4 mr-2 text-primary" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{order.scooterModel}</div>
                        <div className="text-xs text-gray-500">{order.color}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">{order.quantity} Units</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {order.expectedArrival ? new Date(order.expectedArrival).toLocaleDateString() : 'TBD'}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={user?.role === 'ADMIN' ? 6 : 5} className="px-6 py-12 text-center text-gray-500">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
