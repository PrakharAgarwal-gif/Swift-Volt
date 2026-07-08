"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Package, Battery, Zap, Timer, Search, X, ChevronRight, Check } from 'lucide-react';

export default function ProductCataloguePage() {
  const [scooters, setScooters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedModel, setSelectedModel] = useState<any | null>(null);

  useEffect(() => {
    const fetchScooters = async () => {
      try {
        const res = await api.get('/scooters');
        setScooters(res.data);
      } catch (err) {
        console.error("Failed to load scooters", err);
      } finally {
        setLoading(false);
      }
    };
    fetchScooters();
  }, []);

  const filteredScooters = scooters.filter(s => 
    s.model.toLowerCase().includes(search.toLowerCase()) || 
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Product Catalogue</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Explore our premium enterprise scooter models and technical specifications.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search models..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#0f172a] text-sm focus:ring-primary focus:border-primary shadow-sm transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredScooters.map((scooter) => (
          <div 
            key={scooter.id} 
            className="bg-white dark:bg-[#0f172a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden hover:shadow-md transition-all group flex flex-col cursor-pointer"
            onClick={() => setSelectedModel(scooter)}
          >
            <div className="h-56 bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
              {scooter.imageUrl ? (
                <img 
                  src={scooter.imageUrl} 
                  alt={scooter.model} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Package className="w-16 h-16 opacity-20" />
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-md ${scooter.category === 'Special' ? 'bg-purple-500/90 text-white' : scooter.category === 'Commercial' ? 'bg-orange-500/90 text-white' : 'bg-white/90 text-gray-800 dark:bg-gray-800/90 dark:text-gray-200'}`}>
                  {scooter.category}
                </span>
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{scooter.model}</h3>
                <span className="text-lg font-bold text-primary">₹{scooter.dealerPrice.toLocaleString()}</span>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6">
                {scooter.description || "Premium electric scooter engineered for efficiency and performance."}
              </p>
              
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-6 mt-auto">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mr-3">
                    <Battery className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Battery</div>
                    <div className="font-medium">{scooter.batteryCapacity || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mr-3">
                    <Zap className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Motor</div>
                    <div className="font-medium">{scooter.motorPower || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mr-3">
                    <ChevronRight className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Range</div>
                    <div className="font-medium">{scooter.range || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mr-3">
                    <Timer className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Top Speed</div>
                    <div className="font-medium">{scooter.maxSpeed || 'N/A'}</div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500 hover:text-primary transition-colors flex items-center">
                  View Full Specs
                </span>
                <a 
                  href={`/dashboard/orders/new?model=${encodeURIComponent(scooter.model)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Order Now
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredScooters.length === 0 && (
        <div className="py-20 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No models found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your search criteria.</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedModel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedModel(null)}></div>
          <div className="relative bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200">
            
            {/* Image Side */}
            <div className="md:w-2/5 h-64 md:h-auto bg-gray-100 dark:bg-gray-900 relative">
              {selectedModel.imageUrl ? (
                <img src={selectedModel.imageUrl} alt={selectedModel.model} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <Package className="w-20 h-20 opacity-20" />
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-md bg-white/90 text-gray-800 dark:bg-gray-800/90 dark:text-gray-200">
                  {selectedModel.category}
                </span>
              </div>
              <button 
                onClick={() => setSelectedModel(null)}
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm transition-colors md:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Side */}
            <div className="flex-1 flex flex-col h-full max-h-full overflow-y-auto">
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{selectedModel.model}</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">{selectedModel.description || "Premium electric scooter engineered for efficiency and performance."}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedModel(null)}
                    className="hidden md:flex p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Dealer Price</div>
                    <div className="text-xl font-bold text-primary">₹{selectedModel.dealerPrice.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Retail Price</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">₹{selectedModel.retailPrice.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Available Stock</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{selectedModel.quantity} Units</div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Technical Specifications</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mb-8 text-sm">
                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                    <span className="text-gray-500">Battery Capacity</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedModel.batteryCapacity || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                    <span className="text-gray-500">Motor Power</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedModel.motorPower || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                    <span className="text-gray-500">Max Speed</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedModel.maxSpeed || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                    <span className="text-gray-500">Driving Range</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedModel.range || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                    <span className="text-gray-500">Charging Time</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedModel.chargingTime || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                    <span className="text-gray-500">Controller</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedModel.controller || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                    <span className="text-gray-500">Tyre Size</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedModel.tyreSize || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                    <span className="text-gray-500">Brake Type</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedModel.brakeType || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                    <span className="text-gray-500">Suspension</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedModel.suspension || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                    <span className="text-gray-500">Vehicle Weight</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedModel.weight || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                    <span className="text-gray-500">Load Capacity</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedModel.payload || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                    <span className="text-gray-500">Warranty</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedModel.warrantyPeriod || 'N/A'}</span>
                  </div>
                </div>

                {selectedModel.features && (
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">Key Features</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedModel.features.split(',').map((feature: string, idx: number) => (
                        <div key={idx} className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                          <Check className="w-4 h-4 text-green-500 mr-2 shrink-0" />
                          <span>{feature.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-auto pt-6 flex gap-4">
                  <a 
                    href={`/dashboard/orders/new?model=${encodeURIComponent(selectedModel.model)}`}
                    className="flex-1 flex justify-center py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    Place Order Now
                  </a>
                  {selectedModel.brochureUrl && (
                    <a 
                      href={selectedModel.brochureUrl}
                      target="_blank"
                      className="flex-1 flex justify-center py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                    >
                      Download Brochure
                    </a>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
