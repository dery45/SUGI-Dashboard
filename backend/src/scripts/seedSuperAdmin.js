require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sugi-dashboard-demo');
  console.log('MongoDB connected');

  const existing = await User.findOne({ email: 'superadmin@sugi.id' });
  if (existing) {
    console.log('Super Admin already exists. Resetting password...');
    existing.password = 'superadmin123';
    await existing.save();
    console.log('Super Admin password reset to: superadmin123');
  } else {
    await User.create({
      name: 'Super Admin',
      email: 'superadmin@sugi.id',
      password: 'superadmin123',
      role: 'superadmin',
      phone: '081234567890',
      address: 'Jakarta, Indonesia'
    });
    console.log('Super Admin created: superadmin@sugi.id / superadmin123');
  }

  const gov = await User.findOne({ email: 'government@sugi.id' });
  if (!gov) {
    await User.create({
      name: 'Government User',
      email: 'government@sugi.id',
      password: 'government123',
      role: 'government',
      phone: '081234567891',
      address: 'Jakarta, Indonesia'
    });
    console.log('Government user created: government@sugi.id / government123');
  }

  const owner = await User.findOne({ email: 'owner@sugi.id' });
  if (!owner) {
    await User.create({
      name: 'Farmer Owner',
      email: 'owner@sugi.id',
      password: 'owner123',
      role: 'farmer_owner',
      phone: '081234567892',
      address: 'Sumatera Utara, Indonesia'
    });
    console.log('Farmer Owner created: owner@sugi.id / owner123');
  }

  console.log('Seed completed successfully');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(e => { console.error('Seed error:', e); process.exit(1); });
