const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

async function test() {
  const token = jwt.sign({ id: 'dummy', role: 'ADMIN' }, 'super-secret-key-swift-volt');
  try {
    const res = await fetch('http://127.0.0.1:3001/api/inventory/admin', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    console.log("Success: ", Object.keys(data));
  } catch (err) {
    console.error("Failed:", err.message);
  }
}

test();

test();
