const BASE_URL = 'http://127.0.0.1:3001/api';

async function fetchApi(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API Error');
  return data;
}

async function runE2E() {
  console.log('--- STARTING E2E FLOW TEST ---');
  try {
    console.log('\n[1] Logging in as Admin...');
    const adminData = await fetchApi('/auth/login', { method: 'POST', body: { email: 'admin@swiftvolt.com', password: 'admin123' } });
    const adminToken = adminData.token;
    
    const inventoryRes = await fetchApi('/inventory/admin', { headers: { Authorization: `Bearer ${adminToken}` } });
    const initialScooter = inventoryRes.scooters.find(s => s.model === 'OLA Model');
    console.log(`✅ Admin Login Success. Initial Company Stock of OLA Model: ${initialScooter.quantity} (Reserved: ${initialScooter.reservedStock})`);

    console.log('\n[2] Logging in as Dealer...');
    const dealerData = await fetchApi('/auth/login', { method: 'POST', body: { email: 'john@abcmotors.com', password: 'dealer123' } });
    const dealerToken = dealerData.token;
    
    const dealerProfile = await fetchApi('/dealer/profile', { headers: { Authorization: `Bearer ${dealerToken}` } });
    console.log(`✅ Dealer Login Success. Company: ${dealerProfile.companyName}`);

    console.log('\n[3] Dealer placing order for 15x OLA Model...');
    const orderPayload = {
      scooterModel: 'OLA Model',
      color: 'Midnight Black',
      quantity: 15,
      totalAmount: 15 * initialScooter.dealerPrice,
      deliveryAddress: '123 Dealer Showroom, City Center',
      paymentOption: 'CREDIT',
      lineItems: [{ model: 'OLA Model', type: 'SCOOTER', quantity: 15, price: initialScooter.dealerPrice }]
    };
    
    const orderData = await fetchApi('/orders', { method: 'POST', body: orderPayload, headers: { Authorization: `Bearer ${dealerToken}` } });
    const orderId = orderData.id;
    console.log(`✅ Order Placed Successfully! Order ID: ${orderId}`);

    console.log('\n[4] Admin approving the order...');
    await fetchApi(`/orders/${orderId}/status`, { method: 'PUT', body: { status: 'Approved' }, headers: { Authorization: `Bearer ${adminToken}` } });
    
    const invAfterApproval = await fetchApi('/inventory/admin', { headers: { Authorization: `Bearer ${adminToken}` } });
    const scooterAfterApproval = invAfterApproval.scooters.find(s => s.model === 'OLA Model');
    console.log(`✅ Order Approved. Company Reserved Stock of OLA Model is now: ${scooterAfterApproval.reservedStock}`);

    console.log('\n[5] Admin dispatching the order (Simulating warehouse loading)...');
    const dispatchDetails = {
      transportCompany: 'Safe Express',
      driverName: 'Ramesh Singh',
      driverMobile: '9876543210',
      vehicleNumber: 'MH-12-AB-3456',
      lrNumber: 'LR-999888'
    };
    await fetchApi(`/orders/${orderId}/status`, { method: 'PUT', body: { status: 'Dispatched', dispatchDetails }, headers: { Authorization: `Bearer ${adminToken}` } });
    
    console.log('\n[6] Verifying Automatic Inventory Sync...');
    const finalInv = await fetchApi('/inventory/admin', { headers: { Authorization: `Bearer ${adminToken}` } });
    const finalScooter = finalInv.scooters.find(s => s.model === 'OLA Model');
    
    const finalDealerInv = await fetchApi('/inventory/dealer', { headers: { Authorization: `Bearer ${dealerToken}` } });
    const dealerStock = finalDealerInv.find(s => s.productName === 'OLA Model');

    console.log(`✅ Final Company Stock of OLA Model: ${finalScooter.quantity} (Decreased by 15: ${initialScooter.quantity - finalScooter.quantity === 15})`);
    console.log(`✅ Final Company Reserved Stock: ${finalScooter.reservedStock} (Decreased by 15)`);
    console.log(`✅ Final Dealer Stock of OLA Model: ${dealerStock.availableQty}`);
    
    console.log('\n🚀 E2E FLOW TEST PASSED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ E2E TEST FAILED:');
    console.error(error.message);
  }
}

runE2E();
