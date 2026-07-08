"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  FileText, 
  MessageSquare,
  LogOut,
  Bell,
  Menu,
  LayoutGrid,
  Check
} from 'lucide-react';
import api from '@/lib/api';
import { io } from 'socket.io-client';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const userCookie = Cookies.get('user');
    if (!userCookie) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userCookie);
    setUser(parsedUser);
    
    // Fetch initial notifications
    api.get('/notifications').then(res => setNotifications(res.data)).catch(console.error);
    
    // Setup Socket
    const socketUrl = process.env.NODE_ENV === 'production' ? 'https://swift-volt.onrender.com' : 'http://localhost:3001';
    const socket = io(socketUrl);
    
    socket.on(`new_notification_${parsedUser.id}`, (notification) => {
      setNotifications(prev => [notification, ...prev]);
    });
    
    return () => {
      socket.disconnect();
    };
  }, [router]);

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    router.push('/login');
  };

  if (!user) return null; // or a loader

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Catalogue', href: '/dashboard/catalogue', icon: LayoutGrid },
    ...(user.role === 'ADMIN' ? [
      { name: 'Dealers', href: '/dashboard/dealers', icon: Users },
    ] : []),
    { name: 'Inventory', href: '/dashboard/inventory', icon: Package },
    { name: 'Spare Parts', href: '/dashboard/spare-parts', icon: Package },
    { name: 'Warranty', href: '/dashboard/warranty', icon: FileText },
    { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCart },
    { name: 'Billing', href: '/dashboard/billing', icon: FileText },
    { name: 'AI Assistant', href: '/dashboard/ai', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#0f172a] border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col`}>
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
          <span className="text-xl font-bold text-primary">Swift Volt</span>
          <span className="ml-2 text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">{user.role}</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary text-white' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-primary dark:hover:text-primary'
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-primary'}`} />
                {item.name}
              </a>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-[#0f172a] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
          <div className="flex items-center flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden md:block ml-4 flex-1 max-w-md">
              <form onSubmit={(e) => {
                e.preventDefault();
                const q = (e.target as any).search.value;
                if (q) router.push(`/dashboard/search?q=${encodeURIComponent(q)}`);
              }} className="relative flex items-center">
                <input 
                  name="search"
                  type="text" 
                  placeholder="Search orders, vehicles, dealers..." 
                  className="w-full pl-4 pr-10 py-1.5 border border-gray-200 dark:border-gray-700 rounded-full bg-gray-50 dark:bg-gray-800/50 text-sm focus:ring-primary focus:border-primary" 
                />
                <button type="submit" className="absolute right-3 text-gray-400">
                   <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                   </svg>
                </button>
              </form>
            </div>
          </div>
          <div className="ml-4 flex items-center md:ml-6 space-x-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:text-gray-500 relative"
              >
                <Bell className="h-6 w-6" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900" />
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#0f172a] rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    <button 
                      onClick={async () => {
                        await api.put('/notifications/read-all');
                        setNotifications(notifications.map(n => ({...n, read: true})));
                      }}
                      className="text-xs text-primary hover:underline"
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">No notifications yet.</div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          onClick={async () => {
                            if (!notif.read) {
                              await api.put(`/notifications/${notif.id}/read`);
                              setNotifications(notifications.map(n => n.id === notif.id ? {...n, read: true} : n));
                            }
                            if (notif.link) {
                              router.push(notif.link);
                              setShowNotifications(false);
                            }
                          }}
                          className={`p-4 border-b border-gray-100 dark:border-gray-800 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${notif.read ? 'opacity-60' : 'bg-blue-50/30 dark:bg-blue-900/10'}`}
                        >
                          <div className="flex items-start">
                            <div className={`w-2 h-2 mt-1.5 rounded-full mr-3 shrink-0 ${notif.read ? 'bg-transparent' : 'bg-primary'}`}></div>
                            <div>
                              <h4 className={`text-sm ${notif.read ? 'font-medium text-gray-700 dark:text-gray-300' : 'font-bold text-gray-900 dark:text-white'}`}>{notif.title}</h4>
                              <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center max-w-xs text-sm rounded-full focus:outline-none">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {user.name.charAt(0)}
              </div>
              <span className="ml-3 font-medium text-gray-700 dark:text-gray-200 hidden md:block">{user.name}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
