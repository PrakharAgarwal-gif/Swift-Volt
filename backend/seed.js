const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Clear existing data
  await prisma.invoice.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.order.deleteMany();
  await prisma.scooter.deleteMany();
  await prisma.dealer.deleteMany();
  await prisma.user.deleteMany();

  // Create Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Swift Volt Admin',
      email: 'admin@swiftvolt.com',
      phone: '+1234567890',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create Dealers
  const dealerPassword = await bcrypt.hash('dealer123', 10);
  const dealer1User = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@abcmotors.com',
      phone: '+1987654321',
      password: dealerPassword,
      role: 'DEALER',
    },
  });

  const dealer1 = await prisma.dealer.create({
    data: {
      userId: dealer1User.id,
      companyName: 'ABC Motors',
      address: '123 EV Street, Silicon Valley, CA',
      stock: 22,
      performanceScore: 94.5,
    },
  });

  const dealer2User = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@cityscooters.com',
      phone: '+1122334455',
      password: dealerPassword,
      role: 'DEALER',
    },
  });

  const dealer2 = await prisma.dealer.create({
    data: {
      userId: dealer2User.id,
      companyName: 'City Scooters',
      address: '456 Urban Ave, New York, NY',
      stock: 15,
      performanceScore: 88.0,
    },
  });

  // Create Scooters (Company Inventory)
  await prisma.scooter.createMany({
    data: [
      { model: 'Swift Volt X-Pro', price: 1200, quantity: 500, color: 'Electric Blue' },
      { model: 'Swift Volt X-Pro', price: 1200, quantity: 300, color: 'Midnight Black' },
      { model: 'Swift Volt Lite', price: 800, quantity: 1000, color: 'Pearl White' },
      { model: 'Swift Volt Max', price: 1500, quantity: 200, color: 'Crimson Red' },
    ],
  });

  // Create Orders
  const order1 = await prisma.order.create({
    data: {
      dealerId: dealer1.id,
      scooterModel: 'Swift Volt X-Pro',
      quantity: 40,
      color: 'Electric Blue',
      deliveryAddress: dealer1.address,
      paymentOption: 'Wire Transfer',
      status: 'DELIVERED',
      trackingId: 'TRK-987654321',
      expectedArrival: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
  });

  const order2 = await prisma.order.create({
    data: {
      dealerId: dealer2.id,
      scooterModel: 'Swift Volt Lite',
      quantity: 20,
      color: 'Pearl White',
      deliveryAddress: dealer2.address,
      paymentOption: 'Credit Card',
      status: 'DISPATCHED',
      trackingId: 'TRK-123456789',
      expectedArrival: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // In 2 days
    },
  });

  // Create Sales (for Analytics)
  await prisma.sale.create({
    data: {
      dealerId: dealer1.id,
      scootersSold: 85,
      revenue: 85 * 1200,
      date: new Date(),
    }
  });

  await prisma.sale.create({
    data: {
      dealerId: dealer2.id,
      scootersSold: 42,
      revenue: 42 * 800,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    }
  });

  // Create Invoices
  await prisma.invoice.create({
    data: {
      orderId: order1.id,
      amount: 40 * 1200,
      status: 'PAID',
    }
  });

  await prisma.invoice.create({
    data: {
      orderId: order2.id,
      amount: 20 * 800,
      status: 'PENDING',
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
