const mongoose = require('mongoose');
const FarmMaster = require('../model/FarmMaster');
const Block = require('../model/Block');
const CropType = require('../model/CropType');
const ActivityType = require('../model/ActivityType');
const Unit = require('../model/Unit');
const Fertilizer = require('../model/Fertilizer');
const Nutrient = require('../model/Nutrient');
const Medicine = require('../model/Medicine');
const AgriculturalInput = require('../model/AgriculturalInput');
const { required, isNumber, minValue, isObjectId, validate, errorResponse } = require('../util/validate');

const getModel = (type) => {
  switch (type) {
    case 'farms':
      return FarmMaster;
    case 'blocks':
      return Block;
    case 'crop-types':
      return CropType;
    case 'activity-types':
      return ActivityType;
    case 'units':
      return Unit;
    case 'fertilizers':
      return Fertilizer;
    case 'nutrients':
      return Nutrient;
    case 'medicines':
      return Medicine;
    case 'agricultural-inputs':
      return AgriculturalInput;
    default:
      return null;
  }
};

const farmValidation = (data) =>
  validate(data, {
    name: [[required, 'Nama Farm']],
    total_area_ha: [
      [isNumber, 'Luas Area'],
      [minValue, 0, 'Luas Area'],
    ],
  });

const blockValidation = (data) =>
  validate(data, {
    name: [[required, 'Nama Block']],
    farm: [
      [required, 'Farm'],
      [isObjectId, 'Farm'],
    ],
    area_ha: [
      [required, 'Luas Area'],
      [isNumber, 'Luas Area'],
      [minValue, 0, 'Luas Area'],
    ],
  });

const cropTypeValidation = (data) =>
  validate(data, {
    name: [[required, 'Nama Tanaman']],
  });

const activityTypeValidation = (data) =>
  validate(data, {
    name: [[required, 'Nama Aktivitas']],
  });

const unitValidation = (data) =>
  validate(data, {
    name: [[required, 'Nama Satuan']],
    symbol: [[required, 'Simbol']],
  });

const inputValidation = (data, label) =>
  validate(data, {
    name: [[required, label]],
    unit: [
      [required, 'Satuan'],
      [isObjectId, 'Satuan'],
    ],
  });

const agriculturalInputValidation = (data) =>
  validate(data, {
    name: [[required, 'Nama Input']],
    type: [[required, 'Tipe Input']],
    unit: [
      [required, 'Satuan'],
      [isObjectId, 'Satuan'],
    ],
  });

const getValidation = (type) => {
  switch (type) {
    case 'farms':
      return farmValidation;
    case 'blocks':
      return blockValidation;
    case 'crop-types':
      return cropTypeValidation;
    case 'activity-types':
      return activityTypeValidation;
    case 'units':
      return unitValidation;
    case 'fertilizers':
      return (d) => inputValidation(d, 'Nama Pupuk');
    case 'nutrients':
      return (d) => inputValidation(d, 'Nama Nutrisi');
    case 'medicines':
      return (d) => inputValidation(d, 'Nama Obat');
    case 'agricultural-inputs':
      return agriculturalInputValidation;
    default:
      return null;
  }
};

const list = (type) => async (req, res) => {
  try {
    const Model = getModel(type);
    if (!Model) return res.status(400).json({ success: false, message: 'Invalid type' });

    const { page = 1, limit = 20, search, status, farm, type: filterType } = req.query;
    const query = {};

    if (status) query.status = status;
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.name = searchRegex;
    }
    if (farm && type === 'blocks') query.farm = farm;
    if (filterType && type === 'agricultural-inputs') query.type = filterType;

    // Farmer owner scoping for farms
    if (type === 'farms' && req.user && req.user.role === 'farmer_owner') {
      const User = require('../model/User');
      const user = await User.findById(req.user.id);
      if (user && user.assigned_farms && user.assigned_farms.length > 0) {
        query._id = { $in: user.assigned_farms };
      } else {
        return res.json({ success: true, data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } });
      }
    }

    const populateMap = {
      blocks: 'farm',
      fertilizers: 'unit',
      nutrients: 'unit',
      medicines: 'unit',
      'agricultural-inputs': 'unit',
    };
    const total = await Model.countDocuments(query);
    const data = await Model.find(query)
      .populate(populateMap[type] || '')
      .sort({ createdAt: -1 })
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data,
      meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
    });
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

    const populateMap2 = { blocks: 'farm', fertilizers: 'unit', nutrients: 'unit', medicines: 'unit', 'agricultural-inputs': 'unit' };
    const data = await Model.findById(req.params.id)
      .populate(populateMap2[type] || '')
      .lean();
    if (!data) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });

    // Farmer owner scoping for farms
    if (type === 'farms' && req.user && req.user.role === 'farmer_owner') {
      const User = require('../model/User');
      const user = await User.findById(req.user.id);
      if (!user || !user.assigned_farms || !user.assigned_farms.some((f) => f.toString() === data._id.toString())) {
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
      return res.status(403).json({ success: false, message: 'Owner tidak dapat membuat farm baru' });
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
    if (error.code === 11000)
      return res.status(400).json({ success: false, message: 'Data dengan nama tersebut sudah ada' });
    res.status(500).json({ success: false, message: error.message });
  }
};

const update = (type) => async (req, res) => {
  try {
    const Model = getModel(type);
    if (!Model) return res.status(400).json({ success: false, message: 'Invalid type' });

    // Farmer owner can only update assigned farms
    if (type === 'farms' && req.user && req.user.role === 'farmer_owner') {
      const User = require('../model/User');
      const user = await User.findById(req.user.id);
      if (!user || !user.assigned_farms || !user.assigned_farms.some((f) => f.toString() === req.params.id)) {
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
    if (error.code === 11000)
      return res.status(400).json({ success: false, message: 'Data dengan nama tersebut sudah ada' });
    res.status(500).json({ success: false, message: error.message });
  }
};

const remove = (type) => async (req, res) => {
  try {
    const Model = getModel(type);
    if (!Model) return res.status(400).json({ success: false, message: 'Invalid type' });

    // Farmer owner cannot delete farms
    if (type === 'farms' && req.user && req.user.role === 'farmer_owner') {
      return res.status(403).json({ success: false, message: 'Owner tidak dapat menghapus farm' });
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
    if (req.query.type && type === 'agricultural-inputs') query.type = req.query.type;

    // Farmer owner scoping for farms
    if (type === 'farms' && req.user && req.user.role === 'farmer_owner') {
      const User = require('../model/User');
      const user = await User.findById(req.user.id);
      if (user && user.assigned_farms && user.assigned_farms.length > 0) {
        query._id = { $in: user.assigned_farms };
      } else {
        return res.json({ success: true, data: [] });
      }
    }

    const populateMap3 = { blocks: 'farm', fertilizers: 'unit', nutrients: 'unit', medicines: 'unit', 'agricultural-inputs': 'unit' };
    const data = await Model.find(query)
      .populate(populateMap3[type] || '')
      .sort({ name: 1 })
      .lean();
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
  getAllActivityTypes: getAll('activity-types'),

  listUnits: list('units'),
  getUnit: getById('units'),
  createUnit: create('units'),
  updateUnit: update('units'),
  deleteUnit: remove('units'),
  getAllUnits: getAll('units'),

  listFertilizers: list('fertilizers'),
  getFertilizer: getById('fertilizers'),
  createFertilizer: create('fertilizers'),
  updateFertilizer: update('fertilizers'),
  deleteFertilizer: remove('fertilizers'),
  getAllFertilizers: getAll('fertilizers'),

  listNutrients: list('nutrients'),
  getNutrient: getById('nutrients'),
  createNutrient: create('nutrients'),
  updateNutrient: update('nutrients'),
  deleteNutrient: remove('nutrients'),
  getAllNutrients: getAll('nutrients'),

  listMedicines: list('medicines'),
  getMedicine: getById('medicines'),
  createMedicine: create('medicines'),
  updateMedicine: update('medicines'),
  deleteMedicine: remove('medicines'),
  getAllMedicines: getAll('medicines'),

  listAgriculturalInputs: list('agricultural-inputs'),
  getAgriculturalInput: getById('agricultural-inputs'),
  createAgriculturalInput: create('agricultural-inputs'),
  updateAgriculturalInput: update('agricultural-inputs'),
  deleteAgriculturalInput: remove('agricultural-inputs'),
  getAllAgriculturalInputs: getAll('agricultural-inputs'),
};
