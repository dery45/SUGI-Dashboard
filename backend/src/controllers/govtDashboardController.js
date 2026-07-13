const KetidakcukupanNasional = require('../models/KetidakcukupanNasional');
const KetidakcukupanProvinsi = require('../models/KetidakcukupanProvinsi');
const KonsumsiPerJenis = require('../models/KonsumsiPerJenis');
const PenyaluranDonasi = require('../models/PenyaluranDonasi');
const ProyeksiNeraca = require('../models/ProyeksiNeraca');
const GerakanPanganMurah = require('../models/GerakanPanganMurah');
const SkorPPH = require('../models/SkorPPH');
const PanganTerselamatkan = require('../models/PanganTerselamatkan');
const CadanganPanganProvinsi = require('../models/CadanganPanganProvinsi');
const HargaKonsumenProvinsi = require('../models/HargaKonsumenProvinsi');
const HargaProdusenProvinsi = require('../models/HargaProdusenProvinsi');

function safeNum(v) { const n = parseFloat(v); return isNaN(n) ? 0 : n; }

function buildMatch(filters, extra) {
  const match = {};
  if (filters.year && filters.year !== 'all') match.tahun = filters.year;
  if (filters.month && filters.month !== 'all') match.bulan = filters.month;
  if (filters.commodity && filters.commodity !== 'all') match.komoditas = { $regex: `^${filters.commodity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' };
  if (extra) Object.assign(match, extra);
  return match;
}

exports.getGovernmentDashboard = async (req, res) => {
  const filters = {
    year: req.query.year || 'all',
    month: req.query.month || 'all',
    commodity: req.query.commodity || 'all',
    province: req.query.province || 'all',
  };
  const pagination = {
    page: parseInt(req.query.page) || 1,
    limit: Math.min(parseInt(req.query.limit) || 10, 100),
  };

  try {
    const kpi = await computeKpis(filters);
    const [trends, rankings, mapData, tables] = await Promise.all([
      computeTrends(filters),
      computeRankings(filters),
      computeMapData(filters),
      computeTables(filters, pagination),
    ]);

    res.json({ success: true, data: { kpis: kpi, ...trends, ...rankings, ...mapData, ...tables } });
  } catch (error) {
    console.error('Govt dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─── KPI Cards ─────────────────────────────────────────────── */

async function computeKpis(filters) {
  const year = filters.year !== 'all' ? filters.year : null;

  const skorPPH = year
    ? await SkorPPH.findOne({ tahun: year }).lean()
    : await SkorPPH.findOne().sort({ tahun: -1 }).lean();

  const neracaMatch = buildMatch(filters, { tingkat: 'Nasional' });
  delete neracaMatch.komoditas;
  const neracaAgg = await ProyeksiNeraca.aggregate([
    { $match: neracaMatch },
    { $group: { _id: null, ketersediaan: { $sum: '$ketersediaan' }, kebutuhan: { $sum: '$kebutuhan' } } }
  ]);

  const gpmMatch = buildMatch(filters);
  delete gpmMatch.komoditas;
  const gpmAgg = await GerakanPanganMurah.aggregate([
    { $match: gpmMatch },
    { $group: { _id: null, total: { $sum: '$pelaksana' } } }
  ]);

  const cppdMatch = buildMatch(filters);
  delete cppdMatch.komoditas;
  const cppdAgg = await CadanganPanganProvinsi.aggregate([
    { $match: cppdMatch },
    { $group: { _id: null, total: { $sum: '$cppd_ton' } } }
  ]);

  const neraca = neracaAgg[0] || { ketersediaan: 0, kebutuhan: 0 };
  const gpm = gpmAgg[0] || { total: 0 };
  const cppd = cppdAgg[0] || { total: 0 };

  return {
    neraca: {
      current: neraca.ketersediaan - neraca.kebutuhan,
      label: 'Surplus Neraca (Ton)',
      sub: `${neraca.ketersediaan.toLocaleString()} avail · ${neraca.kebutuhan.toLocaleString()} need`
    },
    pph: {
      current: skorPPH ? safeNum(skorPPH.pph_ketersediaan) : 0,
      label: 'Skor PPH Nasional',
      sub: skorPPH?.tahun || '-'
    },
    gpm: {
      current: gpm.total,
      label: 'Gerakan Pangan Murah',
      sub: `${gpm.total} kegiatan`
    },
    cppd: {
      current: cppd.total,
      label: 'Cadangan Pangan Daerah (Ton)',
      sub: `${cppd.total.toLocaleString()} ton`
    }
  };
}

/* ─── Chart Trends ──────────────────────────────────────────── */

async function computeTrends(filters) {
  const pouTrend = await KetidakcukupanNasional.find()
    .sort({ tahun: 1 })
    .select('tahun pou jumlah_penduduk penduduk_undernourish')
    .lean()
    .limit(50);

  const pphTrend = await SkorPPH.find()
    .sort({ tahun: 1 })
    .select('tahun pph_ketersediaan keterangan')
    .lean()
    .limit(50);

  const neracaMatch = buildMatch(filters, { tingkat: 'Nasional' });
  delete neracaMatch.bulan;
  delete neracaMatch.komoditas;
  const neracaTrend = await ProyeksiNeraca.aggregate([
    { $match: neracaMatch },
    { $group: { _id: { bulan: '$bulan' }, ketersediaan: { $sum: '$ketersediaan' }, kebutuhan: { $sum: '$kebutuhan' } } },
    { $replaceWith: { $mergeObjects: ['$_id', { ketersediaan: '$ketersediaan', kebutuhan: '$kebutuhan', surplus: { $subtract: ['$ketersediaan', '$kebutuhan'] } }] } },
    { $sort: { bulan: 1 } }
  ]);

  const konsumsi = await KonsumsiPerJenis.aggregate([
    { $group: { _id: { kelompok: '$kelompok_bahan_pangan', komoditas: '$komoditas' }, total: { $first: '$konsumsi_pangan' } } },
    { $replaceWith: { $mergeObjects: ['$_id', { nilai: { $toDouble: { $ifNull: ['$total', '0'] } } }] } },
    { $sort: { kelompok: 1, nilai: -1 } },
    { $limit: 20 }
  ]);

  const donasiMatch = buildMatch(filters);
  delete donasiMatch.bulan;
  delete donasiMatch.komoditas;
  const donasiTrend = await PenyaluranDonasi.aggregate([
    { $match: donasiMatch },
    { $group: { _id: { bulan: '$bulan' }, donasi_kg: { $sum: '$jumlah_donasi_kg' }, penerima: { $sum: '$penerima_manfaat_jiwa' } } },
    { $replaceWith: { $mergeObjects: ['$_id', { donasi_kg: '$donasi_kg', penerima: '$penerima' }] } },
    { $sort: { bulan: 1 } }
  ]);

  const rescueMatch = buildMatch(filters);
  delete rescueMatch.bulan;
  delete rescueMatch.komoditas;
  const rescueTrend = await PanganTerselamatkan.aggregate([
    { $match: rescueMatch },
    { $group: { _id: { bulan: '$bulan' }, kg: { $sum: '$jumlah_donasi_kg' } } },
    { $replaceWith: { $mergeObjects: ['$_id', { kg: '$kg' }] } },
    { $sort: { bulan: 1 } }
  ]);

  const priceMatch = buildMatch(filters);
  delete priceMatch.komoditas;
  const [priceConsumer, priceProducer] = await Promise.all([
    HargaKonsumenProvinsi.aggregate([
      { $match: priceMatch },
      { $group: { _id: { komoditas: '$komoditas' }, harga: { $avg: '$harga' } } },
      { $replaceWith: { $mergeObjects: ['$_id', { harga: { $round: ['$harga', 0] } }] } },
      { $sort: { harga: -1 } },
      { $limit: 10 }
    ]),
    HargaProdusenProvinsi.aggregate([
      { $match: priceMatch },
      { $group: { _id: { komoditas: '$komoditas' }, harga: { $avg: '$harga' } } },
      { $replaceWith: { $mergeObjects: ['$_id', { harga: { $round: ['$harga', 0] } }] } },
      { $sort: { harga: -1 } },
      { $limit: 10 }
    ]),
  ]);

  return {
    chartPouTrend: pouTrend.map(p => ({ tahun: p.tahun, pou: safeNum(p.pou), jumlah_penduduk: p.jumlah_penduduk, undernourish: p.penduduk_undernourish })),
    chartPphTrend: pphTrend.map(s => ({ tahun: s.tahun, skor: safeNum(s.pph_ketersediaan), keterangan: s.keterangan })),
    chartNeraca: neracaTrend,
    chartKonsumsi: konsumsi,
    chartDonasi: donasiTrend,
    chartRescue: rescueTrend,
    chartPriceKonsumen: priceConsumer,
    chartPriceProdusen: priceProducer,
  };
}

/* ─── Rankings ──────────────────────────────────────────────── */

async function computeRankings(filters) {
  const year = filters.year !== 'all' ? filters.year : null;

  const [cppdRank, pouProvRank, gpmRank] = await Promise.all([
    CadanganPanganProvinsi.aggregate([
      { $match: year ? { tahun: year } : {} },
      { $group: { _id: { wilayah: '$wilayah' }, ton: { $sum: '$cppd_ton' } } },
      { $replaceWith: { $mergeObjects: ['$_id', { ton: '$ton' }] } },
      { $sort: { ton: -1 } },
      { $limit: 38 }
    ]),
    KetidakcukupanProvinsi.aggregate([
      { $match: year ? { tahun: year } : {} },
      { $project: { provinsi: 1, pou: { $toDouble: { $ifNull: ['$pou', '0'] } }, _id: 0 } },
      { $sort: { pou: -1 } },
      { $limit: 38 }
    ]),
    GerakanPanganMurah.aggregate([
      { $match: year ? { tahun: year } : {} },
      { $group: { _id: { provinsi: '$provinsi' }, kegiatan: { $sum: 1 } } },
      { $replaceWith: { $mergeObjects: ['$_id', { kegiatan: '$kegiatan' }] } },
      { $sort: { kegiatan: -1 } },
      { $limit: 38 }
    ]),
  ]);

  return { chartCppdRanking: cppdRank, chartPouProvRanking: pouProvRank, chartGpmRanking: gpmRank };
}

/* ─── Map Data ──────────────────────────────────────────────── */

async function computeMapData(filters) {
  const year = filters.year !== 'all' ? filters.year : null;
  const yearMatch = year ? { tahun: year } : {};

  const [pouMap, konsumenMap, produsenMap, cppdMap, gpmMap] = await Promise.all([
    KetidakcukupanProvinsi.aggregate([
      { $match: yearMatch },
      { $project: { _id: 0, provinsi: 1, pou: { $toDouble: { $ifNull: ['$pou', '0'] } } } }
    ]),
    HargaKonsumenProvinsi.aggregate([
      { $match: yearMatch },
      { $group: { _id: { provinsi: '$nama_provinsi' }, harga: { $avg: '$harga' } } },
      { $replaceWith: { $mergeObjects: ['$_id', { harga: { $round: ['$harga', 0] } }] } },
      { $sort: { provinsi: 1 } }
    ]),
    HargaProdusenProvinsi.aggregate([
      { $match: yearMatch },
      { $group: { _id: { provinsi: '$nama_provinsi' }, harga: { $avg: '$harga' } } },
      { $replaceWith: { $mergeObjects: ['$_id', { harga: { $round: ['$harga', 0] } }] } },
      { $sort: { provinsi: 1 } }
    ]),
    CadanganPanganProvinsi.aggregate([
      { $match: yearMatch },
      { $group: { _id: { wilayah: '$wilayah' }, ton: { $sum: '$cppd_ton' } } },
      { $replaceWith: { $mergeObjects: ['$_id', { ton: { $round: ['$ton', 2] } }] } },
      { $addFields: { provinsi: '$wilayah' } },
      { $project: { wilayah: 0 } },
    ]),
    GerakanPanganMurah.aggregate([
      { $match: yearMatch },
      { $group: { _id: { provinsi: '$provinsi' }, kegiatan: { $sum: 1 } } },
      { $replaceWith: { $mergeObjects: ['$_id', { kegiatan: '$kegiatan' }] } },
    ]),
  ]);

  return { mapPou: pouMap, mapKonsumen: konsumenMap, mapProdusen: produsenMap, mapCppd: cppdMap, mapGpm: gpmMap };
}

/* ─── Tables (paginated) ────────────────────────────────────── */

async function computeTables(filters, pagination) {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const pouMatch = buildMatch(filters);
  const cppdMatch = buildMatch(filters);
  const gpmMatch = buildMatch(filters);
  delete gpmMatch.komoditas;
  const donasiMatch = buildMatch(filters);
  delete donasiMatch.komoditas;
  const neracaMatch = buildMatch(filters);
  delete neracaMatch.komoditas;
  const pouProvMatch = buildMatch(filters);

  const paginate = (data, total) => ({ data, total, page, limit, totalPages: Math.ceil(total / limit) });

  const [pouData, pouTotal, cppdData, cppdTotal, gpmData, gpmTotal, donasiData, donasiTotal, neracaData, neracaTotal, pouProvData, pouProvTotal] = await Promise.all([
    KetidakcukupanNasional.find(pouMatch).sort({ tahun: -1 }).skip(skip).limit(limit).lean(),
    KetidakcukupanNasional.countDocuments(pouMatch),
    CadanganPanganProvinsi.find(cppdMatch).sort({ tahun: -1 }).skip(skip).limit(limit).lean(),
    CadanganPanganProvinsi.countDocuments(cppdMatch),
    GerakanPanganMurah.find(gpmMatch).sort({ tahun: -1, bulan: -1 }).skip(skip).limit(limit).lean(),
    GerakanPanganMurah.countDocuments(gpmMatch),
    PenyaluranDonasi.find(donasiMatch).sort({ tahun: -1, bulan: -1 }).skip(skip).limit(limit).lean(),
    PenyaluranDonasi.countDocuments(donasiMatch),
    ProyeksiNeraca.find(neracaMatch).sort({ tahun: -1, bulan: -1 }).skip(skip).limit(limit).lean(),
    ProyeksiNeraca.countDocuments(neracaMatch),
    KetidakcukupanProvinsi.find(pouProvMatch).sort({ tahun: -1 }).skip(skip).limit(limit).lean(),
    KetidakcukupanProvinsi.countDocuments(pouProvMatch),
  ]);

  return {
    tablePou: paginate(pouData, pouTotal),
    tableCppd: paginate(cppdData, cppdTotal),
    tableGpm: paginate(gpmData, gpmTotal),
    tableDonasi: paginate(donasiData, donasiTotal),
    tableNeraca: paginate(neracaData, neracaTotal),
    tablePouProvinsi: paginate(pouProvData, pouProvTotal),
  };
}
