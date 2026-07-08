"use client";

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { Package, Search, Filter, ShoppingCart, Loader2 } from 'lucide-react';

export default function SparePartsPage() {
  const [parts, setParts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'catalogue' | 'orders'>('catalogue');

  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<any>(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    const userCookie = Cookies.get('user');
    if (userCookie) {
      setUser(JSON.parse(userCookie));
    }
    
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'catalogue') {
        const res = await api.get('/spare-parts');
        setParts(res.data);
      } else {
        const res = await api.get('/spare-parts/orders');
        // Fetch parts for name matching since backend didn't join
        const partsRes = await api.get('/spare-parts');
        const ordersWithParts = res.data.map((o: any) => {
          const part = partsRes.data.find((p: any) => p.id === o.partId);
          return { ...o, partName: part?.name || 'Unknown Part' };
        });
        setOrders(ordersWithParts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openOrderModal = (part: any) => {
    setSelectedPart(part);
    setOrderQuantity(1);
    setOrderModalOpen(true);
  };

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPart) return;
    
    setOrdering(true);
    try {
      await api.post('/spare-parts/orders', {
        partId: selectedPart.id,
        quantity: orderQuantity
      });
      setOrderModalOpen(false);
      // Refresh
      const res = await api.get('/spare-parts');
      setParts(res.data);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to place order");
    } finally {
      setOrdering(false);
    }
  };

  if (loading && parts.length === 0 && orders.length === 0) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin h-12 w-12 text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Spare Parts Portal</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage, order, and track EV spare parts inventory.</p>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('catalogue')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'catalogue'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Parts Catalogue
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'orders'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Orders
          </button>
        </nav>
      </div>

      {activeTab === 'catalogue' && (
        <div className="bg-white dark:bg-[#0f172a] shadow-sm rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between">
             <div className="relative flex-1 max-w-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input type="text" placeholder="Search parts..." className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#0f172a] text-sm focus:ring-primary focus:border-primary" />
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">Part Name</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Category</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Price</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Stock</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {parts.map((part) => (
                  <tr key={part.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center">
                      <Package className="w-5 h-5 mr-3 text-gray-400" />
                      {part.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                        {part.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-green-600 font-medium">₹{part.price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={part.stock > 10 ? "text-gray-900 dark:text-white" : "text-red-500 font-medium"}>
                        {part.stock} available
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user?.role === 'DEALER' && part.stock > 0 && (
                        <button onClick={() => openOrderModal(part)} className="text-primary hover:text-primary/80 font-medium text-sm flex items-center justify-end w-full">
                          <ShoppingCart className="w-4 h-4 mr-1" /> Order
                        </button>
                      )}
                      {part.stock === 0 && <span className="text-gray-400 text-sm">Out of Stock</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-[#0f172a] shadow-sm rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">Order ID</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Part Name</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Quantity</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Total Amount</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">#{order.id.substring(0, 8).toUpperCase()}</td>
                    <td className="px-6 py-4">{order.partName}</td>
                    <td className="px-6 py-4">{order.quantity} Units</td>
                    <td className="px-6 py-4 font-medium text-green-600">₹{order.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                       <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No spare part orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Modal */}
      {orderModalOpen && selectedPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Order Spare Part</h3>
            </div>
            <form onSubmit={submitOrder} className="p-6 space-y-4">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{selectedPart.name}</p>
                <p className="text-sm text-gray-500 mb-4">Price: ₹{selectedPart.price.toLocaleString()} | Available: {selectedPart.stock}</p>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity to Order</label>
                <input 
                  type="number" 
                  min="1" 
                  max={selectedPart.stock}
                  required 
                  className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                  value={orderQuantity} 
                  onChange={e => setOrderQuantity(Number(e.target.value))} 
                />
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-sm">
                  <span>Total Amount:</span>
                  <span className="font-bold text-green-600">₹{(selectedPart.price * orderQuantity).toLocaleString()}</span>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200 dark:border-gray-800 mt-6">
                <button type="button" onClick={() => setOrderModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  Cancel
                </button>
                <button type="submit" disabled={ordering} className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg disabled:opacity-50">
                  {ordering ? 'Processing...' : 'Confirm Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
