const mongoose = require('mongoose');

const MODELS = [
  'KetidakcukupanNasional', 'KetidakcukupanProvinsi', 'KonsumsiPerJenis',
  'PenyaluranDonasi', 'ProyeksiNeraca', 'GerakanPanganMurah',
  'HargaKonsumenProvinsi', 'HargaKonsumenNasional', 'HargaProdusenNasional',
  'HargaProdusenProvinsi', 'SkorPPH', 'PanganTerselamatkan', 'CadanganPanganProvinsi'
];

const COMMODITY_SOURCES = [
  'KonsumsiPerJenis', 'ProyeksiNeraca', 'HargaKonsumenNasional',
  'HargaKonsumenProvinsi', 'HargaProdusenNasional', 'HargaProdusenProvinsi'
];

const PROVINCE_SOURCES = [
  { model: 'KetidakcukupanProvinsi', field: 'provinsi' },
  { model: 'HargaKonsumenProvinsi', field: 'nama_provinsi' },
  { model: 'HargaProdusenProvinsi', field: 'nama_provinsi' },
  { model: 'GerakanPanganMurah', field: 'provinsi' },
  { model: 'CadanganPanganProvinsi', field: 'wilayah' }
];

const MONTH_ORDER = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

function safeModel(name) {
  try { return require(`../models/${name}`); } catch { return null; }
}

exports.getFilterOptions = async (req, res) => {
  try {
    const [years, commodities, provinces, months] = await Promise.all([
      getDistinctYears(),
      getDistinctCommodities(),
      getDistinctProvinces(),
      Promise.resolve(MONTH_ORDER)
    ]);

    res.json({ years, months, commodities, provinces });
  } catch (err) {
    console.error('Filter options error:', err);
    res.status(500).json({ error: err.message });
  }
};

async function getDistinctYears() {
  const allYears = new Set();
  for (const name of MODELS) {
    const Model = safeModel(name);
    if (!Model) continue;
    try {
      const years = await Model.distinct('tahun', { tahun: { $ne: null, $ne: '' } });
      years.forEach(y => { if (y) allYears.add(String(y)); });
    } catch { /* skip */ }
  }
  return [...allYears].sort((a, b) => Number(b) - Number(a));
}

async function getDistinctCommodities() {
  const all = new Set();
  for (const name of COMMODITY_SOURCES) {
    const Model = safeModel(name);
    if (!Model) continue;
    try {
      const items = await Model.distinct('komoditas', { komoditas: { $ne: null, $ne: '' } });
      items.forEach(c => { if (c) all.add(String(c)); });
    } catch { /* skip */ }
  }
  return [...all].sort((a, b) => a.localeCompare(b, 'id'));
}

async function getDistinctProvinces() {
  const all = new Set();
  for (const { model, field } of PROVINCE_SOURCES) {
    const Model = safeModel(model);
    if (!Model) continue;
    try {
      const items = await Model.distinct(field, { [field]: { $ne: null, $ne: '' } });
      items.forEach(p => { if (p) all.add(String(p)); });
    } catch { /* skip */ }
  }
  return [...all].sort((a, b) => a.localeCompare(b, 'id'));
}
