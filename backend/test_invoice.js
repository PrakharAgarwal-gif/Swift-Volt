const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const dealer = await prisma.dealer.findFirst();
  if (!dealer) {
    console.log("No dealer found.");
    return;
  }
  
  try {
    const invoice = await prisma.customerInvoice.create({
      data: {
        dealerId: dealer.id,
        invoiceNumber: `INV-TEST-${Date.now()}`,
        customerName: 'Test',
        customerPhone: '1234',
        items: JSON.stringify([{ description: 'Test', quantity: 1, unitPrice: 10 }]),
        subtotal: 10,
        taxAmount: 1,
        totalAmount: 11
      }
    });
    console.log("Success!", invoice);
  } catch (e) {
    console.error("Prisma error:", e);
  }
}
main().finally(() => prisma.$disconnect());
