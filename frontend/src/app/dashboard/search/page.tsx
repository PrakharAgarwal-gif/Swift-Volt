"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Search, Package, Users, ShoppingCart, FileText } from 'lucide-react';

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<any>({ dealers: [], orders: [], vehicles: [], warranties: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      performSearch(query);
    } else {
      setLoading(false);
    }
  }, [query]);

  const performSearch = async (q: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/search?q=${encodeURIComponent(q)}`);
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  const totalResults = results.dealers.length + results.orders.length + results.vehicles.length + results.warranties.length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Search className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Search Results</h1>
          <p className="text-gray-500 dark:text-gray-400">Found {totalResults} results for "{query}"</p>
        </div>
      </div>

      {totalResults === 0 && (
        <div className="text-center p-12 bg-white dark:bg-[#0f172a] rounded-xl border border-gray-100 dark:border-gray-800">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No matches found across the database.</p>
        </div>
      )}

      {results.dealers.length > 0 && (
        <div className="bg-white dark:bg-[#0f172a] shadow-sm rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center bg-gray-50/50 dark:bg-gray-800/30">
            <Users className="w-5 h-5 mr-2 text-indigo-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Dealers ({results.dealers.length})</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {results.dealers.map((dealer: any) => (
              <div key={dealer.id} className="p-4 px-6 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <a href="/dashboard/dealers" className="block">
                  <p className="font-medium text-gray-900 dark:text-white">{dealer.companyName}</p>
                  <p className="text-sm text-gray-500 mt-1">ID: {dealer.id} | Contact: {dealer.contactPhone}</p>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.orders.length > 0 && (
        <div className="bg-white dark:bg-[#0f172a] shadow-sm rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center bg-gray-50/50 dark:bg-gray-800/30">
            <ShoppingCart className="w-5 h-5 mr-2 text-blue-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Orders ({results.orders.length})</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {results.orders.map((order: any) => (
              <div key={order.id} className="p-4 px-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 flex justify-between items-center">
                <a href="/dashboard/orders" className="block">
                  <p className="font-medium text-gray-900 dark:text-white">Order #{order.id.substring(0, 8).toUpperCase()}</p>
                  <p className="text-sm text-gray-500 mt-1">{order.quantity}x {order.scooterModel} ({order.color})</p>
                  {order.lrNumber && <p className="text-xs text-gray-400 mt-1 font-mono">LR: {order.lrNumber}</p>}
                </a>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-800">{order.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.vehicles.length > 0 && (
        <div className="bg-white dark:bg-[#0f172a] shadow-sm rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center bg-gray-50/50 dark:bg-gray-800/30">
            <Package className="w-5 h-5 mr-2 text-green-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Vehicles ({results.vehicles.length})</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {results.vehicles.map((vehicle: any) => (
              <div key={vehicle.id} className="p-4 px-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{vehicle.scooterModel} ({vehicle.color})</p>
                  <div className="flex gap-4 mt-1">
                    <p className="text-sm text-gray-500 font-mono"><span className="text-xs text-gray-400">CHASSIS:</span> {vehicle.chassisNumber}</p>
                    <p className="text-sm text-gray-500 font-mono"><span className="text-xs text-gray-400">MOTOR:</span> {vehicle.motorNumber}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-800">{vehicle.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.warranties.length > 0 && (
        <div className="bg-white dark:bg-[#0f172a] shadow-sm rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center bg-gray-50/50 dark:bg-gray-800/30">
            <FileText className="w-5 h-5 mr-2 text-red-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Warranties ({results.warranties.length})</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {results.warranties.map((warranty: any) => (
              <div key={warranty.id} className="p-4 px-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 flex justify-between items-center">
                <a href="/dashboard/warranty" className="block">
                  <p className="font-medium text-gray-900 dark:text-white">Warranty #{warranty.id.substring(0, 8).toUpperCase()}</p>
                  <p className="text-sm text-gray-500 mt-1">{warranty.dealerName}</p>
                </a>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-800">{warranty.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
