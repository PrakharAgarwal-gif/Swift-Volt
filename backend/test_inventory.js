const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  console.log("Starting test...");
  
  // Clean up
  await prisma.inventoryMovement.deleteMany({});
  await prisma.dealerInventory.deleteMany({});
  
  // Set initial stock
  let scooter = await prisma.scooter.findFirst();
  if (!scooter) {
    scooter = await prisma.scooter.create({
      data: {
        model: 'Test Scooter',
        quantity: 50,
        reservedStock: 0,
        dispatchedQuantity: 0
      }
    });
  } else {
    await prisma.scooter.update({
      where: { id: scooter.id },
      data: { quantity: 50, reservedStock: 0, dispatchedQuantity: 0 }
    });
  }
  
  console.log("Initial Stock:", scooter.quantity, "Reserved:", scooter.reservedStock);
  
  // Create an order
  let dealer = await prisma.dealer.findFirst();
  if (!dealer) {
     const user = await prisma.user.create({ data: { name: 'D1', email: 'd1@test.com', phone: '1', password: '1', role: 'DEALER' }});
     dealer = await prisma.dealer.create({ data: { userId: user.id, companyName: 'D1', address: 'D1' } });
  }

  const order = await prisma.order.create({
    data: {
      dealerId: dealer.id,
      scooterModel: scooter.model,
      quantity: 10,
      color: 'Red',
      lineItems: JSON.stringify([{ type: 'SCOOTER', model: scooter.model, quantity: 10, color: 'Red' }]),
      deliveryAddress: 'Test',
      paymentOption: 'Cash',
      status: 'Pending Approval'
    }
  });
  
  console.log("Order created:", order.id, "Status:", order.status);
  
  // Simulate API hitting approve
  const tokenUser = require('jsonwebtoken').sign({ id: dealer.userId, role: 'ADMIN' }, 'super-secret-key-swift-volt');
  
  const headers = { 
    'Authorization': `Bearer ${tokenUser}`,
    'Content-Type': 'application/json'
  };
  
  console.log("Approving order...");
  await fetch(`http://127.0.0.1:3001/api/orders/${order.id}/status`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status: 'Approved' })
  });
  
  let check = await prisma.scooter.findFirst({ where: { id: scooter.id }});
  console.log("After Approval -> Stock:", check.quantity, "Reserved:", check.reservedStock);
  
  console.log("Dispatching order...");
  await fetch(`http://127.0.0.1:3001/api/orders/${order.id}/status`, { 
    method: 'PUT',
    headers,
    body: JSON.stringify({
      status: 'Dispatched',
      dispatchDetails: { transportCompany: 'T1' }
    })
  });
  
  check = await prisma.scooter.findFirst({ where: { id: scooter.id }});
  console.log("After Dispatch -> Stock:", check.quantity, "Reserved:", check.reservedStock, "Dispatched:", check.dispatchedQuantity);
  
  const mov = await prisma.inventoryMovement.findMany();
  console.log("Movements created:", mov.length);
  
  const inv = await prisma.dealerInventory.findFirst({ where: { dealerId: dealer.id }});
  console.log("Dealer Inventory:", inv?.availableQty);
  
  console.log("Test Done!");
}

test().catch(console.error).finally(() => prisma.$disconnect());
