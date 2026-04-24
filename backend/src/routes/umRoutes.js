const express = require('express');
const router = express.Router();
const UM = require('../models/UM');
const KPIService = require('../services/kpiService');
const { isCompanyAdmin, isManagement } = require('../middlewares/rbacMiddleware');

// GET /api/um
router.get('/', isManagement, async (req, res) => {
  try {
    const ums = await UM.find({ organization_id: req.user.organization_id })
      .populate('user_id', 'name email phone')
      .populate('assigned_farms', 'name location');
      
    res.json({ success: true, count: ums.length, data: ums });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/um/leaderboard
router.get('/leaderboard', isManagement, async (req, res) => {
  try {
    const leaderboard = await KPIService.getUMPerformance(req.user.organization_id);
    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/um (Assign a new UM)
router.post('/', isCompanyAdmin, async (req, res) => {
  try {
    // In production: Zod Validation here
    const { user_id, um_id, assigned_processes, assigned_farms, start_date } = req.body;
    
    // Create new UM Profile
    const newUM = new UM({
      user_id,
      um_id,
      organization_id: req.user.organization_id,
      assigned_processes,
      assigned_farms,
      start_date,
      createdBy: req.user._id
    });
    
    await newUM.save();
    
    // Next step in full system: Trigger Notification to `user_id`
    
    res.status(201).json({ success: true, data: newUM });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /api/um/:id 
router.put('/:id', isCompanyAdmin, async (req, res) => {
  try {
    const um = await UM.findOneAndUpdate(
      { _id: req.params.id, organization_id: req.user.organization_id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!um) return res.status(404).json({ success: false, message: 'UM not found' });
    res.json({ success: true, data: um });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/um/:id 
router.delete('/:id', isCompanyAdmin, async (req, res) => {
  try {
    const um = await UM.findOneAndDelete({ _id: req.params.id, organization_id: req.user.organization_id });
    if (!um) return res.status(404).json({ success: false, message: 'UM not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
