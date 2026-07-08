const mongoose = require('mongoose');
const FarmMaster = require('../models/FarmMaster');
const Block = require('../models/Block');
const CropType = require('../models/CropType');
const ActivityType = require('../models/ActivityType');
const { required, isNumber, minValue, isObjectId, validate, errorResponse } = require('../utils/validate');

const getModel = (type) => {
  switch (type) {
    case 'farms': return FarmMaster;
    case 'blocks': return Block;
    case 'crop-types': return CropType;
    case 'activity-types': return ActivityType;
    default: return null;
  }
};

const farmValidation = (data) => validate(data, {
  name: [[required, 'Nama Farm']],
  code: [[required, 'Kode Farm']],
  total_area_ha: [[isNumber, 'Luas Area'], [minValue, 0, 'Luas Area']]
});

const blockValidation = (data) => validate(data, {
  name: [[required, 'Nama Block']],
  code: [[required, 'Kode Block']],
  farm: [[required, 'Farm'], [isObjectId, 'Farm']],
  area_ha: [[required, 'Luas Area'], [isNumber, 'Luas Area'], [minValue, 0, 'Luas Area']]
});

const cropTypeValidation = (data) => validate(data, {
  name: [[required, 'Nama Tanaman']],
  code: [[required, 'Kode Tanaman']]
});

const activityTypeValidation = (data) => validate(data, {
  name: [[required, 'Nama Aktivitas']],
  code: [[required, 'Kode Aktivitas']]
});

const getValidation = (type) => {
  switch (type) {
    case 'farms': return farmValidation;
    case 'blocks': return blockValidation;
    case 'crop-types': return cropTypeValidation;
    case 'activity-types': return activityTypeValidation;
    default: return null;
  }
};

const list = (type) => async (req, res) => {
  try {
    const Model = getModel(type);
    if (!Model) return res.status(400).json({ success: false, message: 'Invalid type' });

    const { page = 1, limit = 20, search, status, farm } = req.query;
    const query = {};

    if (status) query.status = status;
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      if (type === 'farms') query.$or = [{ name: searchRegex }, { code: searchRegex }];
      else if (type === 'blocks') query.$or = [{ name: searchRegex }, { code: searchRegex }];
      else query.name = searchRegex;
    }
    if (farm && type === 'blocks') query.farm = farm;

    // Farmer owner scoping for farms
    if (type === 'farms' && req.user && req.user.role === 'farmer_owner') {
      const User = require('../models/User');
      const user = await User.findById(req.user.id);
      if (user && user.assigned_farms && user.assigned_farms.length > 0) {
        query._id = { $in: user.assigned_farms };
      } else {
        return res.json({ success: true, data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } });
      }
    }

    const total = await Model.countDocuments(query);
    const data = await Model.find(query)
      .populate(type === 'blocks' ? 'farm' : '')
      .sort({ createdAt: -1 })
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean();

    res.json({ success: true, data, meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getById = (type) => async (req, res) => {
  try {
    const Model = getModel(type);
    if (!Model) return res.status(400).json({ success: false, message: 'Invalid type' });

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'ID tidak valid' });
    }

    const data = await Model.findById(req.params.id).populate(type === 'blocks' ? 'farm' : '').lean();
    if (!data) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });

    // Farmer owner scoping for farms
    if (type === 'farms' && req.user && req.user.role === 'farmer_owner') {
      const User = require('../models/User');
      const user = await User.findById(req.user.id);
      if (!user || !user.assigned_farms || !user.assigned_farms.some(f => f.toString() === data._id.toString())) {
        return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke farm ini' });
      }
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const create = (type) => async (req, res) => {
  try {
    // Farmer owner cannot create farms
    if (type === 'farms' && req.user && req.user.role === 'farmer_owner') {
      return res.status(403).json({ success: false, message: 'Pemilik Petani tidak dapat membuat farm baru' });
    }

    const validation = getValidation(type);
    if (validation) {
      const errors = validation(req.body);
      if (errors) return errorResponse(res, errors);
    }

    const Model = getModel(type);
    const payload = { ...req.body };
    if (req.user) payload.createdBy = req.user.id;

    const data = await Model.create(payload);
    res.status(201).json({ success: true, data });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'Data dengan kode tersebut sudah ada' });
    res.status(500).json({ success: false, message: error.message });
  }
};

const update = (type) => async (req, res) => {
  try {
    const Model = getModel(type);
    if (!Model) return res.status(400).json({ success: false, message: 'Invalid type' });

    // Farmer owner can only update assigned farms
    if (type === 'farms' && req.user && req.user.role === 'farmer_owner') {
      const User = require('../models/User');
      const user = await User.findById(req.user.id);
      if (!user || !user.assigned_farms || !user.assigned_farms.some(f => f.toString() === req.params.id)) {
        return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke farm ini' });
      }
    }

    const validation = getValidation(type);
    if (validation) {
      const errors = validation(req.body);
      if (errors) return errorResponse(res, errors);
    }

    const data = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });

    res.json({ success: true, data });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'Data dengan kode tersebut sudah ada' });
    res.status(500).json({ success: false, message: error.message });
  }
};

const remove = (type) => async (req, res) => {
  try {
    const Model = getModel(type);
    if (!Model) return res.status(400).json({ success: false, message: 'Invalid type' });

    // Farmer owner cannot delete farms
    if (type === 'farms' && req.user && req.user.role === 'farmer_owner') {
      return res.status(403).json({ success: false, message: 'Pemilik Petani tidak dapat menghapus farm' });
    }

    const data = await Model.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });

    res.json({ success: true, message: 'Data berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAll = (type) => async (req, res) => {
  try {
    const Model = getModel(type);
    if (!Model) return res.status(400).json({ success: false, message: 'Invalid type' });

    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.farm && type === 'blocks') query.farm = req.query.farm;

    // Farmer owner scoping for farms
    if (type === 'farms' && req.user && req.user.role === 'farmer_owner') {
      const User = require('../models/User');
      const user = await User.findById(req.user.id);
      if (user && user.assigned_farms && user.assigned_farms.length > 0) {
        query._id = { $in: user.assigned_farms };
      } else {
        return res.json({ success: true, data: [] });
      }
    }

    const data = await Model.find(query).populate(type === 'blocks' ? 'farm' : '').sort({ name: 1 }).lean();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listFarms: list('farms'),
  getFarm: getById('farms'),
  createFarm: create('farms'),
  updateFarm: update('farms'),
  deleteFarm: remove('farms'),
  getAllFarms: getAll('farms'),

  listBlocks: list('blocks'),
  getBlock: getById('blocks'),
  createBlock: create('blocks'),
  updateBlock: update('blocks'),
  deleteBlock: remove('blocks'),
  getAllBlocks: getAll('blocks'),

  listCropTypes: list('crop-types'),
  getCropType: getById('crop-types'),
  createCropType: create('crop-types'),
  updateCropType: update('crop-types'),
  deleteCropType: remove('crop-types'),
  getAllCropTypes: getAll('crop-types'),

  listActivityTypes: list('activity-types'),
  getActivityType: getById('activity-types'),
  createActivityType: create('activity-types'),
  updateActivityType: update('activity-types'),
  deleteActivityType: remove('activity-types'),
  getAllActivityTypes: getAll('activity-types')
};
