"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Battery, Zap, Timer, ChevronRight, Check } from 'lucide-react';

export default function Home() {
  const [scooters, setScooters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Determine backend URL
    const backendHost = typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? window.location.hostname : 'localhost';
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? 'https://swift-volt.onrender.com/api' 
      : `http://${backendHost}:3001/api`;

    const fetchScooters = async () => {
      try {
        const res = await fetch(`${apiUrl}/public/scooters`);
        if (res.ok) {
          const data = await res.json();
          setScooters(data);
        }
      } catch (err) {
        console.error("Failed to load public scooters", err);
      } finally {
        setLoading(false);
      }
    };
    fetchScooters();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-900 dark:text-slate-50">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-2xl font-black bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">SWIFT VOLT</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Dealer Login</Link>
              <Link href="/login" className="px-4 py-2 bg-primary text-white rounded-full text-sm font-bold shadow hover:bg-primary/90 transition-transform hover:scale-105">
                Join Network
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 dark:to-transparent"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            The Future of <br className="hidden md:block"/> Urban Mobility
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto font-medium">
            Explore our premium line of electric scooters engineered for unparalleled performance, remarkable efficiency, and sustainable power.
          </p>
          <div className="flex justify-center gap-4">
            <a href="#models" className="px-8 py-4 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all hover:scale-105">
              Explore Models
            </a>
          </div>
        </div>
      </section>

      {/* Catalogue Section */}
      <section id="models" className="py-20 bg-white dark:bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Fleet</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Discover the perfect ride for your commute. Built with cutting-edge technology and premium materials.</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {scooters.map((scooter) => (
                <div key={scooter.id} className="bg-slate-50 dark:bg-[#020817] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 group">
                  <div className="h-64 relative bg-slate-200 dark:bg-slate-800/50 overflow-hidden">
                    {scooter.imageUrl ? (
                      <img src={scooter.imageUrl} alt={scooter.model} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Package className="w-20 h-20 opacity-20" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md bg-white/90 text-slate-800 dark:bg-slate-800/90 dark:text-slate-200">
                        {scooter.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-2">{scooter.model}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 line-clamp-2">
                      {scooter.description || "Premium electric scooter."}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-white dark:bg-[#0f172a] p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center text-primary mb-1"><Battery className="w-4 h-4 mr-1.5" /><span className="text-[10px] uppercase font-bold tracking-wider">Range</span></div>
                        <div className="font-bold text-lg">{scooter.range || 'N/A'}</div>
                      </div>
                      <div className="bg-white dark:bg-[#0f172a] p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center text-orange-500 mb-1"><Zap className="w-4 h-4 mr-1.5" /><span className="text-[10px] uppercase font-bold tracking-wider">Top Speed</span></div>
                        <div className="font-bold text-lg">{scooter.maxSpeed || 'N/A'}</div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-8">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Key Specs</h4>
                      <div className="flex justify-between text-sm border-b border-slate-200 dark:border-slate-800 pb-2">
                        <span className="text-slate-500">Motor Power</span>
                        <span className="font-medium">{scooter.motorPower || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm border-b border-slate-200 dark:border-slate-800 pb-2">
                        <span className="text-slate-500">Battery</span>
                        <span className="font-medium">{scooter.batteryCapacity || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm border-b border-slate-200 dark:border-slate-800 pb-2">
                        <span className="text-slate-500">Charging Time</span>
                        <span className="font-medium">{scooter.chargingTime || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-500 block">Starting at</span>
                        <span className="text-2xl font-bold">₹{scooter.retailPrice?.toLocaleString() || scooter.dealerPrice?.toLocaleString()}</span>
                      </div>
                      <Link href="/login" className="flex items-center justify-center w-12 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full hover:scale-110 transition-transform">
                        <ChevronRight className="w-6 h-6" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <span className="text-2xl font-black text-white block mb-2">SWIFT VOLT</span>
            <p className="text-sm text-slate-500">© 2026 Swift Volt Enterprise. All rights reserved.</p>
          </div>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-white transition-colors">Dealer Login</Link>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
