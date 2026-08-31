require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../model/User');
const CropType = require('../model/CropType');
const ActivityType = require('../model/ActivityType');
const FarmMaster = require('../model/FarmMaster');
const Block = require('../model/Block');
const Unit = require('../model/Unit');
const CropVariety = require('../model/CropVariety');
const Fertilizer = require('../model/Fertilizer');
const Nutrient = require('../model/Nutrient');
const Medicine = require('../model/Medicine');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sugi-dashboard-demo');
  console.log('MongoDB connected');

  // ── Users ────────────────────────────────────────────────────────────────────
  const users = [
    {
      name: 'Super Admin',
      email: 'superadmin@sugi.id',
      password: 'superadmin123',
      role: 'superadmin',
      phone: '081234567890',
      address: 'Jakarta, Indonesia',
    },
    {
      name: 'Government User',
      email: 'government@sugi.id',
      password: 'government123',
      role: 'government',
      phone: '081234567891',
      address: 'Jakarta, Indonesia',
    },
    {
      name: 'Farmer Owner',
      email: 'owner@sugi.id',
      password: 'owner1234',
      role: 'farmer_owner',
      phone: '081234567892',
      address: 'Sumatera Utara, Indonesia',
    },
    {
      name: 'Lifecycle Farmer',
      email: 'lifecycle_farmer_130702@sugi.test',
      password: 'Farmer123',
      role: 'farmer',
      phone: '081234567893',
      address: 'Sumatera Utara, Indonesia',
    },
    {
      name: 'QA Redirect Farmer',
      email: 'qa_redirect_farmer_1787227895469@sugi.test',
      password: 'QaRedirect123',
      role: 'farmer',
      phone: '081234567894',
      address: 'Sumatera Utara, Indonesia',
    },
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

  // Create a farm for the farmer owner
  let farm = await FarmMaster.findOne({ name: 'Kebun Test' });
  if (!farm) {
    farm = await FarmMaster.create({
      name: 'Kebun Test',
      province: 'Sumatera Utara',
      city: 'Deli Serdang',
      district: 'Sibolangit',
      village: 'Sibolangit',
      land_owner: 'Budi Santoso',
      responsible_person: 'Budi Santoso',
      contact: '081234567892',
      total_area_ha: 100,
      status: 'Active',
      description: 'Kebun uji coba',
    });
    console.log('Farm Kebun Test — created');
  }

  // Assign farm to farmer owner
  const owner = await User.findOne({ email: 'owner@sugi.id' });
  if (owner && !owner.assigned_farms?.includes(farm._id)) {
    owner.assigned_farms = [farm._id];
    await owner.save();
    console.log('Assigned farm to owner@sugi.id');
  }

  // Create a block for the farm
  let block = await Block.findOne({ name: 'Blok A', farm: farm._id });
  if (!block) {
    block = await Block.create({
      name: 'Blok A',
      farm: farm._id,
      area_ha: 50,
      soil_type: 'Alluvial',
      water_source: 'Irigasi',
      status: 'Active',
      notes: 'Blok uji coba',
    });
    console.log('Block Blok A — created');
  }

  // Assign block to lifecycle farmer
  const lifecycleFarmer = await User.findOne({ email: 'lifecycle_farmer_130702@sugi.test' });
  if (lifecycleFarmer) {
    const FarmerAssignment = require('../model/FarmerAssignment');
    const existingAssignment = await FarmerAssignment.findOne({ farmer: lifecycleFarmer._id, block: block._id });
    if (!existingAssignment) {
      await FarmerAssignment.create({
        farmer: lifecycleFarmer._id,
        farm: farm._id,
        block: block._id,
        access_stages: ['Land_Preparation'],
        sales_access: true,
        assigned_by: owner._id,
        status: 'Active',
      });
      console.log('Assigned block to lifecycle_farmer');
    }
  }

  // Assign block to QA redirect farmer
  const qaFarmer = await User.findOne({ email: 'qa_redirect_farmer_1787227895469@sugi.test' });
  if (qaFarmer) {
    const FarmerAssignment = require('../model/FarmerAssignment');
    const existingAssignment = await FarmerAssignment.findOne({ farmer: qaFarmer._id, block: block._id });
    if (!existingAssignment) {
      await FarmerAssignment.create({
        farmer: qaFarmer._id,
        farm: farm._id,
        block: block._id,
        access_stages: ['Land_Preparation'],
        sales_access: true,
        assigned_by: owner._id,
        status: 'Active',
      });
      console.log('Assigned block to qa_redirect_farmer');
    }
    // Also assign farm to user.assigned_farms for login
    if (!qaFarmer.assigned_farms?.includes(farm._id)) {
      qaFarmer.assigned_farms = [farm._id];
      await qaFarmer.save();
      console.log('Assigned farm to qa_redirect_farmer');
    }
  }

  // Assign farm to lifecycle farmer for login
  const lifecycleFarmerUser = await User.findOne({ email: 'lifecycle_farmer_130702@sugi.test' });
  if (lifecycleFarmerUser && !lifecycleFarmerUser.assigned_farms?.includes(farm._id)) {
    lifecycleFarmerUser.assigned_farms = [farm._id];
    await lifecycleFarmerUser.save();
    console.log('Assigned farm to lifecycle_farmer');
  }

  // ── Units ────────────────────────────────────────────────────────────────────
  const units = [
    { name: 'Kilogram', symbol: 'kg', status: 'Active' },
    { name: 'Ton', symbol: 'ton', status: 'Active' },
    { name: 'Kwintal', symbol: 'kw', status: 'Active' },
    { name: 'Karung', symbol: 'karung', status: 'Active' },
    { name: 'Liter', symbol: 'L', status: 'Active' },
    { name: 'Sak', symbol: 'sak', status: 'Active' },
  ];
  for (const u of units) {
    const ex = await Unit.findOne({ name: u.name });
    if (!ex) { await Unit.create(u); console.log(`Unit ${u.name} — created`); }
  }
  const kgUnit = await Unit.findOne({ symbol: 'kg' });
  const literUnit = await Unit.findOne({ symbol: 'L' });

  // ── Crop Types (simplified: name+category+status) ───────────────────────────
  const cropTypes = [
    { name: 'Padi', category: 'Padi' },
    { name: 'Jagung', category: 'Palawija' },
    { name: 'Kopi', category: 'Perkebunan' },
    { name: 'Kelapa Sawit', category: 'Perkebunan' },
    { name: 'Cabai', category: 'Hortikultura' },
    { name: 'Kedelai', category: 'Palawija' },
    { name: 'Tebu', category: 'Perkebunan' },
    { name: 'Ubi Kayu', category: 'Palawija' },
  ];

  for (const ct of cropTypes) {
    const existing = await CropType.findOne({ name: ct.name });
    if (!existing) {
      await CropType.create(ct);
      console.log(`CropType ${ct.name} — created`);
    }
  }

  // ── Crop Varieties with Grades ──────────────────────────────────────────────
  const padiType = await CropType.findOne({ name: 'Padi' });
  const jagungType = await CropType.findOne({ name: 'Jagung' });
  const kopiType = await CropType.findOne({ name: 'Kopi' });
  const varieties = [
    { name: 'IR-64', crop_type: padiType?._id, unit: kgUnit?._id, description: 'Padi unggul IR-64', grades: [{ grade_name: 'Premium', estimated_price_per_unit: 12000 }, { grade_name: 'Medium', estimated_price_per_unit: 10000 }] },
    { name: 'Ciherang', crop_type: padiType?._id, unit: kgUnit?._id, description: 'Padi Ciherang', grades: [{ grade_name: 'A', estimated_price_per_unit: 13000 }, { grade_name: 'B', estimated_price_per_unit: 11000 }] },
    { name: 'Pioneer-32', crop_type: jagungType?._id, unit: kgUnit?._id, description: 'Jagung Pioneer', grades: [{ grade_name: 'Grade A', estimated_price_per_unit: 8000 }] },
    { name: 'Bisi-18', crop_type: jagungType?._id, unit: kgUnit?._id, description: 'Jagung Bisi', grades: [{ grade_name: 'A', estimated_price_per_unit: 7500 }, { grade_name: 'B', estimated_price_per_unit: 6500 }, { grade_name: 'C', estimated_price_per_unit: 5500 }] },
    { name: 'Arabika Gayo', crop_type: kopiType?._id, unit: kgUnit?._id, description: 'Kopi Gayo', grades: [{ grade_name: 'Specialty', estimated_price_per_unit: 85000 }] },
  ];
  for (const v of varieties) {
    if (!v.crop_type || !v.unit) continue;
    const ex = await CropVariety.findOne({ name: v.name, crop_type: v.crop_type });
    if (!ex) { await CropVariety.create(v); console.log(`CropVariety ${v.name} — created`); }
  }

  // ── Activity Types (3 fixed categories) ─────────────────────────────────────
  const activityTypes = [
    { name: 'Pembersihan Lahan', category: 'Lainnya' },
    { name: 'Pengolahan Tanah', category: 'Lainnya' },
    { name: 'Penanaman', category: 'Lainnya' },
    { name: 'Pemupukan Dasar', category: 'Pemupukan - Perawatan - Penyemprotan' },
    { name: 'Penyiangan', category: 'Pemupukan - Perawatan - Penyemprotan' },
    { name: 'Penyemprotan Hama', category: 'Pemupukan - Perawatan - Penyemprotan' },
    { name: 'Pengairan', category: 'Pemupukan - Perawatan - Penyemprotan' },
    { name: 'Pemupukan Susulan', category: 'Pemupukan - Perawatan - Penyemprotan' },
    { name: 'Pemangkasan', category: 'Pemupukan - Perawatan - Penyemprotan' },
    { name: 'Panen', category: 'Panen' },
    { name: 'Pasca Panen', category: 'Panen' },
    { name: 'Inspeksi', category: 'Lainnya' },
  ];

  for (const at of activityTypes) {
    const existing = await ActivityType.findOne({ name: at.name });
    if (!existing) {
      await ActivityType.create(at);
      console.log(`ActivityType ${at.name} — created`);
    } else if (existing.category !== at.category) {
      existing.category = at.category;
      await existing.save();
      console.log(`ActivityType ${at.name} — category updated`);
    }
  }

  // ── Fertilizer / Nutrient / Medicine ────────────────────────────────────────
  const fertilizers = [
    { name: 'Urea', unit: kgUnit?._id, description: 'Pupuk nitrogen' },
    { name: 'NPK Mutiara', unit: kgUnit?._id, description: 'Pupuk NPK' },
    { name: 'KCl', unit: kgUnit?._id, description: 'Pupuk kalium' },
  ];
  for (const f of fertilizers) {
    if (!f.unit) continue;
    const ex = await Fertilizer.findOne({ name: f.name });
    if (!ex) { await Fertilizer.create(f); console.log(`Fertilizer ${f.name} — created`); }
  }
  const nutrients = [
    { name: 'Kalsium Boron', unit: literUnit?._id, description: 'Nutrisi kalsium boron' },
    { name: 'ZPT Atonik', unit: literUnit?._id, description: 'Zat pengatur tumbuh' },
  ];
  for (const n of nutrients) {
    if (!n.unit) continue;
    const ex = await Nutrient.findOne({ name: n.name });
    if (!ex) { await Nutrient.create(n); console.log(`Nutrient ${n.name} — created`); }
  }
  const medicines = [
    { name: 'Insektisida Curacron', unit: literUnit?._id, description: 'Insektisida' },
    { name: 'Fungisida Antracol', unit: kgUnit?._id, description: 'Fungisida' },
  ];
  for (const m of medicines) {
    if (!m.unit) continue;
    const ex = await Medicine.findOne({ name: m.name });
    if (!ex) { await Medicine.create(m); console.log(`Medicine ${m.name} — created`); }
  }

  console.log('Seed completed successfully');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((e) => {
  console.error('Seed error:', e);
  process.exit(1);
});
