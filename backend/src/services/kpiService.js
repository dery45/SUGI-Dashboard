const Farm = require('../models/Farm');
const CropCycle = require('../models/CropCycle');
const UM = require('../models/UM');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const mongoose = require('mongoose');

class KPIService {
  /**
   * Calculate High-Level KPIs for an organization using aggregation pipelines
   */
  static async calculateOrganizationOverview(organizationId) {
    try {
      const orgId = new mongoose.Types.ObjectId(organizationId);

      // Run all aggregations in parallel for performance
      const [
        activeFarmsCount,
        activeCycles,
        unassignedUMs,
        salesAgg,
        expenseAgg,
        alerts
      ] = await Promise.all([
        Farm.countDocuments({ organization_id: orgId, status: 'Active' }),

        CropCycle.find({
          organization_id: orgId,
          status: { $in: ['Planned', 'Land_Preparation', 'Planted', 'Maintenance', 'Harvesting'] }
        }),

        UM.countDocuments({
          organization_id: orgId,
          $or: [{ assigned_farms: { $size: 0 } }, { assigned_processes: { $size: 0 } }]
        }),

        // Sales aggregation: total yield, revenue, avg price
        Sale.aggregate([
          { $match: { organization_id: orgId } },
          {
            $group: {
              _id: null,
              totalYieldKg: { $sum: '$quantity_kg' },
              totalRevenue: { $sum: '$total_revenue' },
              avgPricePerKg: { $avg: '$price_per_kg' },
            }
          }
        ]),

        // Expense aggregation: total cost
        Expense.aggregate([
          { $match: { organization_id: orgId } },
          { $group: { _id: null, totalCost: { $sum: '$amount_idr' } } }
        ]),

        this.generateAlerts(orgId),
      ]);

      const totalYieldKg = salesAgg[0]?.totalYieldKg || 0;
      const totalRevenue = salesAgg[0]?.totalRevenue || 0;
      const totalCost = expenseAgg[0]?.totalCost || 0;
      const avgPricePerKg = salesAgg[0]?.avgPricePerKg || 0;

      // Compute derived KPIs
      const totalYieldTons = +(totalYieldKg / 1000).toFixed(2);
      const costPerKg = totalYieldKg > 0 ? +(totalCost / totalYieldKg).toFixed(0) : 0;
      const roiPercentage = totalCost > 0 ? +(((totalRevenue - totalCost) / totalCost) * 100).toFixed(1) : 0;

      // Farm area for yield/ha
      const farmAreaAgg = await Farm.aggregate([
        { $match: { organization_id: orgId, status: 'Active' } },
        { $group: { _id: null, totalHa: { $sum: '$area_hectares' } } }
      ]);
      const totalHa = farmAreaAgg[0]?.totalHa || 1;
      const avgYieldPerHa = +(totalYieldTons / totalHa).toFixed(2);

      // Cycle status breakdown
      const cycleStatusBreakdown = activeCycles.reduce((acc, cycle) => {
        const existing = acc.find(s => s.status === cycle.status);
        if (existing) existing.count++;
        else acc.push({ status: cycle.status, count: 1 });
        return acc;
      }, []);

      return {
        activeFarmsCount,
        activeCyclesCount: activeCycles.length,
        totalYieldTons,
        avgYieldPerHa,
        costPerKg,
        avgPricePerKg: +avgPricePerKg.toFixed(0),
        totalRevenue,
        roiPercentage,
        unassignedUMs,
        cycleStatusBreakdown,
        alerts,
        success: true
      };
    } catch (error) {
      console.error('KPI Calculation Error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Month-by-month yield trend grouped by buyer_type (Company/Group/Independent)
   */
  static async getYieldTrend(organizationId, year) {
    try {
      const orgId = new mongoose.Types.ObjectId(organizationId);
      const targetYear = parseInt(year) || new Date().getFullYear();

      const trend = await Sale.aggregate([
        {
          $match: {
            organization_id: orgId,
            sale_date: {
              $gte: new Date(`${targetYear}-01-01`),
              $lt: new Date(`${targetYear + 1}-01-01`)
            }
          }
        },
        {
          $group: {
            _id: {
              month: { $month: '$sale_date' },
              buyer_type: '$buyer_type',
            },
            totalKg: { $sum: '$quantity_kg' }
          }
        },
        { $sort: { '_id.month': 1 } }
      ]);

      // Reshape into chart-friendly format: [{month, companies, groups, independent}]
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const result = months.map((m, idx) => {
        const monthNum = idx + 1;
        const monthData = trend.filter(t => t._id.month === monthNum);
        return {
          month: m,
          companies: monthData.find(d => d._id.buyer_type === 'Mill')?.totalKg || 0,
          groups: monthData.find(d => d._id.buyer_type === 'Middleman')?.totalKg || 0,
          independent: monthData.find(d => d._id.buyer_type === 'Direct')?.totalKg || 0,
        };
      });

      return result;
    } catch (error) {
      console.error('Yield Trend Error:', error);
      return [];
    }
  }

  /**
   * UM Leaderboard by performance score
   */
  static async getUMPerformance(organizationId) {
    try {
      const orgId = new mongoose.Types.ObjectId(organizationId);
      const ums = await UM.find({ organization_id: orgId })
        .populate('user_id', 'name email')
        .sort({ 'performance_metrics.overall_score': -1 })
        .limit(10);
      return ums;
    } catch (error) {
      console.error('UM Performance Error:', error);
      return [];
    }
  }

  /**
   * Generate Alerts (harvest windows closing, unassigned UMs)
   */
  static async generateAlerts(orgId) {
    const alerts = [];
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const closingHarvests = await CropCycle.find({
      organization_id: orgId,
      status: 'Harvesting',
      harvest_closing_date: { $gte: now, $lte: sevenDaysFromNow }
    }).populate('farm_id', 'name');

    closingHarvests.forEach(cycle => {
      const daysLeft = Math.ceil((new Date(cycle.harvest_closing_date) - now) / (1000 * 60 * 60 * 24));
      alerts.push({
        type: 'Warning',
        message: `Masa panen ${cycle.farm_id?.name || 'Lahan'} akan berakhir dalam ${daysLeft} hari`,
        dueDate: cycle.harvest_closing_date,
        farmId: cycle.farm_id?._id
      });
    });

    return alerts;
  }
}

module.exports = KPIService;
