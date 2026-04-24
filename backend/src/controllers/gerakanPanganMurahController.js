const GerakanPanganMurah = require('../models/GerakanPanganMurah');

// Create
exports.createGerakanPanganMurah = async (req, res) => {
  try {
    const newData = new GerakanPanganMurah(req.body);
    await newData.save();
    res.status(201).json(newData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Read Action
exports.getGerakanPanganMurah = async (req, res) => {
  try {
    const data = await GerakanPanganMurah.find().sort({ createdAt: -1 });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateGerakanPanganMurah = async (req, res) => {
  try {
    const updatedData = await GerakanPanganMurah.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedData) return res.status(404).json({ error: 'Data not found' });
    res.status(200).json(updatedData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete
exports.deleteGerakanPanganMurah = async (req, res) => {
  try {
    const deletedData = await GerakanPanganMurah.findByIdAndDelete(req.params.id);
    if (!deletedData) return res.status(404).json({ error: 'Data not found' });
    res.status(200).json({ message: 'Data deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
