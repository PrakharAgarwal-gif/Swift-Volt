"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Truck, MapPin, Map, Package, Settings, Factory } from 'lucide-react';
import api from '@/lib/api';

const MANUFACTURING_STEPS = [
  "Order Received",
  "Chassis Allocation",
  "Motor Assembly",
  "Battery Integration",
  "Quality Testing",
  "Dispatched",
  "In Transit",
  "Delivered"
];

const getIconForStep = (step: string) => {
  if (step === "Order Received") return <Package className="w-5 h-5 text-white" />;
  if (step === "Dispatched" || step === "In Transit") return <Truck className="w-5 h-5 text-white" />;
  if (step === "Delivered") return <CheckCircle2 className="w-5 h-5 text-white" />;
  if (step === "Quality Testing") return <Settings className="w-5 h-5 text-white" />;
  return <Factory className="w-5 h-5 text-white" />;
};

export default function TrackingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In reality, fetch single order by ID. Here we mock it if API doesn't have a specific endpoint.
    // Assuming /orders exists and we can filter, or we just fetch all and find it.
    api.get('/orders')
      .then(res => {
        const found = res.data.find((o: any) => o.id === id);
        setOrder(found);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex h-[80vh] items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  if (!order) return <div className="p-8 text-center text-gray-500">Order not found.</div>;

  const currentStepIndex = MANUFACTURING_STEPS.indexOf(order.status) !== -1 ? MANUFACTURING_STEPS.indexOf(order.status) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="flex items-center space-x-4">
        <button onClick={() => router.back()} className="p-2 bg-white dark:bg-[#0f172a] rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Track Shipment</h1>
          <p className="text-sm text-gray-500">Order #{order.id.substring(0,8).toUpperCase()}</p>
        </div>
      </div>

      {/* Map Placeholder for Future GPS Integration */}
      <div className="bg-gray-200 dark:bg-gray-800 h-48 rounded-xl flex flex-col items-center justify-center border border-gray-300 dark:border-gray-700 relative overflow-hidden">
        <Map className="w-10 h-10 text-gray-400 mb-2 opacity-50" />
        <p className="text-sm font-medium text-gray-500">Live GPS Tracking (Future Module)</p>
        
        {currentStepIndex >= 5 && (
          <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
            <div className="bg-white/90 dark:bg-black/80 px-4 py-2 rounded-full shadow-sm flex items-center animate-pulse">
              <MapPin className="w-4 h-4 text-primary mr-2" />
              <span className="text-xs font-bold text-primary uppercase tracking-wide">Last Location: Transit Hub</span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-[#0f172a] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <h2 className="font-semibold text-lg text-gray-900 dark:text-white mb-6">Shipment Timeline</h2>
        
        <div className="relative border-l-2 border-gray-100 dark:border-gray-800 ml-4 space-y-8">
          {MANUFACTURING_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const isPending = idx > currentStepIndex;

            return (
              <div key={step} className={`relative flex items-center ${isPending ? 'opacity-50' : 'opacity-100'}`}>
                {/* Timeline Dot */}
                <div className={`absolute -left-[17px] w-8 h-8 rounded-full flex items-center justify-center shadow-sm
                  ${isCompleted ? 'bg-green-500' : isCurrent ? 'bg-primary ring-4 ring-primary/20 animate-pulse' : 'bg-gray-300 dark:bg-gray-700'}`}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5 text-white" /> : getIconForStep(step)}
                </div>

                <div className="ml-10">
                  <h3 className={`font-semibold ${isCurrent ? 'text-primary' : 'text-gray-900 dark:text-gray-300'}`}>{step}</h3>
                  <p className="text-xs text-gray-500">
                    {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'} 
                    {idx === 0 && ` • ${new Date(order.createdAt).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {order.dispatchDate && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Transport Details</h3>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <p><span className="font-medium">Logistics Partner:</span> {order.transporterName || 'Express Logistics'}</p>
            <p><span className="font-medium">LR Number:</span> {order.lrNumber || 'LR-PENDING'}</p>
            <p><span className="font-medium">Expected Arrival:</span> {new Date(order.expectedArrival).toLocaleDateString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
