const mongoose = require('mongoose');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Farm = require('../models/Farm');
const CropCycle = require('../models/CropCycle');
const UM = require('../models/UM');
require('dotenv').config({ path: '../../.env' }); // Ensure path to .env is correct

async function seedData() {
  try {
    console.log('Connecting to MongoDB...');
    // Replace with your real connection string from .env
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/sugi-dashboard-demo';
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    
    console.log('Clearing existing management records...');
    await Organization.deleteMany({});
    await User.deleteMany({});
    await Farm.deleteMany({});
    await UM.deleteMany({});
    await CropCycle.deleteMany({});

    console.log('Creating Organization...');
    const ptSawit = await Organization.create({
      name: 'PT Sawit Sejahtera',
      type: 'Company',
      region: 'Sumatra Utara'
    });

    console.log('Creating Users...');
    const adminUser = await User.create({
      name: 'Admin Perusahaan', email: 'admin@sawit.com', password: 'password123',
      role: 'Company_Admin', organization_id: ptSawit._id
    });
    const umUser = await User.create({
      name: 'Budi UM', email: 'budi.um@sawit.com', password: 'password123',
      role: 'UM', organization_id: ptSawit._id
    });

    console.log('Creating Farm...');
    const farm = await Farm.create({
      name: 'Blok A - Lonsum',
      organization_id: ptSawit._id,
      area_hectares: 50,
      location: { type: 'Point', coordinates: [98.67, 3.59] }
    });

    console.log('Creating Crop Cycle...');
    const cycle = await CropCycle.create({
      farm_id: farm._id,
      organization_id: ptSawit._id,
      crop_type: 'Oil_Palm',
      status: 'Harvesting',
      harvest_opening_date: new Date(),
      harvest_closing_date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
    });

    console.log('Creating UM Profile...');
    await UM.create({
      user_id: umUser._id,
      um_id: 'UM-001',
      organization_id: ptSawit._id,
      assigned_processes: ['Harvesting'],
      assigned_farms: [farm._id],
      start_date: new Date(),
      performance_metrics: { overall_score: 85 }
    });

    console.log('Seeding Complete!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
