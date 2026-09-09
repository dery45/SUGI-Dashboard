const mongoose = require('mongoose');
const CropVariety = require('../model/CropVariety');
const { required, isObjectId, validate, errorResponse } = require('../util/validate');

const varietyValidation = (data) =>
  validate(data, {
    name: [[required, 'Nama Varietas']],
    crop_type: [
      [required, 'Jenis Tanaman'],
      [isObjectId, 'Jenis Tanaman'],
    ],
    unit: [
      [required, 'Satuan Hasil'],
      [isObjectId, 'Satuan Hasil'],
    ],
  });

const gradeValidation = (data) =>
  validate(data, {
    grade_name: [[required, 'Nama Grade']],
    estimated_price_per_unit: [[required, 'Estimasi Harga']],
  });

const populateVars = [{ path: 'crop_type' }, { path: 'unit' }];

async function list(req, res) {
  try {
    const { page = 1, limit = 20, search, status, crop_type } = req.query;
    const query = {};
    if (status) query.status = status;
    if (crop_type) query.crop_type = crop_type;
    if (search) query.name = new RegExp(search, 'i');
    const total = await CropVariety.countDocuments(query);
    const data = await CropVariety.find(query)
      .populate(populateVars)
      .sort({ createdAt: -1 })
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean();
    res.json({ success: true, data, meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}

async function getAll(req, res) {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.crop_type) query.crop_type = req.query.crop_type;
    const data = await CropVariety.find(query).populate(populateVars).sort({ name: 1 }).lean();
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}

async function getById(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: 'ID tidak valid' });
    const data = await CropVariety.findById(req.params.id).populate(populateVars).lean();
    if (!data) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}

async function create(req, res) {
  try {
    const errs = varietyValidation(req.body);
    if (errs) return errorResponse(res, errs);
    const payload = { ...req.body };
    if (req.user) payload.createdBy = req.user.id;
    const data = await CropVariety.create(payload);
    const populated = await data.populate(populateVars);
    res.status(201).json({ success: true, data: populated });
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ success: false, message: 'Varietas dengan nama tersebut sudah ada untuk jenis tanaman ini' });
    res.status(500).json({ success: false, message: e.message });
  }
}

async function update(req, res) {
  try {
    const errs = varietyValidation(req.body);
    if (errs) return errorResponse(res, errs);
    const data = await CropVariety.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(populateVars);
    if (!data) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    res.json({ success: true, data });
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ success: false, message: 'Varietas dengan nama tersebut sudah ada untuk jenis tanaman ini' });
    res.status(500).json({ success: false, message: e.message });
  }
}

async function remove(req, res) {
  try {
    const data = await CropVariety.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    res.json({ success: true, message: 'Data berhasil dihapus' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}

// Grade sub-resource (inline, tanpa resubmit seluruh variety)
async function addGrade(req, res) {
  try {
    const errs = gradeValidation(req.body);
    if (errs) return errorResponse(res, errs);
    const variety = await CropVariety.findById(req.params.id);
    if (!variety) return res.status(404).json({ success: false, message: 'Varietas tidak ditemukan' });
    variety.grades.push({ grade_name: req.body.grade_name, estimated_price_per_unit: req.body.estimated_price_per_unit });
    await variety.save();
    const populated = await variety.populate(populateVars);
    res.status(201).json({ success: true, data: populated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}

async function updateGrade(req, res) {
  try {
    const errs = gradeValidation(req.body);
    if (errs) return errorResponse(res, errs);
    const variety = await CropVariety.findById(req.params.id);
    if (!variety) return res.status(404).json({ success: false, message: 'Varietas tidak ditemukan' });
    const grade = variety.grades.id(req.params.gradeId);
    if (!grade) return res.status(404).json({ success: false, message: 'Grade tidak ditemukan' });
    grade.grade_name = req.body.grade_name;
    grade.estimated_price_per_unit = req.body.estimated_price_per_unit;
    await variety.save();
    const populated = await variety.populate(populateVars);
    res.json({ success: true, data: populated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}

async function deleteGrade(req, res) {
  try {
    const variety = await CropVariety.findById(req.params.id);
    if (!variety) return res.status(404).json({ success: false, message: 'Varietas tidak ditemukan' });
    const grade = variety.grades.id(req.params.gradeId);
    if (!grade) return res.status(404).json({ success: false, message: 'Grade tidak ditemukan' });
    grade.deleteOne();
    await variety.save();
    const populated = await variety.populate(populateVars);
    res.json({ success: true, data: populated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}

module.exports = { list, getAll, getById, create, update, remove, addGrade, updateGrade, deleteGrade };
