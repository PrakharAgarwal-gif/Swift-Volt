"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { FileText, Download, Printer } from 'lucide-react';

export default function BillingPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchOrders();
  }, []);

  const handlePrint = (orderId: string) => {
    // In a real app, this would open a new window with a printable PDF or print stylesheet
    window.print();
  };

  if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing & Invoices</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your order invoices and download them as PDFs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => {
          const unitPrice = order.scooterModel === 'Swift Volt X-Pro' ? 1200 : order.scooterModel === 'Swift Volt Max' ? 1500 : 800;
          const subtotal = unitPrice * order.quantity;
          const gst = subtotal * 0.18;
          const total = subtotal + gst;

          return (
            <div key={order.id} className="bg-white dark:bg-[#0f172a] shadow-sm rounded-xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col h-full hover:border-primary/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="bg-primary/10 p-2 rounded-lg mr-3">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Invoice #{order.id.substring(0, 8).toUpperCase()}</h3>
                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                  {order.status === 'DELIVERED' ? 'PAID' : 'PENDING'}
                </span>
              </div>
              
              <div className="flex-1 space-y-3 mb-6 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Product:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{order.scooterModel}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Quantity:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{order.quantity} Units</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal:</span>
                  <span className="font-medium text-gray-900 dark:text-white">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>GST (18%):</span>
                  <span className="font-medium text-gray-900 dark:text-white">${gst.toLocaleString()}</span>
                </div>
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <span className="font-bold text-gray-900 dark:text-white">Total:</span>
                  <span className="text-lg font-bold text-primary">${total.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="flex gap-3 mt-auto">
                <button className="flex-1 flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </button>
                <button onClick={() => handlePrint(order.id)} className="flex-1 flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </button>
              </div>
            </div>
          );
        })}
        {orders.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            No invoices found.
          </div>
        )}
      </div>
    </div>
  );
}
