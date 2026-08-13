const { required, isNumber, validate, errorResponse } = require('../util/validate');

function buildRules(Model) {
  const rules = {};
  for (const [name, path] of Object.entries(Model.schema.paths)) {
    if (['_id', '__v', 'createdAt', 'updatedAt'].includes(name)) continue;
    const validators = [];
    if (path.isRequired) validators.push([required, name]);
    if (path.instance === 'Number') validators.push([isNumber, name]);
    if (validators.length) rules[name] = validators;
  }
  return rules;
}

function createDatasetController(Model) {
  const rules = buildRules(Model);

  return {
    async list(req, res) {
      try {
        const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;
        let data;
        let total;
        let page = 1;
        let totalPages = 1;
        if (hasPagination) {
          page = parseInt(req.query.page) || 1;
          const limit = parseInt(req.query.limit) || 100;
          const skip = (page - 1) * limit;
          [data, total] = await Promise.all([
            Model.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            Model.countDocuments(),
          ]);
          totalPages = Math.ceil(total / limit);
        } else {
          [data, total] = await Promise.all([Model.find().sort({ createdAt: -1 }), Model.countDocuments()]);
        }
        res.json({ success: true, data, total, page, totalPages });
      } catch (err) {
        res.status(500).json({ success: false, error: err.message });
      }
    },

    async getById(req, res) {
      try {
        const doc = await Model.findById(req.params.id);
        if (!doc) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
        res.json({ success: true, data: doc });
      } catch (err) {
        res.status(500).json({ success: false, error: err.message });
      }
    },

    async create(req, res) {
      try {
        const errs = validate(req.body, rules);
        if (errs) return errorResponse(res, errs);
        const doc = new Model(req.body);
        await doc.save();
        res.status(201).json({ success: true, data: doc });
      } catch (err) {
        res.status(400).json({ success: false, error: err.message });
      }
    },

    async update(req, res) {
      try {
        const presentRules = {};
        for (const [field, validators] of Object.entries(rules)) {
          if (field in req.body) presentRules[field] = validators;
        }
        const errs = validate(req.body, presentRules);
        if (errs) return errorResponse(res, errs);
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!doc) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
        res.json({ success: true, data: doc });
      } catch (err) {
        res.status(400).json({ success: false, error: err.message });
      }
    },

    async remove(req, res) {
      try {
        const doc = await Model.findByIdAndDelete(req.params.id);
        if (!doc) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ success: false, error: err.message });
      }
    },
  };
}

module.exports = createDatasetController;
