"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Package, Receipt, ArrowLeft, TrendingUp, DollarSign, Building2 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function DealerInsightsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await api.get(`/dealers/${id}/insights`);
        setData(res.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load dealer insights');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchInsights();
  }, [id]);

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  if (error || !data) {
    return <div className="p-8 text-center text-red-500 font-medium">{error || 'Dealer not found'}</div>;
  }

  const { dealer, inventory, invoices } = data;

  const totalStock = inventory.reduce((sum: number, item: any) => sum + item.availableQty, 0);
  
  let totalSales = 0;
  invoices.forEach((inv: any) => {
    if (inv.items) {
      try {
        const itemsList = JSON.parse(inv.items);
        itemsList.forEach((item: any) => {
          totalSales += (parseInt(item.quantity) || 1);
        });
      } catch(e) {}
    } else {
      totalSales += 1;
    }
  });

  const totalRevenue = invoices.reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex items-center space-x-4 mb-6">
        <Link href="/dashboard/dealers" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center">
            <Building2 className="w-8 h-8 mr-3 text-primary" />
            {dealer.companyName}
          </h1>
          <p className="text-gray-500 mt-1">{dealer.address}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <Package className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Current Stock</p>
            <p className="text-2xl font-black">{totalStock} Units</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Total Scooters Sold</p>
            <p className="text-2xl font-black">{totalSales}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Total Billed Value</p>
            <p className="text-2xl font-black">₹{totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 className="text-lg font-bold">Current Inventory</h3>
          </div>
          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-900 text-xs text-gray-500 uppercase border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Product</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold text-right">Available</th>
                  <th className="px-6 py-4 font-semibold text-right">Sold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {inventory.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No stock available</td></tr>
                ) : (
                  inventory.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{inv.productName}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-semibold">{inv.productType}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">{inv.availableQty}</td>
                      <td className="px-6 py-4 text-right text-gray-500">{inv.soldQty}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 className="text-lg font-bold">Recent Customer Sales</h3>
          </div>
          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-900 text-xs text-gray-500 uppercase border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold text-right">Selling Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {invoices.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">No sales recorded</td></tr>
                ) : (
                  invoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {inv.customerName}
                        <div className="text-xs text-gray-500">{inv.invoiceNumber}</div>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-primary">
                        ₹{(inv.totalAmount || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
