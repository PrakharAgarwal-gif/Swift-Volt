"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { FileText, Download, Printer, Plus, ShoppingCart, User } from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';

export default function BillingPage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [customerInvoices, setCustomerInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PURCHASE_ORDERS' | 'CUSTOMER_INVOICES'>('CUSTOMER_INVOICES');

  useEffect(() => {
    const userCookie = Cookies.get('user');
    if (userCookie) setUser(JSON.parse(userCookie));

    const fetchData = async () => {
      try {
        const [ordersRes, invoicesRes] = await Promise.all([
          api.get('/orders'),
          api.get('/customer-invoices')
        ]);
        setOrders(ordersRes.data);
        setCustomerInvoices(invoicesRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePrint = (id: string) => {
    window.open(`/dashboard/billing/${id}`, '_blank');
  };

  if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing & Invoices</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your orders and customer invoices.</p>
        </div>
        {user?.role === 'DEALER' && (
          <Link href="/dashboard/billing/new" className="flex items-center px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Create Customer Invoice
          </Link>
        )}
      </div>

      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('CUSTOMER_INVOICES')}
          className={`pb-4 px-6 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'CUSTOMER_INVOICES' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Customer Invoices
        </button>
        <button
          onClick={() => setActiveTab('PURCHASE_ORDERS')}
          className={`pb-4 px-6 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'PURCHASE_ORDERS' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Purchase Orders (from Swift Volt)
        </button>
      </div>

      {activeTab === 'CUSTOMER_INVOICES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customerInvoices.map((inv) => (
            <div key={inv.id} className="bg-white dark:bg-[#0f172a] shadow-sm rounded-xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col h-full hover:border-primary/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
                    <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{inv.invoiceNumber}</h3>
                    <p className="text-xs text-gray-500">{new Date(inv.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 space-y-2 mb-6 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Customer:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{inv.customerName}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Phone:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{inv.customerPhone || 'N/A'}</span>
                </div>
                {user?.role === 'ADMIN' && inv.dealer && (
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Dealer:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{inv.dealer.companyName}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600 dark:text-gray-400 mt-2">
                  <span>Subtotal:</span>
                  <span className="font-medium text-gray-900 dark:text-white">${inv.subtotal?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax:</span>
                  <span className="font-medium text-gray-900 dark:text-white">${inv.taxAmount?.toLocaleString() || 0}</span>
                </div>
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <span className="font-bold text-gray-900 dark:text-white">Total:</span>
                  <span className="text-lg font-bold text-primary">${inv.totalAmount?.toLocaleString() || 0}</span>
                </div>
              </div>
              
              <div className="flex gap-3 mt-auto">
                <button className="flex-1 flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </button>
                <button onClick={() => handlePrint(inv.id)} className="flex-1 flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </button>
              </div>
            </div>
          ))}
          {customerInvoices.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white dark:bg-[#0f172a] rounded-xl border border-gray-100 dark:border-gray-800">
              No customer invoices found.
            </div>
          )}
        </div>
      )}

      {activeTab === 'PURCHASE_ORDERS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-[#0f172a] shadow-sm rounded-xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col h-full hover:border-primary/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="bg-primary/10 p-2 rounded-lg mr-3">
                    <ShoppingCart className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">PO #{order.id.substring(0, 8).toUpperCase()}</h3>
                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {order.status === 'DELIVERED' ? 'PAID' : 'PENDING'}
                </span>
              </div>
              
              <div className="flex-1 space-y-2 mb-6 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Product:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{order.scooterModel}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Quantity:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{order.quantity} Units</span>
                </div>
                {user?.role === 'ADMIN' && order.dealer && (
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Dealer:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{order.dealer.companyName}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600 dark:text-gray-400 mt-2">
                  <span>Subtotal:</span>
                  <span className="font-medium text-gray-900 dark:text-white">${order.subTotal?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>GST:</span>
                  <span className="font-medium text-gray-900 dark:text-white">${order.gst?.toLocaleString() || 0}</span>
                </div>
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <span className="font-bold text-gray-900 dark:text-white">Total:</span>
                  <span className="text-lg font-bold text-primary">${order.totalAmount?.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white dark:bg-[#0f172a] rounded-xl border border-gray-100 dark:border-gray-800">
              No purchase orders found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
