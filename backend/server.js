const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-swift-volt';

app.use(cors());
app.use(express.json());

// --- Socket.io for Real-time ---
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// --- Middleware ---
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin access required' });
  next();
};

// --- Routes ---

// Auth: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email }, include: { dealer: true } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user.id, role: user.role, dealerId: user.dealer?.id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role, dealerId: user.dealer?.id } });
  } catch (error) {
    console.error('[Login Error]:', error);
    
    // Check if it's a Prisma connection or initialization error
    if (error.message && error.message.includes('DATABASE_URL')) {
      return res.status(503).json({ error: 'Database service is currently unavailable. Please check the backend configuration.' });
    }
    
    res.status(500).json({ error: 'An internal server error occurred during authentication.' });
  }
});

// Admin: Get all stats
app.get('/api/admin/stats', authenticate, isAdmin, async (req, res) => {
  try {
    const totalDealers = await prisma.dealer.count();
    const inventory = await prisma.scooter.aggregate({ _sum: { quantity: true } });
    const totalOrders = await prisma.order.count();
    const totalSales = await prisma.sale.aggregate({ _sum: { scootersSold: true, revenue: true } });
    
    res.json({
      totalDealers,
      companyInventory: inventory._sum.quantity || 0,
      totalOrders,
      totalScootersSold: totalSales._sum.scootersSold || 0,
      totalRevenue: totalSales._sum.revenue || 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get dealers
app.get('/api/dealers', authenticate, isAdmin, async (req, res) => {
  try {
    const dealers = await prisma.dealer.findMany({
      include: { user: { select: { name: true, email: true, phone: true } } }
    });
    res.json(dealers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dealer: Get profile & stats
app.get('/api/dealer/profile', authenticate, async (req, res) => {
  try {
    const dealerId = req.user.dealerId;
    if (!dealerId) return res.status(403).json({ error: 'Not a dealer' });
    
    const dealer = await prisma.dealer.findUnique({
      where: { id: dealerId },
      include: { user: { select: { name: true, email: true, phone: true } } }
    });
    
    const sales = await prisma.sale.aggregate({
      where: { dealerId },
      _sum: { scootersSold: true, revenue: true }
    });
    
    res.json({ ...dealer, totalSales: sales._sum.scootersSold || 0, totalRevenue: sales._sum.revenue || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Shared: Get Scooters (Inventory)
app.get('/api/scooters', authenticate, async (req, res) => {
  try {
    const scooters = await prisma.scooter.findMany();
    res.json(scooters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dealer: Place Order
app.post('/api/orders', authenticate, async (req, res) => {
  try {
    const dealerId = req.user.dealerId;
    if (!dealerId) return res.status(403).json({ error: 'Not a dealer' });
    
    const { scooterModel, quantity, color, deliveryAddress, paymentOption } = req.body;
    
    if (quantity < 12 || quantity > 40) {
      return res.status(400).json({ error: 'Order quantity must be between 12 and 40.' });
    }
    
    const scooter = await prisma.scooter.findFirst({ where: { model: scooterModel, color } });
    if (!scooter) return res.status(404).json({ error: 'Scooter model/color not found' });
    
    if (scooter.quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient company stock' });
    }
    
    const order = await prisma.order.create({
      data: {
        dealerId,
        scooterModel,
        quantity,
        color,
        deliveryAddress,
        paymentOption,
        expectedArrival: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      }
    });
    
    // Deduct stock immediately (basic logic)
    await prisma.scooter.update({
      where: { id: scooter.id },
      data: { quantity: scooter.quantity - quantity }
    });
    
    // Notify admin
    io.emit('new_order', order);
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Shared: Get Orders
app.get('/api/orders', authenticate, async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'ADMIN') {
      orders = await prisma.order.findMany({ include: { dealer: { include: { user: true } } }, orderBy: { createdAt: 'desc' } });
    } else {
      orders = await prisma.order.findMany({ where: { dealerId: req.user.dealerId }, orderBy: { createdAt: 'desc' } });
    }
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Assistant Mock (until OpenAI key is provided)
app.post('/api/ai/chat', authenticate, async (req, res) => {
  try {
    const { message } = req.body;
    
    let reply = "I am the Swift Volt AI Assistant. How can I help you today?";
    
    const msgLower = message.toLowerCase();
    if (msgLower.includes("stock") || msgLower.includes("available")) {
      if (req.user.role === 'DEALER') {
        const dealer = await prisma.dealer.findUnique({ where: { id: req.user.dealerId } });
        reply = `You currently have ${dealer.stock} scooters in stock. Minimum reorder is 12.`;
      } else {
        const inventory = await prisma.scooter.aggregate({ _sum: { quantity: true } });
        reply = `The company currently has ${inventory._sum.quantity} scooters available in total.`;
      }
    } else if (msgLower.includes("sell") || msgLower.includes("sold")) {
      reply = "Your sales have been strong this month. You've sold 85 scooters!";
    } else if (msgLower.includes("reorder") || msgLower.includes("when should i")) {
      reply = "Based on your sales velocity (avg 2-3 per day), you should reorder within the next 4 days to avoid stockouts.";
    } else if (msgLower.includes("features") || msgLower.includes("x-pro")) {
      reply = "The Swift Volt X-Pro features a 120km range, regenerative braking, and a top speed of 85 km/h. It's our best seller!";
    }
    
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
