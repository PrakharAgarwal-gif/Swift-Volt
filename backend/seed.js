const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database for Enterprise DMS...');
  
  // Clear existing data (order matters due to foreign keys)
  await prisma.warranty.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.sparePartOrder.deleteMany();
  await prisma.sparePart.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.order.deleteMany();
  await prisma.scooter.deleteMany();
  await prisma.dealer.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Users & Dealers
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

  const dealerPassword = await bcrypt.hash('dealer123', 10);
  const dealer1User = await prisma.user.create({
    data: { name: 'John Doe', email: 'john@abcmotors.com', phone: '+1987654321', password: dealerPassword, role: 'DEALER' }
  });
  const dealer1 = await prisma.dealer.create({
    data: { userId: dealer1User.id, companyName: 'ABC Motors', address: '123 EV Street, Silicon Valley, CA', stock: 22, performanceScore: 94.5 }
  });

  const dealer2User = await prisma.user.create({
    data: { name: 'Jane Smith', email: 'jane@cityscooters.com', phone: '+1122334455', password: dealerPassword, role: 'DEALER' }
  });
  const dealer2 = await prisma.dealer.create({
    data: { userId: dealer2User.id, companyName: 'City Scooters', address: '456 Urban Ave, New York, NY', stock: 15, performanceScore: 88.0 }
  });

  // 2. Create Scooter Catalogue
  const standardSpecs = {
    batteryCapacity: "60V 30Ah Lithium-ion", motorPower: "1200W BLDC", maxSpeed: "55 km/h", range: "80-100 km",
    chargingTime: "4-5 Hours", controller: "60V Smart Vector", tyreSize: "90/90-12 Tubeless", brakeType: "Front Disc, Rear Drum",
    suspension: "Telescopic Front, Dual Shock Rear", weight: "85 kg", payload: "150 kg",
    colors: JSON.stringify(["Red", "Blue", "Black", "White"]), warrantyPeriod: "3 Years or 30,000 km",
    distributorPrice: 65000, manufacturingLeadTime: "7 Days"
  };

  const scooterData = [
    { model: 'Single Light', category: 'Standard', dealerPrice: 70000, retailPrice: 85000, quantity: 50, ...standardSpecs },
    { model: 'Double Light', category: 'Standard', dealerPrice: 72000, retailPrice: 88000, quantity: 45, ...standardSpecs },
    { model: 'Round Light Vespa', category: 'Standard', dealerPrice: 75000, retailPrice: 92000, quantity: 60, ...standardSpecs, description: "Classic retro style" },
    { model: 'Big Round Light Vespa', category: 'Standard', dealerPrice: 78000, retailPrice: 95000, quantity: 30, ...standardSpecs },
    { model: 'U Light', category: 'Standard', dealerPrice: 71000, retailPrice: 86000, quantity: 40, ...standardSpecs },
    { model: 'BMW Model', category: 'Standard', dealerPrice: 85000, retailPrice: 105000, quantity: 20, ...standardSpecs, motorPower: "2000W BLDC", maxSpeed: "75 km/h" },
    { model: 'OLA Model', category: 'Standard', dealerPrice: 82000, retailPrice: 99000, quantity: 150, ...standardSpecs, range: "120 km" },
    { model: 'Jali Vespa', category: 'Standard', dealerPrice: 76000, retailPrice: 93000, quantity: 25, ...standardSpecs },
    { model: 'Q7', category: 'Standard', dealerPrice: 79000, retailPrice: 97000, quantity: 35, ...standardSpecs },
    { model: 'C90', category: 'Standard', dealerPrice: 73000, retailPrice: 89000, quantity: 40, ...standardSpecs },
    { model: 'Chetak', category: 'Standard', dealerPrice: 77000, retailPrice: 94000, quantity: 65, ...standardSpecs },
    { model: 'Handicapped Pedal Model', category: 'Special', dealerPrice: 68000, retailPrice: 80000, quantity: 15, ...standardSpecs, payload: "120 kg", description: "Modified with side wheels and pedal assist." },
    { model: 'Two-Wheeler Loader', category: 'Commercial', dealerPrice: 80000, retailPrice: 95000, quantity: 20, ...standardSpecs, payload: "200 kg", suspension: "Heavy Duty" },
    { model: 'Three-Wheeler Loader', category: 'Commercial', dealerPrice: 110000, retailPrice: 135000, quantity: 10, ...standardSpecs, payload: "500 kg", batteryCapacity: "72V 50Ah", motorPower: "3000W" },
  ];

  await prisma.scooter.createMany({ data: scooterData });

  // 3. Create Orders (Manufacturing Pipeline)
  const order1 = await prisma.order.create({
    data: {
      dealerId: dealer1.id, scooterModel: 'OLA Model', quantity: 12, color: 'Blue',
      deliveryAddress: dealer1.address, paymentOption: 'Wire Transfer', status: 'Dispatched',
      expectedArrival: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      transportCompany: 'Safe Express', driverName: 'Raj Kumar', driverMobile: '+919876543210',
      vehicleNumber: 'MH-12-AB-1234', lrNumber: 'LR-998877', dispatchDate: new Date()
    }
  });

  const order2 = await prisma.order.create({
    data: {
      dealerId: dealer2.id, scooterModel: 'Three-Wheeler Loader', quantity: 5, color: 'Red',
      deliveryAddress: dealer2.address, paymentOption: 'Credit', status: 'Production Scheduled',
      expectedArrival: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
    }
  });

  // 4. Create Vehicles for Dispatched Order
  for(let i=1; i<=12; i++) {
    const v = await prisma.vehicle.create({
      data: {
        orderId: order1.id, scooterModel: 'OLA Model',
        chassisNumber: `CHAS-OLA-2026-${String(i).padStart(4, '0')}`,
        motorNumber: `MOT-1200-${Math.floor(Math.random()*10000)}`,
        batteryNumber: `BAT-6030-${Math.floor(Math.random()*10000)}`,
        controllerNumber: `CTRL-${Math.floor(Math.random()*10000)}`,
        batchNumber: 'BATCH-2026-A1',
        productionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        inspectionStatus: 'Passed',
        qrCodeData: `https://swiftvolt.com/v/CHAS-OLA-2026-${String(i).padStart(4, '0')}`
      }
    });

    // 5. Create Warranty for Vehicles
    await prisma.warranty.create({
      data: {
        vehicleId: v.id, dealerName: dealer1.companyName,
        purchaseDate: new Date(), warrantyStartDate: new Date(),
        warrantyExpiryDate: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000), // 3 years
      }
    });
  }

  // 6. Create Spare Parts
  await prisma.sparePart.createMany({
    data: [
      { name: '60V 30Ah Lithium Battery', category: 'Battery', price: 25000, stock: 40 },
      { name: '1200W BLDC Motor', category: 'Motor', price: 12000, stock: 25 },
      { name: 'Smart Vector Controller', category: 'Controller', price: 4500, stock: 50 },
      { name: 'Disc Brake Pad Set', category: 'Brake Pads', price: 800, stock: 120 },
      { name: 'Telescopic Front Fork', category: 'Front Suspension', price: 3500, stock: 15 },
    ]
  });

  console.log('Enterprise Database Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
