const mongoose = require('mongoose');
const FarmMaster = require('../model/FarmMaster');
const Block = require('../model/Block');
const CropCycle = require('../model/CropCycle');
const UM = require('../model/UM');
const Sale = require('../model/Sale');
const Expense = require('../model/Expense');
const LandRecord = require('../model/LandRecord');
const HarvestPeriod = require('../model/HarvestPeriod');
const Activity = require('../model/Activity');
const User = require('../model/User');

// ── Farm access scope ─────────────────────────────────────────────────────────
// Owners are always restricted to their assigned farms (aggregated when several),
// superadmin sees every farm. Resolved once per request, applied to all queries.
const getOwnedFarmIds = async (userId) => {
  const u = await User.findById(userId).select('assigned_farms').lean();
  return (u?.assigned_farms || []).map(f =>
    f && typeof f === 'object' ? (f._id || f).toString() : String(f)
  );
};

const resolveFarmScope = async (req, requestedFarmId) => {
  if (req.user?.role === 'farmer_owner') {
    const owned = await getOwnedFarmIds(req.user.id);
    if (!owned.length) return { farm_ids: [] };
    if (requestedFarmId) {
      if (!owned.includes(String(requestedFarmId))) return { forbidden: true };
      return { farm_id: String(requestedFarmId) };
    }
    return { farm_ids: owned };
  }
  // superadmin (and any other management role): global view, optional filter
  return requestedFarmId ? { farm_id: String(requestedFarmId) } : {};
};

// Attach farm scope to a match clause (`$in` aggregation across multiple farms)
const applyFarmScope = (match, scope, field) => {
  if (!scope) return;
  if (scope.farm_id) match[field] = new mongoose.Types.ObjectId(scope.farm_id);
  else if (Array.isArray(scope.farm_ids)) {
    match[field] = { $in: scope.farm_ids.map(id => new mongoose.Types.ObjectId(id)) };
  }
};

const buildCycleMatch = ({ farm_id, farm_ids, block_id, cycle_id }) => {
  const match = {};
  applyFarmScope(match, { farm_id, farm_ids }, 'farm_master');
  if (block_id) match.block = new mongoose.Types.ObjectId(block_id);
  if (cycle_id) match._id = new mongoose.Types.ObjectId(cycle_id);
  return match;
};

const buildSaleMatch = ({ farm_id, farm_ids, cycle_id, start_date, end_date }) => {
  const match = {};
  applyFarmScope(match, { farm_id, farm_ids }, 'farm_id');
  if (cycle_id) match.crop_cycle_id = new mongoose.Types.ObjectId(cycle_id);
  if (start_date || end_date) {
    match.sale_date = {};
    if (start_date) match.sale_date.$gte = new Date(start_date);
    if (end_date) match.sale_date.$lte = new Date(end_date);
  }
  return match;
};

const buildExpenseMatch = ({ farm_id, farm_ids, cycle_id, start_date, end_date }) => {
  const match = {};
  applyFarmScope(match, { farm_id, farm_ids }, 'farm_id');
  if (cycle_id) match.crop_cycle_id = new mongoose.Types.ObjectId(cycle_id);
  if (start_date || end_date) {
    match.expense_date = {};
    if (start_date) match.expense_date.$gte = new Date(start_date);
    if (end_date) match.expense_date.$lte = new Date(end_date);
  }
  return match;
};

const buildHarvestMatch = ({ farm_id, farm_ids, block_id, cycle_id, start_date, end_date }) => {
  const match = {};
  applyFarmScope(match, { farm_id, farm_ids }, 'farm_master');
  if (block_id) match.block = new mongoose.Types.ObjectId(block_id);
  if (cycle_id) match.crop_cycle_id = new mongoose.Types.ObjectId(cycle_id);
  if (start_date || end_date) {
    match.harvest_opening_date = {};
    if (start_date) match.harvest_opening_date.$gte = new Date(start_date);
    if (end_date) match.harvest_opening_date.$lte = new Date(end_date);
  }
  return match;
};

const calculateKPIs = async (filters) => {
  try {
    const { farm_id, farm_ids, block_id, cycle_id, start_date, end_date } = filters;

    const cycleMatch = buildCycleMatch({ farm_id, farm_ids, block_id, cycle_id });
    const activeCycleMatch = { ...cycleMatch, status: { $in: ['Planned', 'Land_Preparation', 'Planted', 'Maintenance', 'Harvesting'] } };

    const saleMatch = buildSaleMatch({ farm_id, farm_ids, cycle_id, start_date, end_date });
    const expenseMatch = buildExpenseMatch({ farm_id, farm_ids, cycle_id, start_date, end_date });
    const harvestMatch = buildHarvestMatch({ farm_id, farm_ids, block_id, cycle_id, start_date, end_date });

    // Area basis follows the same farm scope as everything else
    const farmAreaMatch = { status: 'Active' };
    applyFarmScope(farmAreaMatch, { farm_id, farm_ids }, '_id');

    const [activeCycles, salesAgg, expenseAgg, harvestAgg, farmAreaAgg] = await Promise.all([
      CropCycle.countDocuments(activeCycleMatch),
      Sale.aggregate([
        { $match: saleMatch },
        {
          $group: {
            _id: null,
            totalYieldKg: { $sum: '$quantity_kg' },
            // Fallback to qty*price for documents written without the pre-save hook
            totalRevenue: { $sum: { $ifNull: ['$total_revenue', { $multiply: ['$quantity_kg', '$price_per_kg'] }] } },
          },
        },
      ]),
      Expense.aggregate([{ $match: expenseMatch }, { $group: { _id: null, totalCost: { $sum: '$amount_idr' } } }]),
      HarvestPeriod.aggregate([
        { $match: { ...harvestMatch, status: { $in: ['Closed', 'Completed'] } } },
        { $group: { _id: null, totalProduksiKg: { $sum: '$actual_yield_kg' } } },
      ]),
      FarmMaster.aggregate([
        { $match: farmAreaMatch },
        { $group: { _id: null, totalHa: { $sum: '$total_area_ha' } } },
      ]),
    ]);

    const totalProduksiKg = harvestAgg[0]?.totalProduksiKg || 0;
    const totalProduksiTons = +(totalProduksiKg / 1000).toFixed(2);
    const totalPendapatan = salesAgg[0]?.totalRevenue || 0;
    const totalPengeluaran = expenseAgg[0]?.totalCost || 0;
    const labaBersih = totalPendapatan - totalPengeluaran;
    const totalHa = farmAreaAgg[0]?.totalHa || 0;
    const produktivitasHa = totalHa > 0 ? +(totalProduksiTons / totalHa).toFixed(2) : 0;

    return {
      success: true,
      activeCyclesCount: activeCycles,
      totalProduksiTons,
      totalPendapatan,
      totalPengeluaran,
      labaBersih,
      produktivitasHa,
    };
  } catch (error) {
    console.error('KPI Error:', error);
    return { success: false, error: error.message };
  }
};

const getChartData = async (filters) => {
  try {
    const { farm_id, farm_ids, block_id, cycle_id, start_date, end_date, year } = filters;

    const cycleMatch = buildCycleMatch({ farm_id, farm_ids, block_id, cycle_id });
    const saleMatch = buildSaleMatch({ farm_id, farm_ids, cycle_id, start_date, end_date });
    const expenseMatch = buildExpenseMatch({ farm_id, farm_ids, cycle_id, start_date, end_date });
    const harvestMatch = buildHarvestMatch({ farm_id, farm_ids, block_id, cycle_id, start_date, end_date });

    const targetYear = parseInt(year) || new Date().getFullYear();
    const yearStart = new Date(`${targetYear}-01-01`);
    const yearEnd = new Date(`${targetYear + 1}-01-01`);

    // Explicit start/end dates win; otherwise fall back to the selected year window
    const buildDateRange = () => {
      if (start_date || end_date) {
        const range = {};
        if (start_date) range.$gte = new Date(start_date);
        if (end_date) range.$lte = new Date(end_date);
        return range;
      }
      return { $gte: yearStart, $lt: yearEnd };
    };
    const saleDateRange = buildDateRange();
    const expenseDateRange = buildDateRange();

    const [
      statusDist,
      produksiTrend,
      revExpTrend,
      produksiPerCycle,
      timelineData,
      activeCyclesTable,
      farmBlockPerformance,
    ] = await Promise.all([
      // Status distribution
      CropCycle.aggregate([
        { $match: cycleMatch },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } },
        { $sort: { count: -1 } },
      ]),

      // Produksi trend (monthly from harvestperiods)
      HarvestPeriod.aggregate([
        {
          $match: {
            ...harvestMatch,
            status: { $in: ['Closed', 'Completed'] },
            harvest_opening_date: { $gte: yearStart, $lt: yearEnd },
          },
        },
        {
          $group: {
            _id: { month: { $month: '$harvest_opening_date' } },
            hasil_kg: { $sum: '$actual_yield_kg' },
          },
        },
        { $sort: { '_id.month': 1 } },
        {
          $project: {
            _id: 0,
            bulan: {
              $arrayElemAt: [
                ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
                { $subtract: ['$_id.month', 1] },
              ],
            },
            hasil_ton: { $divide: ['$hasil_kg', 1000] },
          },
        },
      ]),

      // Revenue vs Expense trend (monthly)
      Promise.all([
        Sale.aggregate([
          { $match: { ...saleMatch, sale_date: saleDateRange } },
          {
            $group: {
              _id: { month: { $month: '$sale_date' } },
              // Fallback to qty*price for documents written without the pre-save hook
              pendapatan: { $sum: { $ifNull: ['$total_revenue', { $multiply: ['$quantity_kg', '$price_per_kg'] }] } },
            },
          },
          { $sort: { '_id.month': 1 } },
        ]),
        Expense.aggregate([
          { $match: { ...expenseMatch, expense_date: expenseDateRange } },
          { $group: { _id: { month: { $month: '$expense_date' } }, pengeluaran: { $sum: '$amount_idr' } } },
          { $sort: { '_id.month': 1 } },
        ]),
      ]).then(([rev, exp]) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        return months.map((m, idx) => {
          const monthNum = idx + 1;
          const r = rev.find(x => x._id.month === monthNum);
          const e = exp.find(x => x._id.month === monthNum);
          return {
            bulan: m,
            pendapatan: r?.pendapatan || 0,
            pengeluaran: e?.pengeluaran || 0,
          };
        });
      }),

      // Produksi per cycle (from harvestperiods)
      HarvestPeriod.aggregate([
        { $match: { ...harvestMatch, status: { $in: ['Closed', 'Completed'] } } },
        {
          $lookup: {
            from: 'cropcycles',
            localField: 'crop_cycle_id',
            foreignField: '_id',
            as: 'cycle',
          },
        },
        { $unwind: { path: '$cycle', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: '$crop_cycle_id',
            siklus: { $first: '$cycle.cycle' },
            crop_type: { $first: '$cycle.crop_type' },
            produksi_kg: { $sum: '$actual_yield_kg' },
          },
        },
        {
          $project: {
            _id: 0,
            cycle_id: '$_id',
            siklus: { $ifNull: ['$siklus', 'Tanpa Label'] },
            crop_type: { $ifNull: ['$crop_type', '-'] },
            produksi_ton: { $divide: ['$produksi_kg', 1000] },
          },
        },
        { $sort: { produksi_ton: -1 } },
      ]),

      // Timeline data - assemble from landrecords, cropcycles, activities, harvestperiods
      CropCycle.aggregate([
        { $match: cycleMatch },
        {
          $lookup: {
            from: 'landrecords',
            localField: '_id',
            foreignField: 'crop_cycle_id',
            as: 'landrecords',
          },
        },
        {
          $lookup: {
            from: 'activities',
            localField: '_id',
            foreignField: 'crop_cycle_id',
            as: 'activities',
          },
        },
        {
          $lookup: {
            from: 'harvestperiods',
            localField: '_id',
            foreignField: 'crop_cycle_id',
            as: 'harvestperiods',
          },
        },
        {
          $lookup: {
            from: 'blocks',
            localField: 'block',
            foreignField: '_id',
            as: 'block',
          },
        },
        {
          $lookup: {
            from: 'farmmasters',
            localField: 'farm_master',
            foreignField: '_id',
            as: 'farm_master',
          },
        },
        {
          $project: {
            _id: 1,
            cycle: 1,
            crop_type: 1,
            variety: 1,
            planting_date: 1,
            status: 1,
            land_opening_date: 1,
            land_closing_date: 1,
            harvest_opening_date: 1,
            harvest_closing_date: 1,
            expected_end: 1,
            'block.name': 1,
            'farm_master.name': 1,
            landrecords: { land_opening_date: 1, land_closing_date: 1 },
            activities: { date: 1 },
            harvestperiods: { harvest_opening_date: 1, harvest_closing_date: 1, expected_end: 1 },
          },
        },
        { $sort: { createdAt: -1 } },
      ]).then(cycles => {
        return cycles.map(cycle => {
          const lr = cycle.landrecords?.[0] || {};
          const hp = cycle.harvestperiods?.[0] || {};
          const acts = cycle.activities || [];

          let maintenance_start = null;
          let maintenance_end = null;
          if (acts.length > 0) {
            const dates = acts.map(a => new Date(a.date)).sort((a, b) => a - b);
            maintenance_start = dates[0];
            maintenance_end = dates[dates.length - 1];
          }

          return {
            _id: cycle._id,
            cycle: cycle.cycle,
            crop_type: cycle.crop_type,
            variety: cycle.variety,
            block_name: cycle.block?.[0]?.name,
            farm_name: cycle.farm_master?.[0]?.name,
            land_opening_date: lr.land_opening_date || cycle.land_opening_date,
            land_closing_date: lr.land_closing_date || cycle.land_closing_date,
            planting_date: cycle.planting_date,
            maintenance_start,
            maintenance_end,
            harvest_opening_date: hp.harvest_opening_date || cycle.harvest_opening_date,
            harvest_closing_date: hp.harvest_closing_date || cycle.harvest_closing_date,
            expected_end: hp.expected_end || cycle.expected_end,
            status: cycle.status,
          };
        });
      }),

      // Active cycles table
      CropCycle.aggregate([
        { $match: { ...cycleMatch, status: { $in: ['Planned', 'Land_Preparation', 'Planted', 'Maintenance', 'Harvesting'] } } },
        {
          $lookup: {
            from: 'harvestperiods',
            localField: '_id',
            foreignField: 'crop_cycle_id',
            as: 'harvestperiods',
          },
        },
        {
          $lookup: {
            from: 'blocks',
            localField: 'block',
            foreignField: '_id',
            as: 'block',
          },
        },
        {
          $project: {
            _id: 1,
            cycle: 1,
            crop_type: 1,
            variety: 1,
            area_ha: 1,
            planting_date: 1,
            status: 1,
            expected_end: { $ifNull: ['$harvestperiods.expected_end', null] },
            actual_yield_kg: { $ifNull: [{ $arrayElemAt: ['$harvestperiods.actual_yield_kg', 0] }, 0] },
            block_name: { $arrayElemAt: ['$block.name', 0] },
          },
        },
        { $sort: { createdAt: -1 } },
      ]),

      // Farm/Block performance rollup
      CropCycle.aggregate([
        { $match: cycleMatch },
        {
          $lookup: {
            from: 'harvestperiods',
            localField: '_id',
            foreignField: 'crop_cycle_id',
            as: 'harvestperiods',
          },
        },
        {
          $lookup: {
            from: 'sales',
            localField: '_id',
            foreignField: 'crop_cycle_id',
            as: 'sales',
          },
        },
        {
          $lookup: {
            from: 'expenses',
            localField: '_id',
            foreignField: 'crop_cycle_id',
            as: 'expenses',
          },
        },
        {
          $lookup: {
            from: 'blocks',
            localField: 'block',
            foreignField: '_id',
            as: 'block',
          },
        },
        {
          $lookup: {
            from: 'farmmasters',
            localField: 'farm_master',
            foreignField: '_id',
            as: 'farm_master',
          },
        },
        {
          $project: {
            farm_id: '$farm_master._id',
            farm_name: { $arrayElemAt: ['$farm_master.name', 0] },
            block_id: '$block._id',
            block_name: { $arrayElemAt: ['$block.name', 0] },
            cycle_id: '$_id',
            status: 1,
            produksi_kg: { $sum: '$harvestperiods.actual_yield_kg' },
            pendapatan: { $sum: '$sales.total_revenue' },
            pengeluaran: { $sum: '$expenses.amount_idr' },
          },
        },
        {
          $group: {
            _id: { farm_id: '$farm_id', farm_name: '$farm_name', block_id: '$block_id', block_name: '$block_name' },
            active_cycles: { $sum: { $cond: [{ $in: ['$status', ['Planned', 'Land_Preparation', 'Planted', 'Maintenance', 'Harvesting']] }, 1, 0] } },
            total_produksi_kg: { $sum: '$produksi_kg' },
            total_pendapatan: { $sum: '$pendapatan' },
            total_pengeluaran: { $sum: '$pengeluaran' },
          },
        },
        {
          $project: {
            _id: 0,
            farm_id: '$_id.farm_id',
            farm_name: '$_id.farm_name',
            block_id: '$_id.block_id',
            block_name: { $ifNull: ['$_id.block_name', 'Tanpa Block'] },
            active_cycles: 1,
            produksi_ton: { $divide: ['$total_produksi_kg', 1000] },
            pendapatan: '$total_pendapatan',
            pengeluaran: '$total_pengeluaran',
            laba: { $subtract: ['$total_pendapatan', '$total_pengeluaran'] },
          },
        },
        { $sort: { farm_name: 1, block_name: 1 } },
      ]),
    ]);

    return {
      success: true,
      data: {
        statusDistribution: statusDist,
        produksiTrend,
        revExpTrend,
        produksiPerCycle,
        timeline: timelineData,
        activeCyclesTable,
        farmBlockPerformance,
      },
    };
  } catch (error) {
    console.error('Chart Data Error:', error);
    return { success: false, error: error.message };
  }
};

const getKpi = async (req, res) => {
  try {
    const { farm_id, block_id, cycle_id, start_date, end_date } = req.query;
    const scope = await resolveFarmScope(req, farm_id);
    if (scope.forbidden) return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke farm ini' });
    const data = await calculateKPIs({ farm_id: scope.farm_id, farm_ids: scope.farm_ids, block_id, cycle_id, start_date, end_date });
    if (!data.success) return res.status(500).json({ success: false, error: data.error });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getYieldTrendHandler = async (req, res) => {
  try {
    const { farm_id, block_id, cycle_id, start_date, end_date, year } = req.query;
    const scope = await resolveFarmScope(req, farm_id);
    if (scope.forbidden) return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke farm ini' });
    const targetYear = parseInt(year) || new Date().getFullYear();
    const yearStart = new Date(`${targetYear}-01-01`);
    const yearEnd = new Date(`${targetYear + 1}-01-01`);

    const harvestMatch = buildHarvestMatch({ farm_id: scope.farm_id, farm_ids: scope.farm_ids, block_id, cycle_id });
    const trend = await HarvestPeriod.aggregate([
      {
        $match: {
          ...harvestMatch,
          status: { $in: ['Closed', 'Completed'] },
          harvest_opening_date: { $gte: yearStart, $lt: yearEnd },
        },
      },
      {
        $group: {
          _id: { month: { $month: '$harvest_opening_date' } },
          hasil_kg: { $sum: '$actual_yield_kg' },
        },
      },
      { $sort: { '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          bulan: {
            $arrayElemAt: [
              ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
              { $subtract: ['$_id.month', 1] },
            ],
          },
          hasil_ton: { $divide: ['$hasil_kg', 1000] },
        },
      },
    ]);
    res.json({ success: true, data: trend });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getChartDataHandler = async (req, res) => {
  try {
    const { farm_id, block_id, cycle_id, start_date, end_date, year } = req.query;
    const scope = await resolveFarmScope(req, farm_id);
    if (scope.forbidden) return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke farm ini' });
    const result = await getChartData({
      farm_id: scope.farm_id,
      farm_ids: scope.farm_ids,
      block_id,
      cycle_id,
      start_date,
      end_date,
      year,
    });
    if (!result.success) return res.status(500).json({ success: false, error: result.error });
    res.json({ success: true, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getUMPerformanceHandler = async (req, res) => {
  try {
    const ums = await UM.find()
      .populate('user_id', 'name email')
      .sort({ 'performance_metrics.overall_score': -1 })
      .limit(10);
    res.json({ success: true, data: ums });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getBlocksByFarm = async (req, res) => {
  try {
    const scope = await resolveFarmScope(req, req.query.farm_id);
    if (scope.forbidden) return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke farm ini' });
    // No status filter here: blocks change status (Active -> Planted -> ...) as
    // cycles progress, but the cascading filter must always list every block.
    const query = {};
    applyFarmScope(query, scope, 'farm');
    const blocks = await Block.find(query).select('name code area_ha').sort({ name: 1 }).lean();
    res.json({ success: true, data: blocks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getCyclesByFarmBlock = async (req, res) => {
  try {
    const scope = await resolveFarmScope(req, req.query.farm_id);
    if (scope.forbidden) return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke farm ini' });
    const { block } = req.query;
    const query = { status: { $in: ['Planned', 'Land_Preparation', 'Planted', 'Maintenance', 'Harvesting', 'Completed'] } };
    applyFarmScope(query, scope, 'farm_master');
    if (block) query.block = new mongoose.Types.ObjectId(block);
    const cycles = await CropCycle.find(query)
      .select('cycle crop_type variety area_ha planting_date status farm_master block harvest_opening_date harvest_closing_date expected_yield_kg actual_yield_kg')
      .populate('block', 'name code')
      .populate('farm_master', 'name code')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: cycles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getKpi,
  getYieldTrendHandler,
  getChartDataHandler,
  getUMPerformanceHandler,
  getBlocksByFarm,
  getCyclesByFarmBlock,
};
