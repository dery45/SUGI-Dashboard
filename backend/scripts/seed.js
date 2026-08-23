require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../model/User');
const CropType = require('../model/CropType');
const ActivityType = require('../model/ActivityType');
const FarmMaster = require('../model/FarmMaster');
const Block = require('../model/Block');

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
  let farm = await FarmMaster.findOne({ code: 'FARM001' });
  if (!farm) {
    farm = await FarmMaster.create({
      name: 'Kebun Test',
      code: 'FARM001',
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
    console.log('Farm FARM001 — created');
  }

  // Assign farm to farmer owner
  const owner = await User.findOne({ email: 'owner@sugi.id' });
  if (owner && !owner.assigned_farms?.includes(farm._id)) {
    owner.assigned_farms = [farm._id];
    await owner.save();
    console.log('Assigned farm to owner@sugi.id');
  }

  // Create a block for the farm
  let block = await Block.findOne({ code: 'BLOCK001' });
  if (!block) {
    block = await Block.create({
      name: 'Blok A',
      code: 'BLOCK001',
      farm: farm._id,
      area_ha: 50,
      soil_type: 'Alluvial',
      water_source: 'Irigasi',
      status: 'Active',
      notes: 'Blok uji coba',
    });
    console.log('Block BLOCK001 — created');
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

  // ── Crop Types ───────────────────────────────────────────────────────────────
  const cropTypes = [
    {
      code: 'PADI',
      name: 'Padi',
      category: 'Padi',
      scientific_name: 'Oryza sativa',
      duration_days: 120,
      yield_per_ha: 5000,
      unit: 'Kg',
      description: 'Tanaman pangan utama Indonesia',
    },
    {
      code: 'JAGUNG',
      name: 'Jagung',
      category: 'Palawija',
      scientific_name: 'Zea mays',
      duration_days: 100,
      yield_per_ha: 7000,
      unit: 'Kg',
      description: 'Tanaman palawija utama',
    },
    {
      code: 'KOPI',
      name: 'Kopi',
      category: 'Perkebunan',
      scientific_name: 'Coffea arabica',
      duration_days: 365,
      yield_per_ha: 1200,
      unit: 'Kg',
      description: 'Tanaman perkebunan kopi arabika',
    },
    {
      code: 'KELAPASAWIT',
      name: 'Kelapa Sawit',
      category: 'Perkebunan',
      scientific_name: 'Elaeis guineensis',
      duration_days: 1095,
      yield_per_ha: 18000,
      unit: 'Kg',
      description: 'Tanaman perkebunan kelapa sawit',
    },
    {
      code: 'CABAI',
      name: 'Cabai',
      category: 'Hortikultura',
      scientific_name: 'Capsicum annuum',
      duration_days: 90,
      yield_per_ha: 8000,
      unit: 'Kg',
      description: 'Tanaman hortikultura cabai merah',
    },
    {
      code: 'KEDELAI',
      name: 'Kedelai',
      category: 'Palawija',
      scientific_name: 'Glycine max',
      duration_days: 85,
      yield_per_ha: 2500,
      unit: 'Kg',
      description: 'Tanaman palawija kedelai',
    },
    {
      code: 'TEBU',
      name: 'Tebu',
      category: 'Perkebunan',
      scientific_name: 'Saccharum officinarum',
      duration_days: 365,
      yield_per_ha: 70000,
      unit: 'Kg',
      description: 'Tanaman perkebunan tebu gula',
    },
    {
      code: 'UBIKAYU',
      name: 'Ubi Kayu',
      category: 'Palawija',
      scientific_name: 'Manihot esculenta',
      duration_days: 270,
      yield_per_ha: 25000,
      unit: 'Kg',
      description: 'Tanaman palawija ubi kayu',
    },
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
    {
      code: 'LAND_CLEAR',
      name: 'Pembersihan Lahan',
      category: 'Pengolahan Lahan',
      description: 'Pembersihan lahan sebelum pengolahan tanah',
      duration_hours: 16,
      color: '#f59e0b',
      unit: 'HOK',
    },
    {
      code: 'SOIL_PREP',
      name: 'Pengolahan Tanah',
      category: 'Pengolahan Lahan',
      description: 'Pengolahan tanah (membajak, menggaru, dll)',
      duration_hours: 24,
      color: '#b45309',
      unit: 'HOK',
    },
    {
      code: 'PLANTING',
      name: 'Penanaman',
      category: 'Penanaman',
      description: 'Proses penanaman bibit/benih',
      duration_hours: 8,
      color: '#10b981',
      unit: 'HOK',
    },
    {
      code: 'FERTILIZE',
      name: 'Pemupukan Dasar',
      category: 'Pemupukan',
      description: 'Pemupukan dasar sebelum tanam',
      duration_hours: 6,
      color: '#3b82f6',
      unit: 'HOK',
    },
    {
      code: 'WEEDING',
      name: 'Penyiangan',
      category: 'Pemeliharaan',
      description: 'Pengendalian gulma/manual weeding',
      duration_hours: 8,
      color: '#8b5cf6',
      unit: 'HOK',
    },
    {
      code: 'SPRAY',
      name: 'Penyemprotan Hama',
      category: 'Pengendalian Hama',
      description: 'Penyemprotan pestisida/herbisida',
      duration_hours: 4,
      color: '#ef4444',
      unit: 'HOK',
    },
    {
      code: 'IRRIGATE',
      name: 'Pengairan',
      category: 'Pengairan',
      description: 'Pengairan/irigasi tanaman',
      duration_hours: 2,
      color: '#06b6d4',
      unit: 'HOK',
    },
    {
      code: 'FERTILIZE_TOP',
      name: 'Pemupukan Susulan',
      category: 'Pemupukan',
      description: 'Pemupukan susulan saat vegetatif',
      duration_hours: 6,
      color: '#6366f1',
      unit: 'HOK',
    },
    {
      code: 'PRUNE',
      name: 'Pemangkasan',
      category: 'Pemeliharaan',
      description: 'Pemangkasan tanaman/percabangan',
      duration_hours: 8,
      color: '#ec4899',
      unit: 'HOK',
    },
    {
      code: 'HARVEST',
      name: 'Panen',
      category: 'Panen',
      description: 'Panen hasil tanaman',
      duration_hours: 24,
      color: '#f97316',
      unit: 'HOK',
    },
    {
      code: 'POST_HARVEST',
      name: 'Pasca Panen',
      category: 'Pasca Panen',
      description: 'Pengolahan pasca panen (pengeringan, penyortiran)',
      duration_hours: 12,
      color: '#14b8a6',
      unit: 'HOK',
    },
    {
      code: 'INSPECT',
      name: 'Inspeksi',
      category: 'Lainnya',
      description: 'Inspeksi rutin kondisi tanaman/lahan',
      duration_hours: 2,
      color: '#6b7280',
      unit: 'HOK',
    },
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

seed().catch((e) => {
  console.error('Seed error:', e);
  process.exit(1);
});
