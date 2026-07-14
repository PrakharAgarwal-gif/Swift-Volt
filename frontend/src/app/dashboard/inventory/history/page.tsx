"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { ArrowLeft, Search, Activity, Package } from 'lucide-react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function InventoryHistoryPage() {
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const userCookie = Cookies.get('user');
    if (!userCookie) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userCookie);
    setUser(parsedUser);

    if (parsedUser.role !== 'ADMIN') {
      router.push('/dashboard/inventory');
      return;
    }
    
    const fetchMovements = async () => {
      try {
        const res = await api.get('/inventory/movements');
        setMovements(res.data);
      } catch (err) {
        console.error("Error fetching movements", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovements();
  }, [router]);

  const filteredMovements = movements.filter(m => 
    (m.productName || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.toLocation || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.orderId || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/inventory" className="p-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-[#0f172a] hover:bg-gray-50 text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory Movement History</h1>
          <p className="text-gray-500 dark:text-gray-400">Audit trail of all stock transactions.</p>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white dark:bg-[#0f172a] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by product, location, or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#0f172a] shadow-sm rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">Date & Time</th>
                <th scope="col" className="px-6 py-4 font-semibold">Transaction ID</th>
                <th scope="col" className="px-6 py-4 font-semibold">Product</th>
                <th scope="col" className="px-6 py-4 font-semibold">Qty</th>
                <th scope="col" className="px-6 py-4 font-semibold">From ➔ To</th>
                <th scope="col" className="px-6 py-4 font-semibold">Order / Reference</th>
                <th scope="col" className="px-6 py-4 font-semibold">Performed By</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovements.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(item.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-400">
                    {item.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center">
                    <Package className="w-4 h-4 mr-2 text-blue-500" />
                    <div>
                      {item.productName}
                      <span className="block text-[10px] text-gray-400">{item.productType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{item.quantity}</td>
                  <td className="px-6 py-4 text-xs">
                    <span className="text-red-500">{item.fromLocation}</span>
                    <span className="mx-2 text-gray-300">➔</span>
                    <span className="text-green-500">{item.toLocation}</span>
                  </td>
                  <td className="px-6 py-4">
                    {item.orderId ? (
                      <Link href={`/dashboard/orders/management`} className="text-primary hover:underline">
                        Order #{item.orderId.substring(0,6).toUpperCase()}
                      </Link>
                    ) : (
                      item.remarks || 'Manual Adjustment'
                    )}
                  </td>
                  <td className="px-6 py-4">{item.performedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredMovements.length === 0 && (
            <div className="p-12 flex flex-col items-center justify-center text-gray-500">
              <Activity className="w-12 h-12 text-gray-300 mb-3" />
              <p>No inventory movements recorded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
