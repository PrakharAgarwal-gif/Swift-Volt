"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Plus, Minus, ShoppingCart } from 'lucide-react';

const MODELS = [
  "Single Light", "Double Light", "Round Light Vespa", "Big Round Light Vespa",
  "U Light", "BMW Model", "OLA Model", "Jali Vespa", "Q7", "C90", "Chetak",
  "Handicapped Pedal Model", "Two-Wheeler Loader", "Three-Wheeler Loader"
];

export default function QuickOrderPage() {
  const router = useRouter();
  const [orderItems, setOrderItems] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateQuantity = (model: string, delta: number) => {
    setOrderItems(prev => {
      const current = prev[model] || 0;
      const next = Math.max(0, current + delta);
      const updated = { ...prev, [model]: next };
      if (next === 0) delete updated[model];
      return updated;
    });
  };

  const totalUnits = Object.values(orderItems).reduce((a, b) => a + b, 0);

  const handleSubmit = async () => {
    if (totalUnits === 0) return setError('Please add at least one vehicle.');
    
    setLoading(true);
    setError('');
    
    const items = Object.entries(orderItems).map(([model, quantity]) => ({
      model,
      quantity,
      color: 'Standard' // Simplified for quick order
    }));

    try {
      await api.post('/orders/quick', {
        items,
        deliveryAddress: 'Default Dealer Address',
        paymentOption: 'Wire Transfer'
      });
      router.push('/dashboard/orders');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pb-24">
      <div className="text-center pt-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Order</h1>
        <p className="text-gray-500 text-sm">Mobile-optimized bulk ordering.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {MODELS.map(model => (
          <div key={model} className="bg-white dark:bg-[#0f172a] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <span className="font-medium text-gray-900 dark:text-gray-100">{model}</span>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => updateQuantity(model, -1)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center font-bold text-gray-900 dark:text-white">
                {orderItems[model] || 0}
              </span>
              <button 
                onClick={() => updateQuantity(model, 1)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Checkout Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-[#0f172a] border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:left-64 flex justify-between items-center z-40">
        <div>
          <p className="text-sm text-gray-500">Total Units</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{totalUnits}</p>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={loading || totalUnits === 0}
          className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium flex items-center shadow-lg shadow-primary/30"
        >
          {loading ? 'Processing...' : (
            <>
              <ShoppingCart className="h-5 w-5 mr-2" />
              Submit Order
            </>
          )}
        </button>
      </div>
    </div>
  );
}
