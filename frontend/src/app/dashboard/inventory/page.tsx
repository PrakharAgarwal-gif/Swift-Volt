"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Package, Search, Filter } from 'lucide-react';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await api.get('/scooters');
        setInventory(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Global Inventory</h1>
          <p className="text-gray-500 dark:text-gray-400">Available scooters for order across the Swift Volt network.</p>
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search models..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#0f172a] text-sm focus:ring-primary focus:border-primary"
            />
          </div>
          <button className="flex items-center px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#0f172a] text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0f172a] shadow-sm rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">Model</th>
                <th scope="col" className="px-6 py-4 font-semibold">Color</th>
                <th scope="col" className="px-6 py-4 font-semibold">Price (Unit)</th>
                <th scope="col" className="px-6 py-4 font-semibold">Available Stock</th>
                <th scope="col" className="px-6 py-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center">
                    <Package className="w-5 h-5 mr-3 text-primary" />
                    {item.model}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                      {item.color}
                    </span>
                  </td>
                  <td className="px-6 py-4">${item.price.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${item.quantity > 50 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      {item.quantity} Units
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <a href={`/dashboard/orders/new?model=${encodeURIComponent(item.model)}&color=${encodeURIComponent(item.color)}`} className="text-primary hover:text-primary/80 font-medium hover:underline">
                      Place Order
                    </a>
                  </td>
                </tr>
              ))}
              {inventory.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No inventory found.
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
