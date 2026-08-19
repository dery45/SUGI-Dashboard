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

// Per-stage eligibility: a CropCycle must be in one of the allowed statuses
// before the corresponding lifecycle stage can be recorded. Stages advance the
// cycle status; Completed/Failed cycles are never eligible again.
const STAGE_REQ = {
  planting: {
    requireStatus: ['Planned', 'Land_Preparation'],
    advanceTo: 'Planted',
    label: 'Penanaman',
  },
  maintenance: {
    requireStatus: ['Planted', 'Maintenance'],
    advanceTo: 'Maintenance',
    label: 'Perawatan',
  },
  harvest: {
    requireStatus: ['Planted', 'Maintenance', 'Harvesting'],
    advanceTo: 'Harvesting',
    label: 'Panen',
  },
};

const eligibilityError = (cycle, stageKey) => {
  const req = STAGE_REQ[stageKey];
  if (!req) return null;
  if (!req.requireStatus.includes(cycle.status)) {
    return `${req.label} tidak dapat dilakukan pada siklus dengan status "${String(cycle.status || '').replace(/_/g, ' ')}"`;
  }
  return null;
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
    const data = await LandRecord.find(filter)
      .populate('farm_id farm_master block crop_cycle_id')
      .sort({ createdAt: -1 });
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
    // Single entry point: every Siklus Tanam (CropCycle) is created here,
    // during the Persiapan Lahan (LandRecord) flow. Penanaman, Perawatan and
    // Panen handlers only reference an existing cycle via crop_cycle_id.
    const cycle = new CropCycle({
      farm_id: req.body.farm_id,
      farm_master: req.body.farm_master || req.body.farm_id,
      block: req.body.block,
      cycle: req.body.cycle,
      crop_type: req.body.crop_type,
      status: 'Land_Preparation',
      land_opening_date: req.body.land_opening_date,
      createdBy: req.user.id,
    });
    await cycle.save();
    const record = new LandRecord({ ...req.body, crop_cycle_id: cycle._id, createdBy: req.user.id });
    await record.save();
    res.status(201).json({ success: true, data: record, crop_cycle: cycle });
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
        $in: ['Planned', 'In_Progress', 'Completed', 'Cancelled', 'Land_Preparation', 'Planted', 'Maintenance', 'Harvesting'],
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

// GET /lifecycle/cycles/eligible?stage=planting|maintenance|harvest
// Returns only CropCycles whose status makes them eligible for the requested
// stage — used to power dropdown selects in Penanaman/Perawatan/Panen forms.
const listEligibleCycles = async (req, res) => {
  try {
    const reqMap = { planting: 'planting', maintenance: 'maintenance', harvest: 'harvest' };
    const key = reqMap[req.query.stage];
    if (!key) return errorResponse(res, { stage: 'Parameter stage harus planting, maintenance, atau harvest' }, 400);
    const filter = await buildFarmFilter(req.user);
    const data = await CropCycle.find({
      ...filter,
      status: { $in: STAGE_REQ[key].requireStatus },
    })
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
      crop_cycle_id: [
        [required, 'Siklus Tanam'],
        [isObjectId, 'Siklus Tanam'],
      ],
    });
    if (errs) return errorResponse(res, errs);
    const cycle = await CropCycle.findById(req.body.crop_cycle_id);
    if (!cycle) return res.status(404).json({ success: false, message: 'Siklus tanam tidak ditemukan' });
    const gateErr = eligibilityError(cycle, 'planting');
    if (gateErr) return errorResponse(res, { stage: gateErr }, 400);
    // Penanaman does not create the cycle — it records planting data onto the
    // existing cycle that was created during Persiapan Lahan.
    cycle.crop_type = req.body.crop_type ?? cycle.crop_type;
    cycle.crop_type_ref = req.body.crop_type_ref ?? cycle.crop_type_ref;
    cycle.variety = req.body.variety ?? cycle.variety;
    cycle.planting_density = req.body.planting_density ?? cycle.planting_density;
    cycle.area_ha = req.body.area_ha ?? cycle.area_ha;
    cycle.seedling_count = req.body.seedling_count ?? cycle.seedling_count;
    cycle.planting_date = req.body.planting_date ?? cycle.planting_date;
    cycle.executor = req.body.executor ?? cycle.executor;
    cycle.notes = req.body.notes ?? cycle.notes;
    // Status is advanced by the stage, never regressed by a caller-supplied value.
    cycle.status = STAGE_REQ.planting.advanceTo;
    if (req.body.farm_master) cycle.farm_master = req.body.farm_master;
    if (req.body.block) cycle.block = req.body.block;
    await cycle.save();
    res.status(201).json({ success: true, data: cycle });
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
      crop_cycle_id: [
        [required, 'Siklus Tanam'],
        [isObjectId, 'Siklus Tanam'],
      ],
      date: [[required, 'Tanggal']],
    });
    if (errs) return errorResponse(res, errs);
    const cycle = await CropCycle.findById(req.body.crop_cycle_id);
    if (!cycle) return res.status(404).json({ success: false, message: 'Siklus tanam tidak ditemukan' });
    const gateErr = eligibilityError(cycle, 'maintenance');
    if (gateErr) return errorResponse(res, { stage: gateErr }, 400);
    const record = new Activity({
      ...req.body,
      crop_cycle_id: cycle._id,
      farm_id: req.body.farm_id || cycle.farm_id,
      farm_master: req.body.farm_master || cycle.farm_master || cycle.farm_id,
      block: req.body.block || cycle.block,
      cycle: req.body.cycle || cycle.cycle,
      labor_hours: req.body.labor_hours ?? 0,
      cost: req.body.cost ?? 0,
      createdBy: req.user.id,
    });
    await record.save();
    cycle.status = STAGE_REQ.maintenance.advanceTo;
    await cycle.save();
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
      crop_cycle_id: [
        [required, 'Siklus Tanam'],
        [isObjectId, 'Siklus Tanam'],
      ],
      harvest_opening_date: [[required, 'Tanggal Buka Panen']],
    });
    if (errs) return errorResponse(res, errs);
    const cycle = await CropCycle.findById(req.body.crop_cycle_id);
    if (!cycle) return res.status(404).json({ success: false, message: 'Siklus tanam tidak ditemukan' });
    const gateErr = eligibilityError(cycle, 'harvest');
    if (gateErr) return errorResponse(res, { stage: gateErr }, 400);
    const record = new HarvestPeriod({
      ...req.body,
      crop_cycle_id: cycle._id,
      farm_id: req.body.farm_id || cycle.farm_id,
      farm_master: req.body.farm_master || cycle.farm_master || cycle.farm_id,
      block: req.body.block || cycle.block,
      cycle: req.body.cycle || cycle.cycle,
      createdBy: req.user.id,
    });
    await record.save();
    cycle.status = STAGE_REQ.harvest.advanceTo;
    await cycle.save();
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateHarvest = async (req, res) => {
  try {
    const record = await HarvestPeriod.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!record) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    // Closing/completing the harvest finalizes the cycle.
    if (record.status === 'Closed' || record.status === 'Completed') {
      await CropCycle.findByIdAndUpdate(record.crop_cycle_id, { status: 'Completed' });
    }
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
  listEligibleCycles,
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
