const FarmerAssignment = require('../models/FarmerAssignment');
const TaskAssignment = require('../models/TaskAssignment');
const User = require('../models/User');

const listFarmerAssignments = async (req, res) => {
  try {
    const { farmer, farm, block, page = 1, limit = 20 } = req.query;
    const query = {};
    if (farmer) query.farmer = farmer;
    if (farm) query.farm = farm;
    if (block) query.block = block;
    if (req.user.role === 'farmer_owner') {
      const owned = await FarmerAssignment.find({ farmer: req.user.id }).distinct('farm');
      query.farm = { $in: owned };
    }
    if (req.user.role === 'farmer') query.farmer = req.user.id;

    const total = await FarmerAssignment.countDocuments(query);
    const data = await FarmerAssignment.find(query)
      .populate('farmer', 'name email')
      .populate('block', 'name code')
      .populate('farm', 'name code')
      .sort({ createdAt: -1 })
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean();

    // Translate access_stages for frontend display
    const stageLabels = { Land_Preparation: 'Persiapan Lahan', Planting: 'Penanaman', Maintenance: 'Perawatan', Harvesting: 'Panen' };
    data.forEach(d => {
      d.access_stages_labels = (d.access_stages || []).map(s => stageLabels[s] || s);
    });

    res.json({ success: true, data, meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createFarmerAssignment = async (req, res) => {
  try {
    let { farmer, block, blocks, farm, access_stages } = req.body;

    // Accept single block or array of blocks
    if (block && !blocks) {
      blocks = [block];
    }

    // Auto-detect farm from block if not provided
    if (!farm && blocks?.length) {
      const BlockModel = require('../models/Block');
      const firstBlock = await BlockModel.findById(blocks[0]).populate('farm').lean();
      if (firstBlock?.farm) {
        farm = typeof firstBlock.farm === 'object' ? firstBlock.farm._id : firstBlock.farm;
      }
    }

    if (!farmer || !blocks || !blocks.length) {
      return res.status(400).json({ success: false, message: 'Farmer dan block wajib diisi' });
    }

    const validatedStages = Array.isArray(access_stages) ? access_stages.filter(s =>
      ['Land_Preparation', 'Planting', 'Maintenance', 'Harvesting'].includes(s)
    ) : [];

    const assignments = blocks.map(b => ({
      farmer,
      block: b,
      farm,
      access_stages: validatedStages,
      assigned_by: req.user.id
    }));

    for (const a of assignments) {
      const existing = await FarmerAssignment.findOne({ farmer: a.farmer, block: a.block });
      if (existing) {
        await FarmerAssignment.findByIdAndUpdate(existing._id, { access_stages: a.access_stages, status: 'Active' });
        continue;
      }
      await FarmerAssignment.create(a);
    }

    const data = await FarmerAssignment.find({ farmer }).populate('block', 'name code').populate('farm', 'name code').lean();
    res.status(201).json({ success: true, data });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'Assignment sudah ada' });
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateFarmerAssignment = async (req, res) => {
  try {
    const { access_stages, status } = req.body;
    const update = {};
    if (access_stages !== undefined) {
      update.access_stages = Array.isArray(access_stages) ? access_stages.filter(s =>
        ['Land_Preparation', 'Planting', 'Maintenance', 'Harvesting'].includes(s)
      ) : [];
    }
    if (status !== undefined) update.status = status;

    const data = await FarmerAssignment.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('farmer', 'name email')
      .populate('block', 'name code')
      .populate('farm', 'name code')
      .lean();

    if (!data) return res.status(404).json({ success: false, message: 'Assignment tidak ditemukan' });

    const stageLabels = { Land_Preparation: 'Persiapan Lahan', Planting: 'Penanaman', Maintenance: 'Perawatan', Harvesting: 'Panen' };
    data.access_stages_labels = (data.access_stages || []).map(s => stageLabels[s] || s);

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeFarmerAssignment = async (req, res) => {
  try {
    const data = await FarmerAssignment.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Assignment tidak ditemukan' });
    res.json({ success: true, message: 'Assignment dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const listTaskAssignments = async (req, res) => {
  try {
    const { farmer, crop_cycle } = req.query;
    const query = {};
    if (farmer) query.farmer = farmer;
    if (crop_cycle) query.crop_cycle = crop_cycle;
    if (req.user.role === 'farmer') query.farmer = req.user.id;

    const data = await TaskAssignment.find(query)
      .populate('farmer', 'name email')
      .populate('crop_cycle', 'cycle crop_type')
      .populate('farm', 'name code')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createTaskAssignment = async (req, res) => {
  try {
    const { farmer, crop_cycle, farm, stages } = req.body;
    if (!farmer || !crop_cycle || !farm || !stages || !stages.length) {
      return res.status(400).json({ success: false, message: 'Farmer, crop_cycle, farm, dan stages wajib diisi' });
    }

    const data = await TaskAssignment.findOneAndUpdate(
      { farmer, crop_cycle },
      { farmer, crop_cycle, farm, stages, assigned_by: req.user.id, status: 'Active' },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeTaskAssignment = async (req, res) => {
  try {
    const data = await TaskAssignment.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Task assignment tidak ditemukan' });
    res.json({ success: true, message: 'Task assignment dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listFarmerAssignments,
  createFarmerAssignment,
  updateFarmerAssignment,
  removeFarmerAssignment,
  listTaskAssignments,
  createTaskAssignment,
  removeTaskAssignment
};
