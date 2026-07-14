"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Package, Truck, ArrowRight, DollarSign, Plus, Trash2, CreditCard, Smartphone, Building, Settings, Wrench } from 'lucide-react';

interface CartItem {
  id: string;
  type: 'SCOOTER' | 'PART' | 'ACCESSORY';
  model: string;
  color: string;
  quantity: number | '';
  price: number;
  availableColors: string[];
}

const ACCESSORIES_LIST = [
  { name: 'Charger', price: 50 },
  { name: 'Helmet', price: 30 },
  { name: 'Battery', price: 400 },
  { name: 'Seat Cover', price: 15 },
  { name: 'Side Guard', price: 20 },
  { name: 'Foot Mat', price: 10 },
  { name: 'Mobile Holder', price: 12 },
  { name: 'Other Accessories', price: 25 },
];

function NewOrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [inventory, setInventory] = useState<any[]>([]);
  const [spareParts, setSpareParts] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [items, setItems] = useState<CartItem[]>([]);
  
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [preferredDeliveryDate, setPreferredDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentOption, setPaymentOption] = useState('Online Payment (Paytm, Cards, Net Banking)');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scootersRes, partsRes] = await Promise.all([
          api.get('/scooters'),
          api.get('/spare-parts')
        ]);
        
        setInventory(scootersRes.data);
        setSpareParts(partsRes.data);
        
        if (scootersRes.data.length > 0) {
          const preselectedModel = searchParams?.get('model');
          const preselectedColor = searchParams?.get('color');
          
          let defaultScooter = scootersRes.data[0];
          if (preselectedModel) {
            const found = scootersRes.data.find((s: any) => s.model === preselectedModel);
            if (found) defaultScooter = found;
          }
          
          const colors = defaultScooter.colors ? JSON.parse(defaultScooter.colors) : [];
          setItems([{
            id: Math.random().toString(36).substring(7),
            type: 'SCOOTER',
            model: defaultScooter.model,
            color: preselectedColor && colors.includes(preselectedColor) ? preselectedColor : (colors[0] || 'Default'),
            quantity: 12, // Minimum 12 for scooters
            price: defaultScooter.dealerPrice,
            availableColors: colors
          }]);
        }
      } catch (err) {
        console.error('Failed to load data', err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [searchParams]);

  const handleAddItem = (type: 'SCOOTER' | 'PART' | 'ACCESSORY') => {
    if (type === 'SCOOTER' && inventory.length > 0) {
      const s = inventory[0];
      const colors = s.colors ? JSON.parse(s.colors) : [];
      setItems([...items, { id: Math.random().toString(36).substring(7), type, model: s.model, color: colors[0] || 'Default', quantity: 12, price: s.dealerPrice, availableColors: colors }]);
    } else if (type === 'PART' && spareParts.length > 0) {
      const p = spareParts[0];
      setItems([...items, { id: Math.random().toString(36).substring(7), type, model: p.name, color: 'N/A', quantity: 1, price: p.price, availableColors: [] }]);
    } else if (type === 'ACCESSORY') {
      const a = ACCESSORIES_LIST[0];
      setItems([...items, { id: Math.random().toString(36).substring(7), type, model: a.name, color: 'N/A', quantity: 1, price: a.price, availableColors: [] }]);
    }
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof CartItem, value: any) => {
    setItems(items.map(item => {
      if (item.id !== id) return item;
      
      const updatedItem = { ...item, [field]: value };
      
      if (field === 'model') {
        if (item.type === 'SCOOTER') {
          const scooter = inventory.find(s => s.model === value);
          if (scooter) {
            updatedItem.price = scooter.dealerPrice;
            const colors = scooter.colors ? JSON.parse(scooter.colors) : [];
            updatedItem.availableColors = colors;
            updatedItem.color = colors[0] || 'Default';
          }
        } else if (item.type === 'PART') {
          const part = spareParts.find(p => p.name === value);
          if (part) updatedItem.price = part.price;
        } else if (item.type === 'ACCESSORY') {
          const acc = ACCESSORIES_LIST.find(a => a.name === value);
          if (acc) updatedItem.price = acc.price;
        }
      }
      return updatedItem;
    }));
  };

  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + (item.price * (typeof item.quantity === 'number' ? item.quantity : 0)), 0);
  };

  const subtotal = calculateSubtotal();
  const gst = subtotal * 0.18;
  const totalAmount = subtotal + gst;
  
  const validateOrder = () => {
    let totalScooterQty = 0;
    for (const item of items) {
      const q = typeof item.quantity === 'number' ? item.quantity : 0;
      if (item.type === 'SCOOTER') {
        totalScooterQty += q;
      }
      if (item.type !== 'SCOOTER' && q < 1) {
        setError('Quantity must be at least 1.');
        return false;
      }
    }
    
    if (totalScooterQty > 0 && (totalScooterQty < 12 || totalScooterQty > 40)) {
      setError(`Total scooter order quantity must be between 12 and 40 units (Current: ${totalScooterQty}).`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateOrder()) return;
    
    if (paymentOption === 'Online Payment (Paytm, Cards, Net Banking)') {
      setShowPaymentGateway(true);
      return;
    }
    await placeOrder(paymentOption);
  };

  const placeOrder = async (finalPaymentOption: string) => {
    setError('');
    setLoading(true);
    try {
      await api.post('/orders/quick', {
        items: items.map(item => ({
          type: item.type,
          model: item.model,
          color: item.color,
          quantity: item.quantity
        })),
        deliveryAddress,
        paymentOption: finalPaymentOption,
        preferredDeliveryDate,
        notes
      });
      router.push('/dashboard/orders');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to place bulk order');
      setShowPaymentGateway(false);
    } finally {
      setLoading(false);
    }
  };

  const simulatePayment = () => {
    setPaymentStatus('processing');
    setTimeout(() => {
      setPaymentStatus('success');
      setTimeout(() => {
        placeOrder(`Online Payment (ID: TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()})`);
      }, 1500);
    }, 2500);
  };

  if (loadingData) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Place Bulk Order</h1>
        <p className="text-gray-500 dark:text-gray-400">Order Scooters, Spare Parts, and Accessories in a single order.</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#0f172a] shadow-sm rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50 flex-wrap gap-2">
              <h2 className="text-lg font-bold text-foreground flex items-center">
                <Package className="w-5 h-5 mr-2 text-primary" />
                Cart Items
              </h2>
              <div className="flex gap-2">
                <button onClick={() => handleAddItem('SCOOTER')} className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg flex items-center">
                  <Plus className="w-4 h-4 mr-1" /> Scooter
                </button>
                <button onClick={() => handleAddItem('PART')} className="text-xs font-medium text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg flex items-center">
                  <Wrench className="w-4 h-4 mr-1" /> Part
                </button>
                <button onClick={() => handleAddItem('ACCESSORY')} className="text-xs font-medium text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg flex items-center">
                  <Settings className="w-4 h-4 mr-1" /> Accessory
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {items.map((item) => (
                <div key={item.id} className="relative grid grid-cols-1 md:grid-cols-12 gap-4 items-end pb-6 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                  <div className="md:col-span-5">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">{item.type} Model/Name</label>
                    <select 
                      value={item.model} 
                      onChange={(e) => updateItem(item.id, 'model', e.target.value)}
                      className="block w-full p-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-primary focus:border-primary font-medium"
                    >
                      {item.type === 'SCOOTER' && inventory.map(i => <option key={i.id} value={i.model}>{i.model} - ${i.dealerPrice.toLocaleString()}</option>)}
                      {item.type === 'PART' && spareParts.map(p => <option key={p.id} value={p.name}>{p.name} - ${p.price.toLocaleString()}</option>)}
                      {item.type === 'ACCESSORY' && ACCESSORIES_LIST.map(a => <option key={a.name} value={a.name}>{a.name} - ${a.price.toLocaleString()}</option>)}
                    </select>
                  </div>
                  
                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Color</label>
                    {item.type === 'SCOOTER' ? (
                      <select 
                        value={item.color} 
                        onChange={(e) => updateItem(item.id, 'color', e.target.value)}
                        className="block w-full p-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-primary focus:border-primary"
                      >
                        {item.availableColors.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    ) : (
                      <input type="text" value="N/A" disabled className="block w-full p-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-200 dark:bg-gray-800 opacity-70 cursor-not-allowed" />
                    )}
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Qty {item.type === 'SCOOTER' ? '(12-40)' : ''}</label>
                    <input
                      type="number"
                      min={item.type === 'SCOOTER' ? "12" : "1"}
                      max={item.type === 'SCOOTER' ? "40" : "999"}
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
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-30"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#0f172a] shadow-sm rounded-xl border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-lg font-bold text-foreground flex items-center mb-6">
              <Truck className="w-5 h-5 mr-2 text-primary" />
              Logistics & Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Delivery Address</label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter complete dealership address"
                  className="block w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preferred Delivery Date</label>
                <input
                  type="date"
                  value={preferredDeliveryDate}
                  onChange={(e) => setPreferredDeliveryDate(e.target.value)}
                  className="block w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-primary"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Additional Remarks</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions for accessories or delivery..."
                  className="block w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-primary"
                  rows={2}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Option</label>
                <select 
                  value={paymentOption} 
                  onChange={(e) => setPaymentOption(e.target.value)}
                  className="block w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-primary"
                >
                  <option value="Online Payment (Paytm, Cards, Net Banking)">Online Payment (Paytm, Cards, Net Banking)</option>
                  <option value="Wire Transfer">Wire Transfer</option>
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
              {items.map((item) => {
                const qty = typeof item.quantity === 'number' ? item.quantity : 0;
                return (
                  <div key={item.id} className="flex justify-between items-start text-gray-600 dark:text-gray-400 text-xs">
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white mr-1">{qty}x</span> 
                      {item.model}
                      {item.type === 'SCOOTER' && <div className="text-[10px] text-gray-400 mt-0.5 ml-5">{item.color}</div>}
                      {item.type !== 'SCOOTER' && <div className="text-[10px] text-primary/70 mt-0.5 ml-5 uppercase">{item.type}</div>}
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
                <span>Total Items</span>
                <span className="font-bold text-gray-900 dark:text-white">{items.reduce((s,i) => s+(typeof i.quantity==='number'?i.quantity:0),0)}</span>
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
              disabled={loading}
              className="mt-6 w-full flex items-center justify-center py-3.5 px-4 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Processing...' : paymentOption === 'Online Payment (Paytm, Cards, Net Banking)' ? 'Proceed to Payment' : 'Confirm Bulk Order'}
              {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {showPaymentGateway && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl w-full max-w-md h-[600px] flex flex-col overflow-hidden">
            {paymentStatus === 'success' ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <h3 className="text-2xl font-bold text-green-500 mb-2">Payment Successful!</h3>
                <p>Your order is processing.</p>
              </div>
            ) : paymentStatus === 'processing' ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="animate-spin h-12 w-12 border-b-2 border-primary mb-4"></div>
                <h3 className="text-xl font-bold">Processing...</h3>
              </div>
            ) : (
              <>
                <div className="bg-primary p-6 text-white text-center relative shrink-0">
                  <button onClick={() => setShowPaymentGateway(false)} className="absolute top-4 right-4 text-white">X</button>
                  <div className="text-sm">Total Payable Amount</div>
                  <div className="text-4xl font-bold">${totalAmount.toLocaleString()}</div>
                </div>
                <div className="flex-1 p-6 space-y-4">
                  <button onClick={simulatePayment} className="w-full flex items-center p-4 border rounded-xl hover:border-primary">
                    <Smartphone className="w-5 h-5 text-blue-600 mr-4" /> 
                    <div className="text-left font-bold">Paytm / UPI</div>
                  </button>
                  <button onClick={simulatePayment} className="w-full flex items-center p-4 border rounded-xl hover:border-primary">
                    <CreditCard className="w-5 h-5 text-primary mr-4" /> 
                    <div className="text-left font-bold">Credit / Debit Card</div>
                  </button>
                  <button onClick={simulatePayment} className="w-full flex items-center p-4 border rounded-xl hover:border-primary">
                    <Building className="w-5 h-5 text-purple-600 mr-4" /> 
                    <div className="text-left font-bold">Net Banking</div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function NewOrderPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewOrderForm />
    </Suspense>
  );
}
