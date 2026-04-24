const mongoose = require('mongoose');

// Map of unique dimension fields for each model to be used as query for upserting
const modelUniqueKeys = {
  KetidakcukupanNasional: ['tahun'],
  KetidakcukupanProvinsi: ['tahun', 'kode_provinsi'],
  KonsumsiPerJenis: ['tahun', 'kelompok_bahan_pangan', 'komoditas'],
  PenyaluranDonasi: ['tahun', 'bulan'],
  ProyeksiNeraca: ['tahun', 'bulan', 'komoditas'], // wait, is status and tingkat part of the key? Let's use tahun, bulan, komoditas
  GerakanPanganMurah: ['tahun', 'bulan', 'kode_provinsi', 'kode_kab_kota'],
  HargaKonsumenProvinsi: ['tahun', 'bulan', 'kode_provinsi', 'komoditas'],
  HargaKonsumenNasional: ['tahun', 'bulan', 'komoditas'],
  HargaProdusenNasional: ['tahun', 'bulan', 'komoditas'],
  HargaProdusenProvinsi: ['tahun', 'bulan', 'kode_provinsi', 'komoditas'],
  VariasiHargaProdusen: ['tahun', 'bulan', 'kode_wilayah', 'komoditas'],
  SkorPPH: ['tahun'],
  PanganTerselamatkan: ['tahun', 'bulan'],
  CadanganPanganProvinsi: ['tahun', 'bulan', 'kode_wilayah']
};

exports.bulkImportData = async (req, res) => {
  try {
    const { modelName } = req.params;
    const dataArray = req.body;

    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      return res.status(400).json({ error: 'Payload must be a non-empty array' });
    }

    if (!modelUniqueKeys[modelName]) {
      return res.status(400).json({ error: `Model ${modelName} is not supported for bulk import` });
    }

    // Attempt to load the model
    let Model;
    try {
      Model = require(`../models/${modelName}`);
    } catch (err) {
      return res.status(400).json({ error: `Model file for ${modelName} not found` });
    }

    const uniqueKeys = modelUniqueKeys[modelName];

    // Prepare bulkWrite operations
    const operations = dataArray.map(item => {
      const query = {};
      uniqueKeys.forEach(key => {
        if (item[key] !== undefined) {
          query[key] = item[key];
        }
      });

      return {
        updateOne: {
          filter: query,
          update: { $set: item },
          upsert: true
        }
      };
    });

    const result = await Model.bulkWrite(operations);

    res.status(200).json({
      message: 'Bulk import successful',
      insertedCount: result.upsertedCount || 0,
      modifiedCount: result.modifiedCount || 0,
      matchedCount: result.matchedCount || 0
    });

  } catch (err) {
    console.error('Bulk Import Error:', err);
    res.status(500).json({ error: err.message });
  }
};
