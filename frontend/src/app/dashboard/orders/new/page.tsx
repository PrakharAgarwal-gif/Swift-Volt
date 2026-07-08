import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Package, Truck, ArrowRight, DollarSign, Plus, Trash2, CreditCard, Smartphone, Building } from 'lucide-react';

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
  
  const [paymentOption, setPaymentOption] = useState('Online Payment (Paytm, Cards, Net Banking)');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Payment Gateway State
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');

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
      // Use the bulk quick order endpoint
      await api.post('/orders/quick', {
        items: items.map(item => ({
          model: item.model,
          color: item.color,
          quantity: item.quantity
        })),
        deliveryAddress,
        paymentOption: finalPaymentOption
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
        const txnId = 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase();
        placeOrder(`Online Payment (ID: ${txnId})`);
      }, 1500);
    }, 2500);
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
                  className="block w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-primary focus:border-primary font-medium"
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
              {loading ? 'Processing...' : paymentOption === 'Online Payment (Paytm, Cards, Net Banking)' ? 'Proceed to Payment' : 'Confirm Bulk Order'}
              {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
            </button>
            <p className="text-xs text-center text-gray-500 mt-4">By placing this bulk order, you agree to Swift Volt's Dealership Agreement.</p>
          </div>
        </div>
      </div>

      {/* Payment Gateway Modal */}
      {showPaymentGateway && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-800 relative flex flex-col h-[600px] max-h-[90vh]">
            
            {paymentStatus === 'success' ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8">Your order is being processed securely.</p>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 animate-[pulse_1s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
                </div>
              </div>
            ) : paymentStatus === 'processing' ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mb-6"></div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Processing Payment...</h3>
                <p className="text-gray-500 dark:text-gray-400">Please do not close this window or hit back.</p>
              </div>
            ) : (
              <>
                <div className="bg-primary p-6 text-white text-center relative shrink-0">
                  <button 
                    onClick={() => setShowPaymentGateway(false)} 
                    className="absolute top-4 right-4 text-white/70 hover:text-white"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="text-white/80 text-sm font-medium mb-1">Total Payable Amount</div>
                  <div className="text-4xl font-bold">${totalAmount.toLocaleString()}</div>
                  <div className="text-xs text-white/70 mt-2 bg-white/10 inline-block px-3 py-1 rounded-full">
                    Transaction ID: TXN-{Math.random().toString(36).substring(2, 10).toUpperCase()}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
                  <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Select Payment Method</h4>
                  
                  <div className="space-y-3">
                    <button onClick={simulatePayment} className="w-full flex items-center p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary dark:hover:border-primary hover:shadow-md transition-all group">
                      <div className="w-10 h-10 rounded-full bg-[#002970]/10 flex items-center justify-center mr-4 shrink-0 group-hover:bg-[#002970]/20">
                        <Smartphone className="w-5 h-5 text-[#002970] dark:text-[#00baf2]" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-gray-900 dark:text-white text-base">Paytm / UPI</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Pay directly from your bank account</div>
                      </div>
                    </button>

                    <button onClick={simulatePayment} className="w-full flex items-center p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary dark:hover:border-primary hover:shadow-md transition-all group">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 shrink-0 group-hover:bg-primary/20">
                        <CreditCard className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-gray-900 dark:text-white text-base">Credit / Debit Card</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Visa, MasterCard, Amex, RuPay</div>
                      </div>
                    </button>

                    <button onClick={simulatePayment} className="w-full flex items-center p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary dark:hover:border-primary hover:shadow-md transition-all group">
                      <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mr-4 shrink-0 group-hover:bg-purple-500/20">
                        <Building className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-gray-900 dark:text-white text-base">Net Banking</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">All major banks supported</div>
                      </div>
                    </button>
                  </div>
                </div>
                
                <div className="p-4 bg-white dark:bg-[#0f172a] border-t border-gray-100 dark:border-gray-800 shrink-0 text-center flex items-center justify-center text-xs text-gray-400">
                  <svg className="w-4 h-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  256-bit SSL Secured Payment
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
    <Suspense fallback={<div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
      <NewOrderForm />
    </Suspense>
  );
}
