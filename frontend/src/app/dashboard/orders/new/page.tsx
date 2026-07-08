"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Package, Truck, ArrowRight, DollarSign, Plus, Trash2 } from 'lucide-react';

interface CartItem {
  id: string;
  model: string;
  color: string;
  quantity: number | '';
  price: number;
  availableColors: string[];
}

function NewOrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [inventory, setInventory] = useState<any[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);

  const [items, setItems] = useState<CartItem[]>([]);
  
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentOption, setPaymentOption] = useState('Wire Transfer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch Inventory
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await api.get('/scooters');
        setInventory(res.data);
        
        // Initialize first item
        if (res.data.length > 0) {
          const preselectedModel = searchParams?.get('model');
          const preselectedColor = searchParams?.get('color');
          
          let defaultScooter = res.data[0];
          if (preselectedModel) {
            const found = res.data.find((s: any) => s.model === preselectedModel);
            if (found) defaultScooter = found;
          }
          
          const colors = defaultScooter.colors ? JSON.parse(defaultScooter.colors) : [];
          setItems([{
            id: Math.random().toString(36).substring(7),
            model: defaultScooter.model,
            color: preselectedColor && colors.includes(preselectedColor) ? preselectedColor : (colors[0] || 'Default'),
            quantity: 1,
            price: defaultScooter.dealerPrice,
            availableColors: colors
          }]);
        }
      } catch (err) {
        console.error('Failed to load inventory', err);
      } finally {
        setLoadingInventory(false);
      }
    };
    fetchInventory();
  }, [searchParams]);

  const handleAddItem = () => {
    if (inventory.length === 0) return;
    const defaultScooter = inventory[0];
    const colors = defaultScooter.colors ? JSON.parse(defaultScooter.colors) : [];
    setItems([
      ...items,
      {
        id: Math.random().toString(36).substring(7),
        model: defaultScooter.model,
        color: colors[0] || 'Default',
        quantity: 1,
        price: defaultScooter.dealerPrice,
        availableColors: colors
      }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) return; // Must have at least 1 item
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof CartItem, value: any) => {
    setItems(items.map(item => {
      if (item.id !== id) return item;
      
      const updatedItem = { ...item, [field]: value };
      
      // If model changes, update price and available colors
      if (field === 'model') {
        const scooter = inventory.find(s => s.model === value);
        if (scooter) {
          updatedItem.price = scooter.dealerPrice;
          const colors = scooter.colors ? JSON.parse(scooter.colors) : [];
          updatedItem.availableColors = colors;
          updatedItem.color = colors[0] || 'Default';
        }
      }
      
      return updatedItem;
    }));
  };

  const calculateSubtotal = () => {
    return items.reduce((total, item) => {
      const qty = typeof item.quantity === 'number' ? item.quantity : 0;
      return total + (item.price * qty);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const gst = subtotal * 0.18; // 18% GST
  const totalAmount = subtotal + gst;
  
  const totalUnits = items.reduce((sum, item) => sum + (typeof item.quantity === 'number' ? item.quantity : 0), 0);
  
  const isValid = items.every(item => typeof item.quantity === 'number' && item.quantity >= 1 && item.quantity <= 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setError('Each line item must have a quantity between 1 and 100 units.');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      // Use the bulk quick order endpoint
      await api.post('/orders/quick', {
        items: items.map(item => ({
          model: item.model,
          color: item.color,
          quantity: item.quantity
        })),
        deliveryAddress,
        paymentOption
      });
      router.push('/dashboard/orders');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to place bulk order');
    } finally {
      setLoading(false);
    }
  };

  if (loadingInventory) {
    return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Place Bulk Order</h1>
        <p className="text-gray-500 dark:text-gray-400">Order multiple models and configurations at once. Minimum 1 unit per line item.</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#0f172a] shadow-sm rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
              <h2 className="text-lg font-bold text-foreground flex items-center">
                <Package className="w-5 h-5 mr-2 text-primary" />
                Cart Items
              </h2>
              <button 
                type="button" 
                onClick={handleAddItem}
                className="text-sm font-medium text-primary hover:text-primary/80 flex items-center bg-primary/10 px-3 py-1.5 rounded-lg"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Model
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {items.map((item, index) => (
                <div key={item.id} className="relative grid grid-cols-1 md:grid-cols-12 gap-4 items-end pb-6 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                  <div className="md:col-span-5">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Scooter Model</label>
                    <select 
                      value={item.model} 
                      onChange={(e) => updateItem(item.id, 'model', e.target.value)}
                      className="block w-full p-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-primary focus:border-primary font-medium"
                    >
                      {inventory.map(inv => (
                        <option key={inv.id} value={inv.model}>{inv.model} - ${inv.dealerPrice.toLocaleString()}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Color</label>
                    <select 
                      value={item.color} 
                      onChange={(e) => updateItem(item.id, 'color', e.target.value)}
                      className="block w-full p-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-primary focus:border-primary"
                    >
                      {item.availableColors.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', e.target.value === '' ? '' : parseInt(e.target.value))}
                      className="block w-full p-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-primary focus:border-primary text-center font-bold"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-1 flex justify-end pb-1">
                    <button 
                      type="button" 
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={items.length === 1}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Payment Section */}
          <div className="bg-white dark:bg-[#0f172a] shadow-sm rounded-xl border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-lg font-bold text-foreground flex items-center mb-6">
              <Truck className="w-5 h-5 mr-2 text-primary" />
              Logistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Delivery Address</label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter complete dealership address"
                  className="block w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-primary focus:border-primary"
                  required
                />
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
                  <option value="Dealer Credit Line">Dealer Credit Line</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-1">
          <div className="bg-white dark:bg-[#0f172a] shadow-sm rounded-xl border border-gray-100 dark:border-gray-800 p-6 sticky top-6">
            <h2 className="text-lg font-bold text-foreground mb-6 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-primary" />
              Order Summary
            </h2>
            
            <div className="space-y-4 text-sm max-h-64 overflow-y-auto pr-2 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
              {items.map((item, idx) => {
                const qty = typeof item.quantity === 'number' ? item.quantity : 0;
                return (
                  <div key={item.id} className="flex justify-between items-start text-gray-600 dark:text-gray-400 text-xs">
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white mr-1">{qty}x</span> 
                      {item.model}
                      <div className="text-[10px] text-gray-400 mt-0.5 ml-5">{item.color}</div>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white text-right w-20">
                      ${(item.price * qty).toLocaleString()}
                    </span>
                  </div>
                )
              })}
            </div>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Total Units</span>
                <span className="font-bold text-gray-900 dark:text-white">{totalUnits} Units</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-white">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>GST (18%)</span>
                <span className="font-medium text-gray-900 dark:text-white">${gst.toLocaleString()}</span>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <span className="text-base font-bold text-gray-900 dark:text-white">Grand Total</span>
                <span className="text-xl font-bold text-primary">${totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !isValid}
              className="mt-6 w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm Bulk Order'}
              {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
            </button>
            <p className="text-xs text-center text-gray-500 mt-4">By placing this bulk order, you agree to Swift Volt's Dealership Agreement.</p>
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
