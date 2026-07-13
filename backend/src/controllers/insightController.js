const GovernmentInsight = require('../models/GovernmentInsight');
const FarmerInsight = require('../models/FarmerInsight');

exports.getInsights = async (req, res) => {
  try {
    const { source } = req.query;
    const match = {};
    if (source) match.sourceCollection = source;

    const insights = await GovernmentInsight.find(match)
      .sort({ generatedAt: -1 })
      .limit(source ? 1 : 50)
      .lean();

    res.json({ success: true, data: insights });
  } catch (err) {
    console.error('Insight fetch error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFarmerInsights = async (req, res) => {
  try {
    const insights = await FarmerInsight.find()
      .sort({ generatedAt: -1 })
      .lean();

    res.json({ success: true, data: insights });
  } catch (err) {
    console.error('Farmer insight fetch error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
