const fs = require('fs');
const path = require('path');

const content = `const express = require('express');
const router = express.Router();
const CropCycle = require('../models/CropCycle');
const LandRecord = require('../models/LandRecord');
const HarvestPeriod = require('../models/HarvestPeriod');
const Activity = require('../models/Activity');
const Farm = require('../models/Farm');
const { isManagement } = require('../middlewares/rbacMiddleware');

// === LAND RECORDS ===
router.get('/land', isManagement, async (req, res) => {
  try {
    const data = await LandRecord.find().populate('farm_id').sort({ createdAt: -1 });
    res.json(data);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/land', isManagement, async (req, res) => {
  try {
    const record = new LandRecord({...req.body, organization_id: req.user.organization_id, createdBy: req.user._id});
    await record.save();
    res.json(record);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

router.put('/land/:id', isManagement, async (req, res) => {
  try {
    const record = await LandRecord.findByIdAndUpdate(req.params.id, req.body, {new: true});
    res.json(record);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

router.delete('/land/:id', isManagement, async (req, res) => {
  try {
    await LandRecord.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// === PLANTINGS (CropCycle mapping for simplistic CRUD on frontend) ===
router.get('/plantings', isManagement, async (req, res) => {
  try {
    const data = await CropCycle.find({ status: { $in: ['Planned', 'In_Progress', 'Completed', 'Cancelled', 'Land_Preparation', 'Planted', 'Maintenance'] } }).populate('farm_id').sort({ createdAt: -1 });
    res.json(data);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/plantings', isManagement, async (req, res) => {
  try {
    const record = new CropCycle({...req.body, organization_id: req.user.organization_id, createdBy: req.user._id});
    await record.save();
    res.json(record);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

router.put('/plantings/:id', isManagement, async (req, res) => {
  try {
    const record = await CropCycle.findByIdAndUpdate(req.params.id, req.body, {new: true});
    res.json(record);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

router.delete('/plantings/:id', isManagement, async (req, res) => {
  try {
    await CropCycle.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// === ACTIVITIES / MAINTENANCE ===
router.get('/activities', isManagement, async (req, res) => {
  try {
    const data = await Activity.find().populate('farm_id crop_cycle_id').sort({ date: -1 });
    res.json(data);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/activities', isManagement, async (req, res) => {
  try {
    const record = new Activity({...req.body, organization_id: req.user.organization_id, createdBy: req.user._id});
    await record.save();
    res.json(record);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

router.put('/activities/:id', isManagement, async (req, res) => {
  try {
    const record = await Activity.findByIdAndUpdate(req.params.id, req.body, {new: true});
    res.json(record);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

router.delete('/activities/:id', isManagement, async (req, res) => {
  try {
    await Activity.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// === HARVEST ===
router.get('/harvests', isManagement, async (req, res) => {
  try {
    const data = await HarvestPeriod.find().populate('farm_id crop_cycle_id').sort({ harvest_opening_date: -1 });
    res.json(data);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/harvests', isManagement, async (req, res) => {
  try {
    const record = new HarvestPeriod({...req.body, organization_id: req.user.organization_id, createdBy: req.user._id});
    await record.save();
    res.json(record);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

router.put('/harvests/:id', isManagement, async (req, res) => {
  try {
    const record = await HarvestPeriod.findByIdAndUpdate(req.params.id, req.body, {new: true});
    res.json(record);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

router.delete('/harvests/:id', isManagement, async (req, res) => {
  try {
    await HarvestPeriod.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
`;

fs.writeFileSync(path.join(__dirname, 'src/routes/lifecycleRoutes.js'), content);
console.log('Done refactoring lifecycleRoutes.js');
