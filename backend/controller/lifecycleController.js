const CropCycle = require('../model/CropCycle');
const LandRecord = require('../model/LandRecord');
const HarvestPeriod = require('../model/HarvestPeriod');
const Activity = require('../model/Activity');
const FarmerAssignment = require('../model/FarmerAssignment');
const User = require('../model/User');
require('../model/Farm');
require('../model/Block');
const { required, isObjectId, validate, errorResponse } = require('../util/validate');

const buildFarmFilter = async (user) => {
  if (user.role === 'superadmin' || user.role === 'government') return {};
  if (user.role === 'farmer_owner') {
    const u = await User.findById(user.id);
    if (!u || !u.assigned_farms || !u.assigned_farms.length) return { _id: null };
    return { farm_master: { $in: u.assigned_farms } };
  }
  if (user.role === 'farmer') {
    const asgns = await FarmerAssignment.find({ farmer: user.id }).lean();
    const blockIds = [...new Set(asgns.map((a) => a.block?.toString()).filter(Boolean))];
    const farmMasterIds = [...new Set(asgns.map((a) => a.farm?.toString()).filter(Boolean))];
    if (!blockIds.length && !farmMasterIds.length) return { _id: null };
    return { $or: [{ block: { $in: blockIds } }, { farm_master: { $in: farmMasterIds } }] };
  }
  return {};
};

const buildFarmFilterSimple = async (user) => {
  if (user.role === 'superadmin' || user.role === 'government') return {};
  if (user.role === 'farmer_owner') {
    const u = await User.findById(user.id);
    if (!u || !u.assigned_farms || !u.assigned_farms.length) return { _id: null };
    const blocks = await require('../model/Block')
      .find({ farm: { $in: u.assigned_farms } })
      .distinct('_id');
    return { $or: [{ farm_master: { $in: u.assigned_farms } }, { block: { $in: blocks } }] };
  }
  if (user.role === 'farmer') {
    const asgns = await FarmerAssignment.find({ farmer: user.id }).lean();
    const blockIds = [...new Set(asgns.map((a) => a.block?.toString()).filter(Boolean))];
    if (!blockIds.length) return { _id: null };
    return { block: { $in: blockIds } };
  }
  return {};
};

const farmFilterWithMaster = async (user) => {
  if (user.role === 'superadmin' || user.role === 'government') return {};
  if (user.role === 'farmer_owner') {
    const u = await User.findById(user.id);
    if (!u || !u.assigned_farms || !u.assigned_farms.length) return { _id: null };
    const blocks = await require('../model/Block')
      .find({ farm: { $in: u.assigned_farms } })
      .distinct('_id');
    return { $or: [{ farm_master: { $in: u.assigned_farms } }, { block: { $in: blocks } }] };
  }
  if (user.role === 'farmer') {
    const asgns = await FarmerAssignment.find({ farmer: user.id }).lean();
    const blockIds = [...new Set(asgns.map((a) => a.block?.toString()).filter(Boolean))];
    if (!blockIds.length) return { _id: null };
    return { block: { $in: blockIds } };
  }
  return {};
};

const listLand = async (req, res) => {
  try {
    const filter = await farmFilterWithMaster(req.user);
    const data = await LandRecord.find(filter).populate('farm_id farm_master block').sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createLand = async (req, res) => {
  try {
    const errs = validate(req.body, {
      farm_id: [
        [required, 'Farm'],
        [isObjectId, 'Farm'],
      ],
      land_opening_date: [[required, 'Tanggal Buka Lahan']],
    });
    if (errs) return errorResponse(res, errs);
    const record = new LandRecord({ ...req.body, createdBy: req.user.id });
    await record.save();
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateLand = async (req, res) => {
  try {
    const record = await LandRecord.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!record) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteLand = async (req, res) => {
  try {
    const record = await LandRecord.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const listPlantings = async (req, res) => {
  try {
    const filter = await buildFarmFilter(req.user);
    const statusFilter = {
      status: {
        $in: ['Planned', 'In_Progress', 'Completed', 'Cancelled', 'Land_Preparation', 'Planted', 'Maintenance'],
      },
    };
    const data = await CropCycle.find({ ...filter, ...statusFilter })
      .populate('farm_id farm_master block crop_type_ref')
      .sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createPlanting = async (req, res) => {
  try {
    const errs = validate(req.body, {
      farm_id: [
        [required, 'Farm'],
        [isObjectId, 'Farm'],
      ],
      crop_type: [[required, 'Jenis Tanaman']],
    });
    if (errs) return errorResponse(res, errs);
    const record = new CropCycle({ ...req.body, createdBy: req.user.id });
    await record.save();
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updatePlanting = async (req, res) => {
  try {
    const record = await CropCycle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!record) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deletePlanting = async (req, res) => {
  try {
    const record = await CropCycle.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const listActivities = async (req, res) => {
  try {
    const filter = await buildFarmFilterSimple(req.user);
    const data = await Activity.find(filter)
      .populate('farm_id farm_master block crop_cycle_id activity_type_ref')
      .sort({ date: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createActivity = async (req, res) => {
  try {
    const errs = validate(req.body, {
      farm_id: [
        [required, 'Farm'],
        [isObjectId, 'Farm'],
      ],
      date: [[required, 'Tanggal']],
    });
    if (errs) return errorResponse(res, errs);
    const record = new Activity({ ...req.body, createdBy: req.user.id });
    await record.save();
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateActivity = async (req, res) => {
  try {
    const record = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!record) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteActivity = async (req, res) => {
  try {
    const record = await Activity.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const listHarvests = async (req, res) => {
  try {
    const filter = await farmFilterWithMaster(req.user);
    const data = await HarvestPeriod.find(filter)
      .populate('farm_id farm_master block crop_cycle_id')
      .sort({ harvest_opening_date: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createHarvest = async (req, res) => {
  try {
    const errs = validate(req.body, {
      farm_id: [
        [required, 'Farm'],
        [isObjectId, 'Farm'],
      ],
      harvest_opening_date: [[required, 'Tanggal Buka Panen']],
    });
    if (errs) return errorResponse(res, errs);
    const record = new HarvestPeriod({ ...req.body, createdBy: req.user.id });
    await record.save();
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateHarvest = async (req, res) => {
  try {
    const record = await HarvestPeriod.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!record) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteHarvest = async (req, res) => {
  try {
    const record = await HarvestPeriod.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  listLand,
  createLand,
  updateLand,
  deleteLand,
  listPlantings,
  createPlanting,
  updatePlanting,
  deletePlanting,
  listActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  listHarvests,
  createHarvest,
  updateHarvest,
  deleteHarvest,
};
