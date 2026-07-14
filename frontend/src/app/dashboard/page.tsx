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
  FileText,
  BrainCircuit,
  Zap,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

export default function DashboardOverview() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [aiAnalytics, setAiAnalytics] = useState<any>(null);
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
        const [statsRes, aiRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/analytics')
        ]);
        setStats(statsRes.data);
        setAiAnalytics(aiRes.data);
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

  const handleExport = async (type: 'excel' | 'pdf') => {
    try {
      const res = await api.get(`/orders/export/${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orders_export.${type === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Failed to export ${type}`, err);
      alert(`Failed to export ${type}`);
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

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
            <p className={`text-xs mt-2 font-medium flex items-center ${trend.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>
              {trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
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

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,ID,Model,Quantity,Status\n" + 
      (stats?.totalOrders ? "ORD-1,Round Light Vespa,5,Delivered\nORD-2,BMW Model,2,Dispatched" : "");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "swift_volt_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            <StatCard title="Yearly Revenue" value={`₹${(aiAnalytics?.yearlyRevenue || 0).toLocaleString()}`} icon={DollarSign} trend="+23%" />
          </div>

          {/* AI Analytics Dashboard */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-800/30 rounded-xl p-6 shadow-sm">
            <div className="flex items-center mb-6">
              <BrainCircuit className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mr-2" />
              <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300">AI Enterprise Analytics</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-[#0f172a] p-5 rounded-xl border border-gray-100 dark:border-gray-800">
                <h4 className="text-sm font-semibold text-gray-500 mb-3 flex items-center"><TrendingUp className="w-4 h-4 mr-2" /> Forecasts</h4>
                <div className="space-y-3">
                  <div><span className="text-xs text-gray-400">Sales Forecast</span><p className="font-medium text-green-600">{aiAnalytics?.salesForecast}</p></div>
                  <div><span className="text-xs text-gray-400">Demand Forecast</span><p className="font-medium text-gray-900 dark:text-white">{aiAnalytics?.demandForecast}</p></div>
                  <div><span className="text-xs text-gray-400">Inventory Prediction</span><p className="font-medium text-orange-500">{aiAnalytics?.inventoryPrediction}</p></div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-[#0f172a] p-5 rounded-xl border border-gray-100 dark:border-gray-800">
                <h4 className="text-sm font-semibold text-gray-500 mb-3 flex items-center"><Zap className="w-4 h-4 mr-2" /> Product Performance</h4>
                <div className="space-y-3">
                  <div><span className="text-xs text-gray-400">Most Ordered Scooter</span><p className="font-medium text-primary">{aiAnalytics?.mostOrderedScooter}</p></div>
                  <div><span className="text-xs text-gray-400">Fast Moving Models</span><p className="font-medium text-gray-900 dark:text-white">{aiAnalytics?.fastMovingModels?.join(', ') || 'N/A'}</p></div>
                  <div><span className="text-xs text-gray-400">Slow Moving Models</span><p className="font-medium text-red-500">{aiAnalytics?.slowMovingModels?.join(', ') || 'N/A'}</p></div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#0f172a] p-5 rounded-xl border border-gray-100 dark:border-gray-800">
                <h4 className="text-sm font-semibold text-gray-500 mb-3 flex items-center"><Users className="w-4 h-4 mr-2" /> Network & Revenue</h4>
                <div className="space-y-3">
                  <div><span className="text-xs text-gray-400">Best Dealer</span><p className="font-medium text-gray-900 dark:text-white">{aiAnalytics?.bestDealer}</p></div>
                  <div className="flex justify-between">
                    <div><span className="text-xs text-gray-400">Monthly</span><p className="font-medium text-green-600">₹{(aiAnalytics?.monthlyRevenue || 0).toLocaleString()}</p></div>
                    <div><span className="text-xs text-gray-400">Quarterly</span><p className="font-medium text-green-600">₹{(aiAnalytics?.quarterlyRevenue || 0).toLocaleString()}</p></div>
                  </div>
                  <div><span className="text-xs text-gray-400">Lowest Performing Dealer</span><p className="font-medium text-red-500">{aiAnalytics?.lowestPerformingDealer}</p></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-[#0f172a] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold mb-6">Revenue Growth (Weekly)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}k`} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                    <Line type="monotone" dataKey="sales" stroke="#0284c7" strokeWidth={3} dot={{ r: 4, fill: '#0284c7' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Reports Export Widget */}
            <div className="bg-white dark:bg-[#0f172a] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Export Reports</h3>
              <p className="text-sm text-gray-500 mb-6">Generate professional reports for the business network.</p>
              <div className="space-y-3">
                <button onClick={() => handleExport('pdf')} className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                  <div className="flex items-center"><FileText className="w-4 h-4 mr-3 text-red-500" /><span className="text-sm font-medium">Orders Register (PDF)</span></div>
                  <ArrowDownRight className="w-4 h-4 text-gray-400" />
                </button>
                <button onClick={() => handleExport('excel')} className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                  <div className="flex items-center"><FileText className="w-4 h-4 mr-3 text-green-500" /><span className="text-sm font-medium">Orders Register (Excel)</span></div>
                  <ArrowDownRight className="w-4 h-4 text-gray-400" />
                </button>
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
            <StatCard title="Total Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} icon={DollarSign} trend="+12%" />
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
              
              {/* Reports Export Widget (Dealer) */}
              <div className="bg-white dark:bg-[#0f172a] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Export Reports</h3>
                <p className="text-sm text-gray-500 mb-6">Download your order history.</p>
                <div className="space-y-3">
                  <button onClick={() => handleExport('pdf')} className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                    <div className="flex items-center"><FileText className="w-4 h-4 mr-3 text-red-500" /><span className="text-sm font-medium">Orders Register (PDF)</span></div>
                    <ArrowDownRight className="w-4 h-4 text-gray-400" />
                  </button>
                  <button onClick={() => handleExport('excel')} className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                    <div className="flex items-center"><FileText className="w-4 h-4 mr-3 text-green-500" /><span className="text-sm font-medium">Orders Register (Excel)</span></div>
                    <ArrowDownRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
              
              <div className="bg-white dark:bg-[#0f172a] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold mb-4">Analytics & Recommendations</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Sales Velocity</p>
                    <p className="text-lg font-bold text-blue-900 dark:text-blue-200">15 units sold this week</p>
                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">Trending +12% vs last week</p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/30 rounded-lg">
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-1">Top Performing Model</p>
                    <p className="text-lg font-bold text-purple-900 dark:text-purple-200">Swift Volt X-Pro</p>
                    <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">Accounts for 65% of your sales</p>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/30 rounded-lg">
                    <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">Reorder Recommendation</p>
                    <p className="text-lg font-bold text-green-900 dark:text-green-200">Order 20 units of X-Pro</p>
                    <p className="text-xs text-green-700 dark:text-green-400 mt-1">Based on current sales velocity and lead time</p>
                  </div>
                </div>
              </div>

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
