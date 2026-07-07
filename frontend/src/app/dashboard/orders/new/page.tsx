"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Package, Truck, ArrowRight, DollarSign } from 'lucide-react';

function NewOrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [model, setModel] = useState(searchParams?.get('model') || 'Swift Volt X-Pro');
  const [color, setColor] = useState(searchParams?.get('color') || 'Electric Blue');
  const [quantity, setQuantity] = useState<number>(12);
  const [accessories, setAccessories] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentOption, setPaymentOption] = useState('Wire Transfer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const unitPrice = model === 'Swift Volt X-Pro' ? 1200 : model === 'Swift Volt Max' ? 1500 : 800;
  const subtotal = unitPrice * quantity;
  const gst = subtotal * 0.18; // 18% GST
  const total = subtotal + gst;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity < 12 || quantity > 40) {
      setError('Order quantity must be between 12 and 40 units.');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      await api.post('/orders', {
        scooterModel: model,
        quantity,
        color,
        accessories,
        deliveryAddress,
        paymentOption
      });
      router.push('/dashboard/orders');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Place New Order</h1>
        <p className="text-gray-500 dark:text-gray-400">Order inventory for your dealership. Minimum 12 units, Maximum 40 units.</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#0f172a] shadow-sm rounded-xl border border-gray-100 dark:border-gray-800 p-6">
            <form id="orderForm" onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Scooter Model</label>
                  <select 
                    value={model} 
                    onChange={(e) => setModel(e.target.value)}
                    className="block w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-primary focus:border-primary"
                  >
                    <option value="Swift Volt X-Pro">Swift Volt X-Pro</option>
                    <option value="Swift Volt Max">Swift Volt Max</option>
                    <option value="Swift Volt Lite">Swift Volt Lite</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                  <select 
                    value={color} 
                    onChange={(e) => setColor(e.target.value)}
                    className="block w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-primary focus:border-primary"
                  >
                    <option value="Electric Blue">Electric Blue</option>
                    <option value="Midnight Black">Midnight Black</option>
                    <option value="Pearl White">Pearl White</option>
                    <option value="Crimson Red">Crimson Red</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantity (12 - 40 units)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Package className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    min="12"
                    max="40"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="block w-full pl-10 p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Accessories / Add-ons</label>
                <input
                  type="text"
                  value={accessories}
                  onChange={(e) => setAccessories(e.target.value)}
                  placeholder="e.g. 10x Fast Chargers, 5x Helmets"
                  className="block w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Delivery Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Truck className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter complete dealership address"
                    className="block w-full pl-10 p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Option</label>
                <select 
                  value={paymentOption} 
                  onChange={(e) => setPaymentOption(e.target.value)}
                  className="block w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-primary focus:border-primary"
                >
                  <option value="Wire Transfer">Wire Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Net Banking">Net Banking</option>
                </select>
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-[#0f172a] shadow-sm rounded-xl border border-gray-100 dark:border-gray-800 p-6 sticky top-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-primary" />
              Order Summary
            </h2>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Model</span>
                <span className="font-medium text-gray-900 dark:text-white">{model}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Quantity</span>
                <span className="font-medium text-gray-900 dark:text-white">{quantity} Units</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Unit Price</span>
                <span className="font-medium text-gray-900 dark:text-white">${unitPrice.toLocaleString()}</span>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-white">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>GST (18%)</span>
                <span className="font-medium text-gray-900 dark:text-white">${gst.toLocaleString()}</span>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <span className="text-base font-bold text-gray-900 dark:text-white">Total Amount</span>
                <span className="text-xl font-bold text-primary">${total.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              form="orderForm"
              disabled={loading || quantity < 12 || quantity > 40}
              className="mt-6 w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm Order'}
              {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
            </button>
            <p className="text-xs text-center text-gray-500 mt-4">By placing this order, you agree to Swift Volt's Dealer Terms and Conditions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewOrderPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
      <NewOrderForm />
    </Suspense>
  );
}
