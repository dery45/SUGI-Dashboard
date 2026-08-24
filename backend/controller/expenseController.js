const Expense = require('../model/Expense');
const FarmerAssignment = require('../model/FarmerAssignment');
const { required, isObjectId, isNumber, minValue, validate, errorResponse } = require('../util/validate');

const EXPENSE_CATEGORIES = [
  'Bibit',
  'Pupuk',
  'Pestisida',
  'Tenaga Kerja',
  'Transportasi',
  'Peralatan',
  'Sewa Lahan',
  'Lainnya',
];

async function getUserFarmIds(user) {
  if (user.role === 'farmer') {
    const assignments = await FarmerAssignment.find({ farmer: user.id, status: 'Active' }).lean();
    return [...new Set(assignments.map(a => (a.farm?._id || a.farm).toString()))];
  }
  if (user.role === 'farmer_owner') {
    const User = require('../model/User');
    const u = await User.findById(user.id).select('assigned_farms').lean();
    return (u?.assigned_farms || []).map(f => (f && typeof f === 'object' ? (f._id || f).toString() : String(f)));
  }
  return null; // superadmin/gov: no restriction
}

function buildFarmQuery(userFarmIds, explicitFarmId) {
  if (!userFarmIds) return explicitFarmId ? { farm_id: explicitFarmId } : {};
  if (explicitFarmId) {
    return userFarmIds.includes(String(explicitFarmId)) ? { farm_id: explicitFarmId } : { farm_id: { $in: [] } };
  }
  return { farm_id: { $in: userFarmIds } };
}

// POST /api/expenses — Log an expense
const createExpense = async (req, res) => {
  try {
    const { farm_id, crop_cycle_id, category, amount_idr, description, expense_date, um_responsible_id, receipt_ref } =
      req.body;

    // Validate farm access
    const userFarmIds = await getUserFarmIds(req.user);
    if (userFarmIds && !userFarmIds.includes(farm_id)) {
      return res.status(403).json({ success: false, message: 'Akses ditolak: farm tidak dalam penugasan Anda' });
    }

    const errs = validate(
      { farm_id, category, amount_idr },
      {
        farm_id: [
          [required, 'Farm'],
          [isObjectId, 'Farm'],
        ],
        category: [[required, 'Kategori']],
        amount_idr: [
          [required, 'Jumlah (Rp)'],
          [isNumber, 'Jumlah (Rp)'],
          [minValue, 0, 'Jumlah (Rp)'],
        ],
      }
    );
    if (errs) return errorResponse(res, errs);
    if (!EXPENSE_CATEGORIES.includes(category)) {
      return errorResponse(res, { category: 'Kategori tidak valid. Pilihan: ' + EXPENSE_CATEGORIES.join(', ') });
    }
    if (crop_cycle_id && !isObjectId(crop_cycle_id, null)) {
      return errorResponse(res, { crop_cycle_id: 'Siklus tanam tidak valid' });
    }

    const expense = new Expense({
      farm_id,
      crop_cycle_id: crop_cycle_id || undefined,
      category,
      amount_idr,
      description,
      expense_date: expense_date || new Date(),
      um_responsible_id,
      receipt_ref,
      createdBy: req.user._id,
    });

    await expense.save();
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// GET /api/expenses — List with optional filters
const listExpenses = async (req, res) => {
  try {
    const { farm_id, category, page = 1, limit = 20 } = req.query;
    
    const userFarmIds = await getUserFarmIds(req.user);
    const farmQuery = buildFarmQuery(userFarmIds, farm_id);
    
    const query = { ...farmQuery };
    if (category) query.category = category;
    
    // If farmQuery results in empty match ($in: []), return empty
    if (farmQuery.farm_id?.$in?.length === 0) {
      return res.json({ success: true, data: [], total: 0, page: parseInt(page), breakdown: [] });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [expenses, total] = await Promise.all([
      Expense.find(query).populate('farm_id', 'name').sort({ expense_date: -1 }).skip(skip).limit(parseInt(limit)),
      Expense.countDocuments(query),
    ]);

    // Aggregate total cost by category
    const breakdown = await Expense.aggregate([
      { $match: query },
      { $group: { _id: '$category', totalAmount: { $sum: '$amount_idr' }, count: { $sum: 1 } } },
      { $sort: { totalAmount: -1 } },
    ]);

    res.json({ success: true, data: expenses, total, page: parseInt(page), breakdown });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PATCH /api/expenses/:id — Edit an expense entry
const updateExpense = async (req, res) => {
  try {
    const userFarmIds = await getUserFarmIds(req.user);
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: 'Pengeluaran tidak ditemukan' });
    if (userFarmIds && !userFarmIds.includes(expense.farm_id?.toString())) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }
    // Prevent farm_id change to unauthorized farm
    if (req.body.farm_id && userFarmIds && !userFarmIds.includes(req.body.farm_id)) {
      return res.status(403).json({ success: false, message: 'Akses ditolak: farm tidak dalam penugasan Anda' });
    }
    const updated = await Expense.findOneAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE /api/expenses/:id — Delete an expense
const deleteExpense = async (req, res) => {
  try {
    const userFarmIds = await getUserFarmIds(req.user);
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    if (userFarmIds && !userFarmIds.includes(expense.farm_id?.toString())) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }
    await Expense.findOneAndDelete({ _id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { createExpense, listExpenses, updateExpense, deleteExpense };
