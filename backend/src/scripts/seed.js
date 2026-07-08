require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const CropType = require('../models/CropType');
const ActivityType = require('../models/ActivityType');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sugi-dashboard-demo');
  console.log('MongoDB connected');

  // ── Users ────────────────────────────────────────────────────────────────────
  const users = [
    { name: 'Super Admin', email: 'superadmin@sugi.id', password: 'superadmin123', role: 'superadmin', phone: '081234567890', address: 'Jakarta, Indonesia' },
    { name: 'Government User', email: 'government@sugi.id', password: 'government123', role: 'government', phone: '081234567891', address: 'Jakarta, Indonesia' },
    { name: 'Farmer Owner', email: 'owner@sugi.id', password: 'owner123', role: 'farmer_owner', phone: '081234567892', address: 'Sumatera Utara, Indonesia' },
  ];

  for (const u of users) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      existing.password = u.password;
      await existing.save();
      console.log(`User ${u.email} — password reset`);
    } else {
      await User.create(u);
      console.log(`User ${u.email} — created`);
    }
  }

  // ── Crop Types ───────────────────────────────────────────────────────────────
  const cropTypes = [
    { code: 'PADI', name: 'Padi', category: 'Padi', scientific_name: 'Oryza sativa', duration_days: 120, yield_per_ha: 5000, unit: 'Kg' },
    { code: 'JAGUNG', name: 'Jagung', category: 'Palawija', scientific_name: 'Zea mays', duration_days: 100, yield_per_ha: 7000, unit: 'Kg' },
    { code: 'KOPI', name: 'Kopi', category: 'Perkebunan', scientific_name: 'Coffea arabica', duration_days: 365, yield_per_ha: 1200, unit: 'Kg' },
    { code: 'KELAPASAWIT', name: 'Kelapa Sawit', category: 'Perkebunan', scientific_name: 'Elaeis guineensis', duration_days: 1095, yield_per_ha: 18000, unit: 'Kg' },
    { code: 'CABAI', name: 'Cabai', category: 'Hortikultura', scientific_name: 'Capsicum annuum', duration_days: 90, yield_per_ha: 8000, unit: 'Kg' },
    { code: 'KEDELAI', name: 'Kedelai', category: 'Palawija', scientific_name: 'Glycine max', duration_days: 85, yield_per_ha: 2500, unit: 'Kg' },
    { code: 'TEBU', name: 'Tebu', category: 'Perkebunan', scientific_name: 'Saccharum officinarum', duration_days: 365, yield_per_ha: 70000, unit: 'Kg' },
    { code: 'UBIKAYU', name: 'Ubi Kayu', category: 'Palawija', scientific_name: 'Manihot esculenta', duration_days: 270, yield_per_ha: 25000, unit: 'Kg' },
  ];

  for (const ct of cropTypes) {
    const existing = await CropType.findOne({ code: ct.code });
    if (!existing) {
      await CropType.create(ct);
      console.log(`CropType ${ct.code} — created`);
    }
  }

  // ── Activity Types ────────────────────────────────────────────────────────────
  const activityTypes = [
    { code: 'LAND_CLEAR', name: 'Pembersihan Lahan', category: 'Pengolahan Lahan', unit: 'HOK', estimated_duration_hours: 16, color: '#f59e0b', icon: '🌿' },
    { code: 'SOIL_PREP', name: 'Pengolahan Tanah', category: 'Pengolahan Lahan', unit: 'HOK', estimated_duration_hours: 24, color: '#b45309', icon: '🚜' },
    { code: 'PLANTING', name: 'Penanaman', category: 'Penanaman', unit: 'HOK', estimated_duration_hours: 8, color: '#10b981', icon: '🌱' },
    { code: 'FERTILIZE', name: 'Pemupukan Dasar', category: 'Pemupukan', unit: 'HOK', estimated_duration_hours: 6, color: '#3b82f6', icon: '🧪' },
    { code: 'WEEDING', name: 'Penyiangan', category: 'Pemeliharaan', unit: 'HOK', estimated_duration_hours: 8, color: '#8b5cf6', icon: '🌾' },
    { code: 'SPRAY', name: 'Penyemprotan Hama', category: 'Pengendalian Hama', unit: 'HOK', estimated_duration_hours: 4, color: '#ef4444', icon: '🧴' },
    { code: 'IRRIGATE', name: 'Pengairan', category: 'Pengairan', unit: 'HOK', estimated_duration_hours: 2, color: '#06b6d4', icon: '💧' },
    { code: 'FERTILIZE_TOP', name: 'Pemupukan Susulan', category: 'Pemupukan', unit: 'HOK', estimated_duration_hours: 6, color: '#6366f1', icon: '🧪' },
    { code: 'PRUNE', name: 'Pemangkasan', category: 'Pemeliharaan', unit: 'HOK', estimated_duration_hours: 8, color: '#ec4899', icon: '✂️' },
    { code: 'HARVEST', name: 'Panen', category: 'Panen', unit: 'HOK', estimated_duration_hours: 24, color: '#f97316', icon: '🌾' },
    { code: 'POST_HARVEST', name: 'Pasca Panen', category: 'Pasca Panen', unit: 'HOK', estimated_duration_hours: 12, color: '#14b8a6', icon: '🏪' },
    { code: 'INSPECT', name: 'Inspeksi', category: 'Lainnya', unit: 'HOK', estimated_duration_hours: 2, color: '#6b7280', icon: '🔍' },
  ];

  for (const at of activityTypes) {
    const existing = await ActivityType.findOne({ code: at.code });
    if (!existing) {
      await ActivityType.create(at);
      console.log(`ActivityType ${at.code} — created`);
    }
  }

  console.log('Seed completed successfully');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(e => { console.error('Seed error:', e); process.exit(1); });
