require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../model/User');
const FarmMaster = require('../model/FarmMaster');
const Block = require('../model/Block');
const CropType = require('../model/CropType');
const ActivityType = require('../model/ActivityType');
const LandRecord = require('../model/LandRecord');
const CropCycle = require('../model/CropCycle');
const Activity = require('../model/Activity');
const HarvestPeriod = require('../model/HarvestPeriod');
const Sale = require('../model/Sale');
const Expense = require('../model/Expense');
const FarmerAssignment = require('../model/FarmerAssignment');
const TaskAssignment = require('../model/TaskAssignment');
const UM = require('../model/UM');

async function seedLifecycle() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sugi-dashboard-demo');
  console.log('MongoDB connected');

  // Clear existing lifecycle collections (but keep users, farms, master data)
  console.log('\n=== Clearing existing lifecycle data ===');
  await LandRecord.deleteMany({});
  await CropCycle.deleteMany({});
  await Activity.deleteMany({});
  await HarvestPeriod.deleteMany({});
  await Sale.deleteMany({});
  await Expense.deleteMany({});
  await FarmerAssignment.deleteMany({});
  await TaskAssignment.deleteMany({});
  console.log('Lifecycle collections cleared');

  // ── Get existing data ──────────────────────────────────────────────────────────
  const padi = await CropType.findOne({ name: 'Padi' });
  const jagung = await CropType.findOne({ name: 'Jagung' });
  const kedelai = await CropType.findOne({ name: 'Kedelai' });

  const landClear = await ActivityType.findOne({ name: 'Pembersihan Lahan' });
  const soilPrep = await ActivityType.findOne({ name: 'Pengolahan Tanah' });
  const planting = await ActivityType.findOne({ name: 'Penanaman' });
  const fertilize = await ActivityType.findOne({ name: 'Pemupukan Dasar' });
  const weeding = await ActivityType.findOne({ name: 'Penyiangan' });
  const spray = await ActivityType.findOne({ name: 'Penyemprotan Hama' });
  const irrigate = await ActivityType.findOne({ name: 'Pengairan' });
  const fertilizeTop = await ActivityType.findOne({ name: 'Pemupukan Susulan' });
  const prune = await ActivityType.findOne({ name: 'Pemangkasan' });
  const harvest = await ActivityType.findOne({ name: 'Panen' });
  const postHarvest = await ActivityType.findOne({ name: 'Pasca Panen' });

  // ── Create Farms ──────────────────────────────────────────────────────────────
  console.log('\n=== Creating Farms ===');
  const farm1 = await FarmMaster.findOneAndUpdate(
    { name: 'Kebun Sawit Sejahtera' },
    {
      province: 'Sumatera Utara',
      city: 'Deli Serdang',
      district: 'Sibolangit',
      village: 'Sibolangit',
      coordinates: { lat: 3.2456, lng: 98.6789 },
      land_owner: 'Budi Santoso',
      responsible_person: 'Budi Santoso',
      contact: '081234567890',
      total_area_ha: 150,
      status: 'Active',
      description: 'Kebun kelapa sawit utama',
    },
    { upsert: true, new: true }
  );
  console.log('Farm 1:', farm1.name);

  const farm2 = await FarmMaster.findOneAndUpdate(
    { name: 'Kebun Jagung Makmur' },
    {
      province: 'Jawa Timur',
      city: 'Malang',
      district: 'Dampit',
      village: 'Sumberrejo',
      coordinates: { lat: -8.1234, lng: 112.5678 },
      land_owner: 'Siti Rahayu',
      responsible_person: 'Siti Rahayu',
      contact: '081234567891',
      total_area_ha: 80,
      status: 'Active',
      description: 'Kebun jagung dan palawija',
    },
    { upsert: true, new: true }
  );
  console.log('Farm 2:', farm2.name);

  // ── Create Blocks ─────────────────────────────────────────────────────────────
  console.log('\n=== Creating Blocks ===');
  const blocks = [];
  for (const farm of [farm1, farm2]) {
    for (let i = 1; i <= 2; i++) {
      const blockName = `Blok ${i}`;
      const block = await Block.findOneAndUpdate(
        { name: blockName, farm: farm._id },
        {
          name: `Blok ${i}`,
          farm: farm._id,
          area_ha: farm._id.equals(farm1._id) ? 50 : 30,
          soil_type: 'Alluvial',
          water_source: 'Irigasi',
          status: 'Active',
          notes: `Blok ${i} di ${farm.name}`,
        },
        { upsert: true, new: true }
      );
      blocks.push(block);
      console.log(`Block: ${block.name}`);
    }
  }

  // ── Create Users (Owners + Farmers) ──────────────────────────────────────────
  console.log('\n=== Creating Users ===');
  const password = 'password123';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const owners = [];
  const farmers = [];

  // Farm 1 - 2 owners
  for (let i = 1; i <= 2; i++) {
    const email = `owner${i}_farm1@sugi.test`;
    const owner = await User.findOneAndUpdate(
      { email },
      {
        name: `Owner ${i} Farm 1`,
        email,
        password: hashedPassword,
        role: 'farmer_owner',
        phone: `0812345678${90 + i}`,
        address: farm1.village,
        assigned_farms: [farm1._id],
        status: 'Active',
      },
      { upsert: true, new: true }
    );
    owners.push(owner);
    console.log(`Owner: ${owner.name} (${email})`);
  }

  // Farm 2 - 2 owners
  for (let i = 1; i <= 2; i++) {
    const email = `owner${i}_farm2@sugi.test`;
    const owner = await User.findOneAndUpdate(
      { email },
      {
        name: `Owner ${i} Farm 2`,
        email,
        password: hashedPassword,
        role: 'farmer_owner',
        phone: `0812345678${92 + i}`,
        address: farm2.village,
        assigned_farms: [farm2._id],
        status: 'Active',
      },
      { upsert: true, new: true }
    );
    owners.push(owner);
    console.log(`Owner: ${owner.name} (${email})`);
  }

  // Farm 1 - 4 farmers
  for (let i = 1; i <= 4; i++) {
    const email = `farmer${i}_farm1@sugi.test`;
    const farmer = await User.findOneAndUpdate(
      { email },
      {
        name: `Petani ${i} Farm 1`,
        email,
        password: hashedPassword,
        role: 'farmer',
        phone: `0822345678${90 + i}`,
        address: farm1.village,
        assigned_farms: [farm1._id],
        status: 'Active',
      },
      { upsert: true, new: true }
    );
    farmers.push(farmer);
    console.log(`Farmer: ${farmer.name} (${email})`);
  }

  // Farm 2 - 4 farmers
  for (let i = 1; i <= 4; i++) {
    const email = `farmer${i}_farm2@sugi.test`;
    const farmer = await User.findOneAndUpdate(
      { email },
      {
        name: `Petani ${i} Farm 2`,
        email,
        password: hashedPassword,
        role: 'farmer',
        phone: `0822345678${94 + i}`,
        address: farm2.village,
        assigned_farms: [farm2._id],
        status: 'Active',
      },
      { upsert: true, new: true }
    );
    farmers.push(farmer);
    console.log(`Farmer: ${farmer.name} (${email})`);
  }

  // ── Create UMs ────────────────────────────────────────────────────────────────
  console.log('\n=== Creating UMs ===');
  const umUsers = await User.insertMany([
    { name: 'UM Budi', email: 'um_budi@sugi.test', password: hashedPassword, role: 'farmer_owner', phone: '081333333331', address: 'Sumatera Utara', assigned_farms: [farm1._id], status: 'Active' },
    { name: 'UM Siti', email: 'um_siti@sugi.test', password: hashedPassword, role: 'farmer_owner', phone: '081333333332', address: 'Jawa Timur', assigned_farms: [farm2._id], status: 'Active' },
  ]);

  for (const umUser of umUsers) {
    await UM.findOneAndUpdate(
      { user_id: umUser._id },
      {
        user_id: umUser._id,
        um_id: `UM${umUser._id.toString().slice(-6)}`,
        organization_id: null,
        assigned_processes: ['Land_Preparation', 'Planting', 'Maintenance', 'Harvesting'],
        assigned_farms: [farm1._id, farm2._id],
        start_date: new Date('2026-01-01'),
        end_date: new Date('2026-12-31'),
        status: 'Active',
        performance_metrics: { overall_score: 85, tasks_completed: 120, efficiency_rating: 4.5 },
      },
      { upsert: true, new: true }
    );
    console.log(`UM: ${umUser.name}`);
  }

  // ── Helper: Date calculations (fixed schedule, March–August 2026) ───────────
  const today = new Date();
  // Helper: build a date in 2026 (month is 1-based)
  const dt = (month, day) => new Date(2026, month - 1, day);

  // ── Create Lifecycle Data (10 lifecycles spanning March–August 2026) ────────
  // Durations vary from ~1.5 to ~4 months; blocks are reused sequentially
  console.log('\n=== Creating Lifecycle Data (Mar–Aug 2026, multiple lifecycles) ===');

  const cyclesData = [
    // Farm 1 - B1 - Padi IR-64 (~2.5 months, Mar→May) - Completed
    {
      farm: farm1,
      block: blocks.find(b => b.name === 'Blok 1' && String(b.farm) === String(farm1._id)),
      cropType: padi,
      variety: 'IR-64',
      cycleLabel: 'Padi IR-64 Musim 1 2026',
      area_ha: 25,
      planting_density: 40,
      seedling_count: 10000,
      landOpening: dt(3, 2),
      landClosing: dt(3, 7),
      planting: dt(3, 10),
      harvestOpening: dt(5, 8),
      harvestClosing: dt(5, 18),
      expectedYield: 5000,
      actualYield: 5200,
      status: 'Completed',
    },
    // Farm 2 - B1 - Jagung Pioneer-32 (~4 months, Mar→Jul) - Completed
    {
      farm: farm2,
      block: blocks.find(b => b.name === 'Blok 1' && String(b.farm) === String(farm2._id)),
      cropType: jagung,
      variety: 'Pioneer-32',
      cycleLabel: 'Jagung Pioneer-32 Musim 1 2026',
      area_ha: 30,
      planting_density: 65,
      seedling_count: 19500,
      landOpening: dt(3, 12),
      landClosing: dt(3, 17),
      planting: dt(3, 20),
      harvestOpening: dt(7, 8),
      harvestClosing: dt(7, 18),
      expectedYield: 8000,
      actualYield: 8300,
      status: 'Completed',
    },
    // Farm 2 - B2 - Padi IR-64 (~2.5 months, Mar→Jun) - Completed
    {
      farm: farm2,
      block: blocks.find(b => b.name === 'Blok 2' && String(b.farm) === String(farm2._id)),
      cropType: padi,
      variety: 'IR-64',
      cycleLabel: 'Padi IR-64 Musim 1 2026',
      area_ha: 20,
      planting_density: 40,
      seedling_count: 8000,
      landOpening: dt(3, 20),
      landClosing: dt(3, 25),
      planting: dt(3, 28),
      harvestOpening: dt(6, 1),
      harvestClosing: dt(6, 10),
      expectedYield: 5200,
      actualYield: 5400,
      status: 'Completed',
    },
    // Farm 1 - B2 - Kedelai Grobogan quick cycle (~1.5 months, Apr→May) - Completed
    {
      farm: farm1,
      block: blocks.find(b => b.name === 'Blok 2' && String(b.farm) === String(farm1._id)),
      cropType: kedelai,
      variety: 'Grobogan',
      cycleLabel: 'Kedelai Grobogan Musim 1 2026',
      area_ha: 12,
      planting_density: 50,
      seedling_count: 6000,
      landOpening: dt(4, 2),
      landClosing: dt(4, 6),
      planting: dt(4, 8),
      harvestOpening: dt(5, 20),
      harvestClosing: dt(5, 28),
      expectedYield: 1800,
      actualYield: 2000,
      status: 'Completed',
    },
    // Farm 1 - B2 - Jagung Bisi-18 (~3 months, Jun→Sep) - Harvesting
    {
      farm: farm1,
      block: blocks.find(b => b.name === 'Blok 2' && String(b.farm) === String(farm1._id)),
      cropType: jagung,
      variety: 'Bisi-18',
      cycleLabel: 'Jagung Bisi-18 Musim 2 2026',
      area_ha: 20,
      planting_density: 60,
      seedling_count: 12000,
      landOpening: dt(5, 30),
      landClosing: dt(6, 4),
      planting: dt(6, 6),
      harvestOpening: dt(8, 10),
      harvestClosing: null,
      expectedYield: 7500,
      actualYield: 0,
      status: 'Harvesting',
    },
    // Farm 1 - B1 - Kedelai Anjasmoro (~2.5 months, Jun→Sep) - Maintenance
    {
      farm: farm1,
      block: blocks.find(b => b.name === 'Blok 1' && String(b.farm) === String(farm1._id)),
      cropType: kedelai,
      variety: 'Anjasmoro',
      cycleLabel: 'Kedelai Anjasmoro Musim 2 2026',
      area_ha: 15,
      planting_density: 50,
      seedling_count: 7500,
      landOpening: dt(6, 1),
      landClosing: dt(6, 5),
      planting: dt(6, 8),
      harvestOpening: dt(8, 28),
      harvestClosing: null,
      expectedYield: 2000,
      actualYield: 0,
      status: 'Maintenance',
    },
    // Farm 2 - B2 - Kedelai Dena-1 (~2 months, Jun→Aug) - Completed
    {
      farm: farm2,
      block: blocks.find(b => b.name === 'Blok 2' && String(b.farm) === String(farm2._id)),
      cropType: kedelai,
      variety: 'Dena-1',
      cycleLabel: 'Kedelai Dena-1 Musim 2 2026',
      area_ha: 18,
      planting_density: 50,
      seedling_count: 9000,
      landOpening: dt(6, 15),
      landClosing: dt(6, 19),
      planting: dt(6, 21),
      harvestOpening: dt(8, 14),
      harvestClosing: dt(8, 22),
      expectedYield: 1900,
      actualYield: 2100,
      status: 'Completed',
    },
    // Farm 2 - B1 - Padi Ciherang (~3+ months, Agu→Nov) - Maintenance
    {
      farm: farm2,
      block: blocks.find(b => b.name === 'Blok 1' && String(b.farm) === String(farm2._id)),
      cropType: padi,
      variety: 'Ciherang',
      cycleLabel: 'Padi Ciherang Musim 2 2026',
      area_ha: 25,
      planting_density: 40,
      seedling_count: 10000,
      landOpening: dt(7, 25),
      landClosing: dt(7, 30),
      planting: dt(8, 1),
      harvestOpening: null,
      harvestClosing: null,
      expectedYield: 5500,
      actualYield: 0,
      status: 'Maintenance',
    },
    // Farm 2 - B2 - Jagung Bima-20 starting late Aug (~3 months) - Land_Preparation
    {
      farm: farm2,
      block: blocks.find(b => b.name === 'Blok 2' && String(b.farm) === String(farm2._id)),
      cropType: jagung,
      variety: 'Bima-20',
      cycleLabel: 'Jagung Bima-20 Musim 3 2026',
      area_ha: 22,
      planting_density: 62,
      seedling_count: 13600,
      landOpening: dt(8, 24),
      landClosing: dt(8, 28),
      planting: dt(9, 1),
      harvestOpening: null,
      harvestClosing: null,
      expectedYield: 7200,
      actualYield: 0,
      status: 'Land_Preparation',
    },
    // Farm 1 - B1 - Padi Ciherang starting end of Aug (~3 months) - Planned
    {
      farm: farm1,
      block: blocks.find(b => b.name === 'Blok 1' && String(b.farm) === String(farm1._id)),
      cropType: padi,
      variety: 'Ciherang',
      cycleLabel: 'Padi Ciherang Musim 3 2026',
      area_ha: 25,
      planting_density: 40,
      seedling_count: 10000,
      landOpening: dt(8, 30),
      landClosing: dt(9, 3),
      planting: dt(9, 5),
      harvestOpening: null,
      harvestClosing: null,
      expectedYield: 5500,
      actualYield: 0,
      status: 'Planned',
    },
  ];

  const createdCycles = [];

  for (const cycleData of cyclesData) {
    const { farm, block, cropType, variety, cycleLabel, area_ha, planting_density, seedling_count,
      landOpening, landClosing, planting, harvestOpening, harvestClosing, expectedYield, actualYield, status } = cycleData;

    // Get owner for createdBy
    const farmOwners = owners.filter(o => o.assigned_farms?.some(f => f.equals(farm._id)));
    const createdBy = farmOwners[0]?._id;

    // ── Create LandRecord ──────────────────────────────────────────────────────
    const landRecord = await LandRecord.create({
      farm_id: farm._id,
      farm_master: farm._id,
      block: block._id,
      cycle: cycleLabel,
      organization_id: null,
      notes: `Persiapan lahan untuk ${cycleLabel}`,
      status: status !== 'Planned' && status !== 'Land_Preparation' ? 'Closed' : 'Open',
      land_opening_date: landOpening,
      land_closing_date: landClosing || undefined,
      clearing_cost: Math.round(area_ha * 500000 + Math.random() * 1000000),
      soil_analysis_url: 'https://example.com/soil-analysis.pdf',
      um_responsible_id: umUsers[0]._id,
      createdBy,
    });
    console.log(`LandRecord: ${landRecord.cycle}`);

    // ── Create CropCycle ───────────────────────────────────────────────────────
    const cropCycle = await CropCycle.create({
      farm_id: farm._id,
      farm_master: farm._id,
      block: block._id,
      organization_id: null,
      cycle: cycleLabel,
      crop_type: cropType.name,
      crop_type_ref: cropType._id,
      variety,
      planting_density,
      area_ha,
      seedling_count,
      planting_date: planting,
      executor: farmOwners[0]?.name,
      notes: `Siklus tanam ${cycleLabel}`,
      status,
      land_opening_date: landOpening,
      land_closing_date: landClosing,
      harvest_opening_date: harvestOpening,
      harvest_closing_date: harvestClosing,
      expected_yield_kg: Math.round(expectedYield * area_ha),
      actual_yield_kg: actualYield > 0 ? Math.round(actualYield * area_ha) : 0,
      createdBy,
    });
    console.log(`CropCycle: ${cropCycle.cycle} (${cropCycle.status})`);

    // Update LandRecord with crop_cycle_id
    await LandRecord.findByIdAndUpdate(landRecord._id, { crop_cycle_id: cropCycle._id });

    // ── Update block status if planted/harvested ───────────────────────────────
    if (['Planted', 'Maintenance', 'Harvesting', 'Completed'].includes(status)) {
      await Block.findByIdAndUpdate(block._id, { status: 'Planted' });
    }

    // ── Create Activities (Maintenance) ────────────────────────────────────────
    if (['Maintenance', 'Harvesting', 'Completed'].includes(status)) {
      const activities = [
        { type: fertilize, daysAfterPlanting: 15, desc: 'Pemupukan dasar', hours: 8, cost: 2000000 },
        { type: weeding, daysAfterPlanting: 25, desc: 'Penyiangan manual', hours: 16, cost: 1500000 },
        { type: spray, daysAfterPlanting: 35, desc: 'Penyemprotan hama', hours: 4, cost: 800000 },
        { type: irrigate, daysAfterPlanting: 45, desc: 'Pengairan tambahan', hours: 2, cost: 300000 },
        { type: fertilizeTop, daysAfterPlanting: 55, desc: 'Pemupukan susulan', hours: 6, cost: 1800000 },
        { type: prune, daysAfterPlanting: 65, desc: 'Pemangkasan', hours: 8, cost: 1200000 },
        { type: spray, daysAfterPlanting: 75, desc: 'Penyemprotan hama lanjutan', hours: 4, cost: 800000 },
      ];

      for (const act of activities) {
        const actDate = new Date(planting.getTime() + act.daysAfterPlanting * 24 * 60 * 60 * 1000);
        if (actDate <= new Date()) {
          const assignedFarmers = farmers
            .filter(f => f.assigned_farms?.some(fa => fa.equals(farm._id)))
            .slice(0, 2)
            .map(f => f._id);

          await Activity.create({
            crop_cycle_id: cropCycle._id,
            cycle: cropCycle.cycle,
            farm_id: farm._id,
            farm_master: farm._id,
            block: block._id,
            organization_id: null,
            executor: assignedFarmers[0] ? farmers.find(f => f._id.equals(assignedFarmers[0]))?.name : 'Petani',
            activity_type: act.type.name,
            activity_type_ref: act.type._id,
            description: act.desc,
            date: actDate,
            assigned_farmers: assignedFarmers,
            um_responsible_id: umUsers[0]._id,
            executor_id: assignedFarmers[0],
            status: 'Completed',
            labor_hours: act.hours,
            cost: act.cost,
            createdBy,
          });
        }
      }
      console.log(`  Activities created for ${cropCycle.cycle}`);
    }

    // ── Create HarvestPeriod ───────────────────────────────────────────────────
    if (['Harvesting', 'Completed'].includes(status)) {
      const harvestPeriod = await HarvestPeriod.create({
        farm_id: farm._id,
        farm_master: farm._id,
        block: block._id,
        crop_cycle_id: cropCycle._id,
        cycle: cropCycle.cycle,
        organization_id: null,
        status: status === 'Completed' ? 'Completed' : 'Open',
        harvest_opening_date: harvestOpening,
        harvest_closing_date: harvestClosing,
        expected_end: harvestClosing || new Date(harvestOpening.getTime() + 14 * 24 * 60 * 60 * 1000),
        expected_yield_window_start: harvestOpening,
        expected_yield_window_end: harvestClosing || new Date(harvestOpening.getTime() + 21 * 24 * 60 * 60 * 1000),
        expected_yield_kg: Math.round(expectedYield * area_ha),
        actual_yield_kg: actualYield > 0 ? Math.round(actualYield * area_ha) : undefined,
        total_yield_kg: actualYield > 0 ? Math.round(actualYield * area_ha) : 0,
        notes: `Panen ${cropCycle.cycle}`,
        quality_grade: actualYield > 0 ? 'A' : undefined,
        um_responsible_id: umUsers[0]._id,
        createdBy,
      });
      console.log(`  HarvestPeriod: ${harvestPeriod.status}`);
    }

    // ── Create Sales (for Completed cycles) ────────────────────────────────────
    if (status === 'Completed') {
      const totalYield = actualYield > 0 ? Math.round(actualYield * area_ha) : Math.round(expectedYield * area_ha);
      const buyers = [
        { name: 'PT Mill Sejahtera', type: 'Mill', pct: 0.5, price: 6500 },
        { name: 'Tengkulak Budi', type: 'Middleman', pct: 0.3, price: 6000 },
        { name: 'Petani Langsung', type: 'Direct', pct: 0.2, price: 6800 },
      ];

      let remaining = totalYield;
      for (const buyer of buyers) {
        const qty = Math.round(totalYield * buyer.pct);
        if (qty > 0 && remaining >= qty) {
          const saleDate = harvestClosing || new Date(harvestOpening.getTime() + 7 * 24 * 60 * 60 * 1000);
          await Sale.create({
            crop_cycle_id: cropCycle._id,
            farm_id: farm._id,
            organization_id: null,
            buyer_name: buyer.name,
            buyer_type: buyer.type,
            quantity_kg: qty,
            price_per_kg: buyer.price,
            transport_notes: `Pengiriman ke ${buyer.name}`,
            invoice_ref: `INV-${cropCycle._id.toString().slice(-6)}-${buyer.type.slice(0,3).toUpperCase()}`,
            sale_date: saleDate,
            createdBy,
          });
          remaining -= qty;
        }
      }
      console.log(`  Sales: ${buyers.length} buyers`);
    }

    // ── Create Expenses ────────────────────────────────────────────────────────
    const expenseCategories = [
      { category: 'Bibit', amount: area_ha * 2000000, desc: 'Bibit tanaman' },
      { category: 'Pupuk', amount: area_ha * 3500000, desc: 'Pupuk dasar dan susulan' },
      { category: 'Pestisida', amount: area_ha * 1500000, desc: 'Pestisida dan herbisida' },
      { category: 'Tenaga Kerja', amount: area_ha * 2500000, desc: 'Upah petani' },
      { category: 'Transportasi', amount: area_ha * 500000, desc: 'Transportasi hasil' },
      { category: 'Peralatan', amount: area_ha * 800000, desc: 'Sewa alat pertanian' },
    ];

    for (const exp of expenseCategories) {
      // Keep expense dates realistic: never in the future relative to today
      const expBase = landOpening > today ? today : landOpening;
      const maxSpreadDays = Math.min(90, Math.max(0, (today.getTime() - expBase.getTime()) / (24 * 60 * 60 * 1000)));
      const expDate = new Date(expBase.getTime() + Math.random() * maxSpreadDays * 24 * 60 * 60 * 1000);
      await Expense.create({
        crop_cycle_id: cropCycle._id,
        farm_id: farm._id,
        organization_id: null,
        category: exp.category,
        amount_idr: Math.round(exp.amount + Math.random() * 500000),
        description: exp.desc,
        expense_date: expDate,
        um_responsible_id: umUsers[0]._id,
        receipt_ref: `REC-${cropCycle._id.toString().slice(-6)}-${exp.category.slice(0,3).toUpperCase()}`,
        createdBy,
      });
    }
    console.log(`  Expenses: ${expenseCategories.length} categories`);

    // ── Create FarmerAssignments ──────────────────────────────────────────────
    const farmFarmers = farmers.filter(f => f.assigned_farms?.some(fa => fa.equals(farm._id)));
    for (const farmer of farmFarmers.slice(0, 2)) {
      const existingFA = await FarmerAssignment.findOne({ farmer: farmer._id, block: block._id });
      if (!existingFA) {
        await FarmerAssignment.create({
          farmer: farmer._id,
          block: block._id,
          farm: farm._id,
          access_stages: ['Land_Preparation', 'Planting', 'Maintenance'],
          sales_access: true,
          assigned_by: farmOwners[0]?._id,
          status: 'Active',
        });
      }
    }

    // ── Create TaskAssignment ─────────────────────────────────────────────────
    for (const farmer of farmFarmers.slice(0, 2)) {
      await TaskAssignment.findOneAndUpdate(
        { farmer: farmer._id, crop_cycle: cropCycle._id },
        {
          farmer: farmer._id,
          crop_cycle: cropCycle._id,
          farm: farm._id,
          stages: ['Land_Preparation', 'Planting', 'Maintenance'],
          assigned_by: farmOwners[0]?._id,
          status: 'Active',
        },
        { upsert: true, new: true }
      );
    }

    createdCycles.push(cropCycle);
  }

  // ── Additional Sales from past cycles ────────────────────────────────────────
  console.log('\n=== Creating Additional Sales Data ===');
  const completedCycles = createdCycles.filter(c => c.status === 'Completed');
  for (const cycle of completedCycles) {
    const existingSales = await Sale.countDocuments({ crop_cycle_id: cycle._id });
    if (existingSales < 3) {
      const totalYield = cycle.actual_yield_kg > 0 ? cycle.actual_yield_kg : cycle.expected_yield_kg;
      const buyers = [
        { name: 'PT Mill Sejahtera', type: 'Mill', pct: 0.5, price: cycle.crop_type === 'Padi' ? 6500 : 5500 },
        { name: 'Tengkulak Budi', type: 'Middleman', pct: 0.3, price: cycle.crop_type === 'Padi' ? 6000 : 5000 },
        { name: 'Petani Langsung', type: 'Direct', pct: 0.2, price: cycle.crop_type === 'Padi' ? 6800 : 5800 },
      ];

      for (const buyer of buyers) {
        const qty = Math.round(totalYield * buyer.pct);
        if (qty > 0) {
          const hp = await HarvestPeriod.findOne({ crop_cycle_id: cycle._id });
          const saleDate = hp?.harvest_closing_date || cycle.harvest_closing_date || new Date();
          await Sale.create({
            crop_cycle_id: cycle._id,
            farm_id: cycle.farm_master,
            organization_id: null,
            buyer_name: buyer.name,
            buyer_type: buyer.type,
            quantity_kg: qty,
            price_per_kg: buyer.price,
            transport_notes: `Pengiriman ke ${buyer.name}`,
            invoice_ref: `INV-${cycle._id.toString().slice(-6)}-${buyer.type.slice(0,3).toUpperCase()}`,
            sale_date: new Date(saleDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
            createdBy: cycle.createdBy,
          });
        }
      }
      console.log(`Additional sales for ${cycle.cycle}`);
    }
  }

  // ── Summary ──────────────────────────────────────────────────────────────────
  console.log('\n=== SEEDING SUMMARY ===');
  console.log(`Farms: 2`);
  console.log(`Blocks: ${blocks.length}`);
  console.log(`Owners: ${owners.length}`);
  console.log(`Farmers: ${farmers.length}`);
  console.log(`Crop Cycles: ${createdCycles.length}`);
  console.log(`Ums: ${umUsers.length}`);

  const stats = await Promise.all([
    LandRecord.countDocuments(),
    CropCycle.countDocuments(),
    Activity.countDocuments(),
    HarvestPeriod.countDocuments(),
    Sale.countDocuments(),
    Expense.countDocuments(),
    FarmerAssignment.countDocuments(),
    TaskAssignment.countDocuments(),
  ]);
  console.log(`LandRecords: ${stats[0]}`);
  console.log(`CropCycles: ${stats[1]}`);
  console.log(`Activities: ${stats[2]}`);
  console.log(`HarvestPeriods: ${stats[3]}`);
  console.log(`Sales: ${stats[4]}`);
  console.log(`Expenses: ${stats[5]}`);
  console.log(`FarmerAssignments: ${stats[6]}`);
  console.log(`TaskAssignments: ${stats[7]}`);

  await mongoose.disconnect();
  console.log('\nLifecycle seeding completed successfully!');
  process.exit(0);
}

seedLifecycle().catch((e) => {
  console.error('Seed error:', e);
  process.exit(1);
});