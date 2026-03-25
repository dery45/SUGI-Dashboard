const express = require('express');
const router = express.Router();
const CropCycle = require('../models/CropCycle');
const LandRecord = require('../models/LandRecord');
const HarvestPeriod = require('../models/HarvestPeriod');
const { isManagement, isFarmerOrUM } = require('../middlewares/rbacMiddleware');

/**
 * LAND OPENING/CLOSING endpoints
 */
router.post('/land/open', isManagement, async (req, res) => {
  try {
    const { farm_id, crop_cycle_id, land_opening_date, clearing_cost, um_responsible_id } = req.body;
    
    const record = new LandRecord({
      farm_id,
      crop_cycle_id,
      organization_id: req.user.organization_id,
      land_opening_date,
      clearing_cost,
      um_responsible_id,
      status: 'Open',
      createdBy: req.user._id
    });

    await record.save();

    // Update CropCycle status
    await CropCycle.findByIdAndUpdate(crop_cycle_id, {
      status: 'Land_Preparation',
      land_opening_date
    });

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/land/close', isManagement, async (req, res) => {
  try {
    const { land_record_id, land_closing_date } = req.body;
    
    const record = await LandRecord.findById(land_record_id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    
    record.status = 'Closed';
    record.land_closing_date = land_closing_date;
    await record.save();

    res.json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * HARVEST OPENING/CLOSING endpoints
 */
router.post('/harvest/open', isFarmerOrUM, async (req, res) => {
   try {
    const { farm_id, crop_cycle_id, harvest_opening_date, expected_yield_window_end } = req.body;
    
    const record = new HarvestPeriod({
      farm_id,
      crop_cycle_id,
      organization_id: req.user.organization_id,
      harvest_opening_date,
      expected_yield_window_end,
      status: 'Open',
      createdBy: req.user._id
    });

    await record.save();

    // Update CropCycle status
    await CropCycle.findByIdAndUpdate(crop_cycle_id, {
      status: 'Harvesting',
      harvest_opening_date
    });

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
