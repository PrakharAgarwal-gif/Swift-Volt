"use client";

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { 
  Users, 
  Package, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart,
  AlertTriangle,
  Activity,
  FileText
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

export default function DashboardOverview() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userCookie = Cookies.get('user');
    if (userCookie) {
      const parsedUser = JSON.parse(userCookie);
      setUser(parsedUser);
      fetchStats(parsedUser);
    }
  }, []);

  const fetchStats = async (currentUser: any) => {
    try {
      if (currentUser.role === 'ADMIN') {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } else {
        const res = await api.get('/dealer/profile');
        setStats(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  // Mock chart data for UI purposes
  const salesData = [
    { name: 'Mon', sales: 4 },
    { name: 'Tue', sales: 7 },
    { name: 'Wed', sales: 5 },
    { name: 'Thu', sales: 11 },
    { name: 'Fri', sales: 9 },
    { name: 'Sat', sales: 15 },
    { name: 'Sun', sales: 12 },
  ];

  const StatCard = ({ title, value, icon: Icon, trend, alert = false }: any) => (
    <div className={`bg-white dark:bg-[#0f172a] rounded-xl p-6 shadow-sm border ${alert ? 'border-red-500' : 'border-gray-100 dark:border-gray-800'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-foreground">{value}</h3>
          {trend && (
            <p className={`text-xs mt-2 font-medium ${trend.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>
              {trend} from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${alert ? 'bg-red-50 dark:bg-red-900/30' : 'bg-primary/10'}`}>
          <Icon className={`w-6 h-6 ${alert ? 'text-red-500' : 'text-primary'}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user?.name.split(' ')[0]}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Here's what's happening with your business today.</p>
      </div>

      {user?.role === 'ADMIN' ? (
        <>
          {/* Admin Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Dealers" value={stats?.totalDealers || 0} icon={Users} trend="+12%" />
            <StatCard title="Company Inventory" value={stats?.companyInventory || 0} icon={Package} />
            <StatCard title="Total Orders" value={stats?.totalOrders || 0} icon={ShoppingCart} trend="+5.4%" />
            <StatCard title="Total Revenue" value={`$${(stats?.totalRevenue || 0).toLocaleString()}`} icon={DollarSign} trend="+23%" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-[#0f172a] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold mb-6">Revenue Growth (Weekly)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}k`} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                    <Line type="monotone" dataKey="sales" stroke="#0284c7" strokeWidth={3} dot={{ r: 4, fill: '#0284c7' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Activity or Dealer Rankings */}
            <div className="bg-white dark:bg-[#0f172a] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Top Performing Dealers</h3>
              <div className="space-y-4">
                {['ABC Motors', 'City Scooters', 'EV Hub', 'Volt Retail'].map((dealer, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm mr-3">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{dealer}</p>
                        <p className="text-xs text-gray-500">{Math.floor(Math.random() * 50) + 10} sales</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-green-500">9{8 - i}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Dealer Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Available Stock" value={stats?.stock || 0} icon={Package} alert={stats?.stock < 15} />
            <StatCard title="Total Scooters Sold" value={stats?.totalSales || 0} icon={TrendingUp} trend="+8%" />
            <StatCard title="Total Revenue" value={`$${(stats?.totalRevenue || 0).toLocaleString()}`} icon={DollarSign} trend="+12%" />
            <StatCard title="Performance Score" value={`${stats?.performanceScore || 0}%`} icon={Activity} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Chart */}
            <div className="bg-white dark:bg-[#0f172a] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold mb-6">Daily Sales (This Week)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                    <Bar dataKey="sales" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Actions & Alerts */}
            <div className="space-y-6">
              {stats?.stock < 15 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5 flex items-start">
                  <AlertTriangle className="w-6 h-6 text-red-500 mr-3 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-red-800 dark:text-red-400 font-semibold mb-1">Low Stock Alert</h4>
                    <p className="text-sm text-red-600 dark:text-red-300">
                      Your current stock is at {stats?.stock} units. Consider placing an order soon to meet demand.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="bg-white dark:bg-[#0f172a] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <a href="/dashboard/orders/new" className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary/20">
                    <ShoppingCart className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Place Order</span>
                  </a>
                  <a href="/dashboard/billing" className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary/20">
                    <FileText className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Generate Invoice</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
