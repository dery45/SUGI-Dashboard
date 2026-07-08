const mongoose = require('mongoose');
const FarmMaster = require('../models/FarmMaster');
const CropCycle = require('../models/CropCycle');
const UM = require('../models/UM');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');

const buildMatch = ({ farm_id, start_date, end_date }) => {
  const match = {};
  if (farm_id) match.farm_id = new mongoose.Types.ObjectId(farm_id);
  if (start_date || end_date) {
    match.sale_date = {};
    if (start_date) match.sale_date.$gte = new Date(start_date);
    if (end_date) match.sale_date.$lte = new Date(end_date);
  }
  return match;
};

class KPIService {
  static async calculateOrganizationOverview({ farm_id, start_date, end_date } = {}) {
    try {
      const saleMatch = buildMatch({ farm_id, start_date, end_date });
      const farmFilter = farm_id ? { _id: farm_id, status: 'Active' } : { status: 'Active' };
      const cycleFilter = farm_id ? { farm_id, status: { $in: ['Planned', 'Land_Preparation', 'Planted', 'Maintenance', 'Harvesting'] } } : { status: { $in: ['Planned', 'Land_Preparation', 'Planted', 'Maintenance', 'Harvesting'] } };

      const [
        activeFarmsCount,
        activeCycles,
        unassignedUMs,
        salesAgg,
        expenseAgg,
      ] = await Promise.all([
        FarmMaster.countDocuments(farmFilter),
        CropCycle.find(cycleFilter),
        UM.countDocuments({ $or: [{ assigned_farms: { $size: 0 } }, { assigned_processes: { $size: 0 } }] }),
        Sale.aggregate([
          { $match: saleMatch },
          { $group: { _id: null, totalYieldKg: { $sum: '$quantity_kg' }, totalRevenue: { $sum: '$total_revenue' }, avgPricePerKg: { $avg: '$price_per_kg' } } }
        ]),
        Expense.aggregate([
          { $match: saleMatch },
          { $group: { _id: null, totalCost: { $sum: '$amount_idr' } } }
        ]),
      ]);

      const totalYieldKg = salesAgg[0]?.totalYieldKg || 0;
      const totalRevenue = salesAgg[0]?.totalRevenue || 0;
      const totalCost = expenseAgg[0]?.totalCost || 0;
      const avgPricePerKg = salesAgg[0]?.avgPricePerKg || 0;
      const totalYieldTons = +(totalYieldKg / 1000).toFixed(2);
      const costPerKg = totalYieldKg > 0 ? +(totalCost / totalYieldKg).toFixed(0) : 0;
      const roiPercentage = totalCost > 0 ? +(((totalRevenue - totalCost) / totalCost) * 100).toFixed(1) : 0;
      const farmAreaAgg = await FarmMaster.aggregate([{ $match: farmFilter }, { $group: { _id: null, totalHa: { $sum: '$total_area_ha' } } }]);
      const totalHa = farmAreaAgg[0]?.totalHa || 1;
      const avgYieldPerHa = +(totalYieldTons / totalHa).toFixed(2);

      const cycleStatusBreakdown = activeCycles.reduce((acc, cycle) => {
        const existing = acc.find(s => s.status === cycle.status);
        if (existing) existing.count++;
        else acc.push({ status: cycle.status, count: 1 });
        return acc;
      }, []);

      return { success: true, activeFarmsCount, activeCyclesCount: activeCycles.length, totalYieldTons, avgYieldPerHa, costPerKg, avgPricePerKg: +avgPricePerKg.toFixed(0), totalRevenue, roiPercentage, unassignedUMs, cycleStatusBreakdown };
    } catch (error) {
      console.error('KPI Error:', error);
      return { success: false, error: error.message };
    }
  }

  static async getYieldTrend({ farm_id, year, start_date, end_date } = {}) {
    try {
      const targetYear = parseInt(year) || new Date().getFullYear();
      const match = { sale_date: { $gte: new Date(`${targetYear}-01-01`), $lt: new Date(`${targetYear + 1}-01-01`) } };
      if (start_date) match.sale_date.$gte = new Date(start_date);
      if (end_date) match.sale_date.$lte = new Date(end_date);
      if (farm_id) match.farm_id = new mongoose.Types.ObjectId(farm_id);

      const trend = await Sale.aggregate([
        { $match: match },
        { $group: { _id: { month: { $month: '$sale_date' }, buyer_type: '$buyer_type' }, totalKg: { $sum: '$quantity_kg' } } },
        { $sort: { '_id.month': 1 } }
      ]);

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return months.map((m, idx) => {
        const monthNum = idx + 1;
        const monthData = trend.filter(t => t._id.month === monthNum);
        return { month: m, companies: monthData.find(d => d._id.buyer_type === 'Mill')?.totalKg || 0, groups: monthData.find(d => d._id.buyer_type === 'Middleman')?.totalKg || 0, independent: monthData.find(d => d._id.buyer_type === 'Direct')?.totalKg || 0 };
      });
    } catch (error) {
      console.error('Yield Trend Error:', error);
      return [];
    }
  }

  static async getUMPerformance() {
    try {
      const ums = await UM.find().populate('user_id', 'name email').sort({ 'performance_metrics.overall_score': -1 }).limit(10);
      return ums;
    } catch (error) {
      console.error('UM Performance Error:', error);
      return [];
    }
  }

  static async generateAlerts({ farm_id } = {}) {
    const alerts = [];
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const filter = { status: 'Harvesting', harvest_closing_date: { $gte: now, $lte: sevenDaysFromNow } };
    if (farm_id) filter.farm_id = farm_id;

    const closingHarvests = await CropCycle.find(filter).populate('farm_id', 'name');
    closingHarvests.forEach(cycle => {
      const daysLeft = Math.ceil((new Date(cycle.harvest_closing_date) - now) / (1000 * 60 * 60 * 24));
      alerts.push({ type: 'Warning', message: `Masa panen ${cycle.farm_id?.name || 'Lahan'} akan berakhir dalam ${daysLeft} hari`, dueDate: cycle.harvest_closing_date, farmId: cycle.farm_id?._id });
    });
    return alerts;
  }
}

module.exports = KPIService;