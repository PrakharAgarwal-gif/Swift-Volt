"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Package, Search, Filter, AlertTriangle, TrendingUp, CheckCircle, PackageOpen } from 'lucide-react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function InventoryPage() {
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState({
    totalCompanyStock: 0,
    totalReservedStock: 0,
    totalDispatchedToday: 0,
    lowStockItems: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [restockItem, setRestockItem] = useState<any>(null);
  const [restockQuantity, setRestockQuantity] = useState('');
  const [restockRemarks, setRestockRemarks] = useState('');
  const [restocking, setRestocking] = useState(false);

  const fetchInventory = async (parsedUser: any) => {
    try {
      if (parsedUser.role === 'ADMIN') {
        const res = await api.get('/inventory/admin');
        const scooters = res.data.scooters || [];
        const parts = res.data.parts || [];
        
        const combined = [
          ...scooters.map((s: any) => ({ ...s, productType: 'SCOOTER', name: s.model })),
          ...parts.map((p: any) => ({ ...p, productType: 'PART', name: p.name }))
        ];
        setInventory(combined);
        
        let tStock = 0;
        let tRes = 0;
        let low = 0;
        
        combined.forEach(i => {
          tStock += i.quantity || i.stock || 0;
          tRes += i.reservedStock || 0;
          if ((i.quantity || i.stock || 0) <= (i.reorderLevel || 10)) {
            low++;
          }
        });
        
        setAdminStats({
          totalCompanyStock: tStock,
          totalReservedStock: tRes,
          totalDispatchedToday: 0,
          lowStockItems: low
        });
      } else if (parsedUser.role === 'DEALER') {
        const res = await api.get('/inventory/dealer');
        setInventory(res.data);
      }
    } catch (err) {
      console.error("Error fetching inventory", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userCookie = Cookies.get('user');
    if (!userCookie) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userCookie);
    setUser(parsedUser);
    
    fetchInventory(parsedUser);
  }, [router]);

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockItem || !restockQuantity) return;
    
    setRestocking(true);
    try {
      await api.post('/inventory/restock', {
        id: restockItem.id,
        type: restockItem.productType,
        quantity: parseInt(restockQuantity),
        remarks: restockRemarks
      });
      setRestockModalOpen(false);
      setRestockQuantity('');
      setRestockRemarks('');
      setRestockItem(null);
      await fetchInventory(user);
    } catch (err) {
      console.error("Failed to restock:", err);
      alert("Failed to restock. Please try again.");
    } finally {
      setRestocking(false);
    }
  };

  const filteredInventory = inventory.filter(item => 
    (item.name || item.productName || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.sku || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {user?.role === 'ADMIN' ? 'Company Inventory Dashboard' : 'Dealer Inventory Dashboard'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {user?.role === 'ADMIN' 
              ? 'Manage factory stock, reservations, and dispatches.' 
              : 'Track your received, sold, and available stock.'}
          </p>
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
          {user?.role === 'ADMIN' && (
            <button 
              onClick={() => router.push('/dashboard/inventory/history')}
              className="px-4 py-2 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Movement History
            </button>
          )}
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#0f172a] text-sm focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
      </div>

      {user?.role === 'ADMIN' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#0f172a] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 mr-4">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Available Stock</div>
              <div className="text-2xl font-bold">{adminStats.totalCompanyStock}</div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#0f172a] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 mr-4">
              <PackageOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Reserved</div>
              <div className="text-2xl font-bold">{adminStats.totalReservedStock}</div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#0f172a] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 mr-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Pending Dispatches</div>
              <div className="text-2xl font-bold">--</div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#0f172a] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 mr-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Low Stock Items</div>
              <div className="text-2xl font-bold text-red-600">{adminStats.lowStockItems}</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#0f172a] shadow-sm rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          {user?.role === 'ADMIN' ? (
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th scope="col" className="px-4 py-4 font-semibold">Product Name</th>
                  <th scope="col" className="px-4 py-4 font-semibold">SKU</th>
                  <th scope="col" className="px-4 py-4 font-semibold">Manufactured</th>
                  <th scope="col" className="px-4 py-4 font-semibold">Available Stock</th>
                  <th scope="col" className="px-4 py-4 font-semibold">Reserved Stock</th>
                  <th scope="col" className="px-4 py-4 font-semibold">Dispatched</th>
                  <th scope="col" className="px-4 py-4 font-semibold">Reorder Level</th>
                  <th scope="col" className="px-4 py-4 font-semibold">Status</th>
                  <th scope="col" className="px-4 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => {
                  const qty = item.quantity ?? item.stock ?? 0;
                  const isLow = qty <= (item.reorderLevel || 10);
                  return (
                    <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="px-4 py-4 font-medium text-gray-900 dark:text-white flex items-center">
                        <Package className="w-4 h-4 mr-2 text-primary" />
                        <div>
                          <div>{item.name}</div>
                          <div className="text-xs text-gray-400">{item.productType}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">{item.sku || 'N/A'}</td>
                      <td className="px-4 py-4">{item.manufacturedQuantity || 0}</td>
                      <td className="px-4 py-4 font-bold">{qty}</td>
                      <td className="px-4 py-4 text-orange-600">{item.reservedStock || 0}</td>
                      <td className="px-4 py-4">{item.dispatchedQuantity || 0}</td>
                      <td className="px-4 py-4">{item.reorderLevel || 10}</td>
                      <td className="px-4 py-4">
                        {isLow ? (
                          <span className="flex items-center text-xs font-medium text-red-600">
                            <AlertTriangle className="w-3 h-3 mr-1" /> Low Stock
                          </span>
                        ) : (
                          <span className="flex items-center text-xs font-medium text-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" /> Optimal
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button 
                          onClick={() => { setRestockItem(item); setRestockModalOpen(true); }}
                          className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-colors"
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">Product Name</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Type</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Received Qty</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Sold Qty</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Available Qty</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Last Dispatch</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Last Order</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {item.productName}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded">{item.productType}</span>
                    </td>
                    <td className="px-6 py-4">{item.receivedQty}</td>
                    <td className="px-6 py-4">{item.soldQty}</td>
                    <td className="px-6 py-4 font-bold text-primary">{item.availableQty}</td>
                    <td className="px-6 py-4">{item.lastDispatchDate ? new Date(item.lastDispatchDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4">{item.lastOrderDate ? new Date(item.lastOrderDate).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {filteredInventory.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              No inventory records found.
            </div>
          )}
        </div>
      </div>

      {/* Restock Modal */}
      {restockModalOpen && restockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
              <h3 className="font-bold text-lg">Restock {restockItem.name}</h3>
              <button onClick={() => setRestockModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-light">&times;</button>
            </div>
            <form onSubmit={handleRestock} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Add Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={restockQuantity}
                    onChange={(e) => setRestockQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-primary focus:border-primary dark:bg-[#0f172a]"
                    placeholder="e.g. 50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remarks (Optional)</label>
                  <textarea
                    rows={2}
                    value={restockRemarks}
                    onChange={(e) => setRestockRemarks(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-primary focus:border-primary dark:bg-[#0f172a]"
                    placeholder="e.g. Received from plant B"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setRestockModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={restocking}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {restocking ? 'Processing...' : 'Confirm Restock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
