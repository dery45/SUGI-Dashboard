const HargaProdusenNasional = require('../models/HargaProdusenNasional');
const HargaKonsumenNasional = require('../models/HargaKonsumenNasional');
const HargaProdusenProvinsi = require('../models/HargaProdusenProvinsi');
const HargaKonsumenProvinsi = require('../models/HargaKonsumenProvinsi');
const ProyeksiNeraca = require('../models/ProyeksiNeraca');
const KetidakcukupanProvinsi = require('../models/KetidakcukupanProvinsi');
const KonsumsiPerJenis = require('../models/KonsumsiPerJenis');
const SkorPPH = require('../models/SkorPPH');
const CadanganPanganProvinsi = require('../models/CadanganPanganProvinsi');

function safeNum(v) { const n = parseFloat(v); return isNaN(n) ? 0 : n; }

function pctChange(c, p) { if (!p || p === 0) return null; return ((c - p) / p) * 100; }

const BULAN_MAP = {
  '1':'Januari','2':'Februari','3':'Maret','4':'April','5':'Mei','6':'Juni',
  '7':'Juli','8':'Agustus','9':'September','10':'Oktober','11':'November','12':'Desember',
  '01':'Januari','02':'Februari','03':'Maret','04':'April','05':'Mei','06':'Juni',
  '07':'Juli','08':'Agustus','09':'September'
};
function normBulan(b) { return BULAN_MAP[b] || b; }

function normMarginKomoditas(k) {
  if (!k) return '';
  return k
    .replace(/ \(Rp\/Kg\)$/, '').replace(/ \(Rp\/Ekor Hidup\)$/, '')
    .replace(/ \(Rp\/kg Berat Hidup\)$/, '').replace(/ Tk\. ?[A-Za-z]+$/, '')
    .replace(/ Tk\.?Petani[^)]*/, '').replace(/ Tingkat [A-Za-z]+/, '')
    .replace(/ Pipilan Kering/, '').trim();
}


function buildMatch(filters, extra) {
  const m = {};
  if (filters.year && filters.year !== 'all') m.tahun = filters.year;
  if (filters.month && filters.month !== 'all') m.bulan = filters.month;
  if (filters.commodity && filters.commodity !== 'all') m.komoditas = { $regex: `^${filters.commodity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' };
  if (extra) Object.assign(m, extra);
  return m;
}

exports.getFarmerDashboard = async (req, res) => {
  const f = {
    year: req.query.year || 'all', month: req.query.month || 'all',
    commodity: req.query.commodity || 'all', province: req.query.province || 'all',
  };
  const p = { page: parseInt(req.query.page) || 1, limit: Math.min(parseInt(req.query.limit) || 10, 100) };

  try {
    const [kpis, priceAnalytics, marketAnalytics, mapData, tables] = await Promise.all([
      computeKpis(f), computePriceAnalytics(f), computeMarketAnalytics(f),
      computeMapData(f), computeTables(f, p),
    ]);

    res.json({ success: true, data: { kpis, ...priceAnalytics, ...marketAnalytics, ...mapData, ...tables } });
  } catch (error) {
    console.error('Farmer dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ─── KPIs ──────────────────────────────────────────────────── */

async function computeKpis(filters) {
  const prodMatch = buildMatch(filters);
  delete prodMatch.komoditas;
  const neracaMatch = buildMatch(filters, { tingkat: 'Nasional' });
  delete neracaMatch.komoditas;
  const [prodAgg, consAgg, neracaAgg] = await Promise.all([
    HargaProdusenNasional.aggregate([{ $match: prodMatch }, { $group: { _id: null, avg: { $avg: '$harga' }, max: { $max: '$harga' }, min: { $min: '$harga' }, count: { $sum: 1 } } }]),
    HargaKonsumenNasional.aggregate([{ $match: prodMatch }, { $group: { _id: null, avg: { $avg: '$harga' }, max: { $max: '$harga' }, min: { $min: '$harga' }, count: { $sum: 1 } } }]),
    ProyeksiNeraca.aggregate([{ $match: neracaMatch }, { $group: { _id: null, ketersediaan: { $sum: '$ketersediaan' }, kebutuhan: { $sum: '$kebutuhan' } } }]),
  ]);

  const prod = prodAgg[0] || { avg: 0, max: 0, min: 0 };
  const cons = consAgg[0] || { avg: 0, max: 0, min: 0 };
  const neraca = neracaAgg[0] || { ketersediaan: 0, kebutuhan: 0 };

  const bestMatch = buildMatch(filters);
  delete bestMatch.komoditas;
  const bestCommodity = await HargaProdusenNasional.find(bestMatch).sort({ harga: -1 }).limit(1).lean();

  const highDemand = await KonsumsiPerJenis.aggregate([
    { $group: { _id: { komoditas: '$komoditas' }, total: { $sum: { $toDouble: { $ifNull: ['$konsumsi_pangan', '0'] } } } } },
    { $sort: { total: -1 } }, { $limit: 1 },
  ]);

  const margin = cons.avg - prod.avg;
  const surplus = neraca.ketersediaan - neraca.kebutuhan;

  const pphDoc = await SkorPPH.findOne().sort({ tahun: -1 }).lean();
  const pphPrevYear = pphDoc ? String(Number(pphDoc.tahun) - 1) : null;
  const pphPrev = pphPrevYear ? await SkorPPH.findOne({ tahun: pphPrevYear }).lean() : null;
  const pphCurrent = pphDoc ? safeNum(pphDoc.pph_ketersediaan) : 0;
  const pphPrevious = pphPrev ? safeNum(pphPrev.pph_ketersediaan) : null;

  return {
    avgProducerPrice: { current: prod.avg, previous: null, change: null, label: 'Rata-rata Harga Produsen', sub: `Rp ${Math.round(prod.avg).toLocaleString()}/Kg` },
    avgConsumerPrice: { current: cons.avg, previous: null, change: null, label: 'Rata-rata Harga Konsumen', sub: `Rp ${Math.round(cons.avg).toLocaleString()}/Kg` },
    margin: { current: margin, previous: null, change: null, label: 'Margin Produsen-Konsumen', sub: `Rp ${Math.round(margin).toLocaleString()}/Kg` },
    foodBalance: { current: surplus, previous: null, change: null, label: 'Surplus Neraca Pangan', sub: `${Math.round(surplus).toLocaleString()} Ton` },
    bestCommodity: { current: bestCommodity[0]?.komoditas || '-', previous: null, change: null, label: 'Komoditas Tertinggi', sub: bestCommodity[0] ? `Rp ${Math.round(bestCommodity[0].harga).toLocaleString()}` : '-' },
    pphScore: { current: pphCurrent, previous: pphPrevious, change: pctChange(pphCurrent, pphPrevious), label: 'Skor PPH Nasional', sub: pphDoc ? `${pphDoc.pph_ketersediaan}/100 - ${pphDoc.tahun}` : '-' },
    highDemand: { current: highDemand[0]?._id.komoditas || '-', previous: null, change: null, label: 'Komoditas Paling Diminati', sub: highDemand[0] ? `${Math.round(highDemand[0].total).toLocaleString()} kg/kap` : '-' },
    opportunity: { current: margin > 0 ? 'Menguntungkan' : 'Tipis', previous: null, change: null, label: 'Peluang Pasar', sub: margin > 0 ? `Margin Rp ${Math.round(margin).toLocaleString()}` : 'Margin negatif' },
  };
}

/* ─── Price Analytics ───────────────────────────────────────── */

async function computePriceAnalytics(filters) {
  const pf = buildMatch(filters);
  delete pf.komoditas;
  const yearMatch = filters.year !== 'all' ? { tahun: filters.year } : {};

  const BULAN_ORDER = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

  const [producerTrend, consumerTrend, commodityRanking, pphTrend, provPriceDist] = await Promise.all([
    HargaProdusenNasional.aggregate([
      { $match: yearMatch },
      { $group: { _id: { komoditas: '$komoditas', bulan: '$bulan' }, harga: { $avg: '$harga' } } },
      { $replaceWith: { $mergeObjects: ['$_id', { harga: { $round: ['$harga', 0] } }] } },
      { $sort: { komoditas: 1, bulan: 1 } },
    ]),
    HargaKonsumenNasional.aggregate([
      { $match: yearMatch },
      { $group: { _id: { komoditas: '$komoditas', bulan: '$bulan' }, harga: { $avg: '$harga' } } },
      { $replaceWith: { $mergeObjects: ['$_id', { harga: { $round: ['$harga', 0] } }] } },
      { $sort: { komoditas: 1, bulan: 1 } },
    ]),
    HargaProdusenNasional.aggregate([
      { $match: pf },
      { $group: { _id: { komoditas: '$komoditas' }, harga: { $avg: '$harga' } } },
      { $replaceWith: { $mergeObjects: ['$_id', { harga: { $round: ['$harga', 0] } }] } },
      { $sort: { harga: -1 } },
    ]),
    SkorPPH.find().sort({ tahun: 1 }).select('tahun pph_ketersediaan keterangan').lean().limit(50),
    HargaProdusenProvinsi.aggregate([
      { $match: pf },
      { $group: { _id: '$nama_provinsi', harga: { $avg: '$harga' } } },
      { $replaceWith: { provinsi: '$_id', harga: { $round: ['$harga', 0] } } },
      { $sort: { provinsi: 1 } },
    ]),
  ]);

  // Separate margin query — uses original grouping by {bulan, komoditas}
  const marginTrend = await Promise.all([
    HargaProdusenNasional.aggregate([
      { $match: yearMatch },
      { $group: { _id: { bulan: '$bulan', komoditas: '$komoditas' }, harga: { $avg: '$harga' } } },
      { $replaceWith: { $mergeObjects: ['$_id', { harga: '$harga' }] } },
      { $sort: { bulan: 1 } },
    ]),
    HargaKonsumenNasional.aggregate([
      { $match: yearMatch },
      { $group: { _id: { bulan: '$bulan', komoditas: '$komoditas' }, harga: { $avg: '$harga' } } },
      { $replaceWith: { $mergeObjects: ['$_id', { harga: '$harga' }] } },
      { $sort: { bulan: 1 } },
    ]),
  ]);

  // Build per-commodity margin with normalized komoditas matching
  const marginRows = [];
  for (const p of marginTrend[0]) {
    const pBulan = normBulan(p.bulan);
    const normP = normMarginKomoditas(p.komoditas);
    const c = marginTrend[1].find(x =>
      normBulan(x.bulan) === pBulan && (
        x.komoditas === p.komoditas ||
        x.komoditas === normP ||
        x.komoditas.startsWith(normP) ||
        x.komoditas.includes(normP)
      )
    );
    marginRows.push({
      bulan: pBulan,
      produsen: Math.round(p.harga),
      konsumen: c ? Math.round(c.harga) : 0,
      margin: c ? Math.round(c.harga - p.harga) : 0,
    });
  }

  // Aggregate by month
  const byMonth = {};
  for (const r of marginRows) {
    if (!byMonth[r.bulan]) byMonth[r.bulan] = { bulan: r.bulan, produsen: 0, konsumen: 0, margin: 0, count: 0 };
    byMonth[r.bulan].produsen += r.produsen;
    byMonth[r.bulan].konsumen += r.konsumen;
    byMonth[r.bulan].margin += r.margin;
    byMonth[r.bulan].count += 1;
  }
  const marginByMonthArr = Object.values(byMonth).map(d => ({
    bulan: d.bulan,
    produsen: Math.round(d.produsen / d.count),
    konsumen: Math.round(d.konsumen / d.count),
    margin: Math.round(d.margin / d.count),
  })).sort((a, b) => BULAN_ORDER.indexOf(a.bulan) - BULAN_ORDER.indexOf(b.bulan));

  return {
    chartProducerTrend: producerTrend,
    chartConsumerTrend: consumerTrend,
    chartCommodityRanking: commodityRanking,
    chartPphScore: pphTrend,
    chartMarginTrend: marginByMonthArr,
    chartProvPriceDist: provPriceDist,
  };
}

/* ─── Market Analytics ──────────────────────────────────────── */

async function computeMarketAnalytics(filters) {
  const pf = buildMatch(filters);

  const [supplyDemand, commodityBalance, opportunityRanking, cppdRanking] = await Promise.all([
    ProyeksiNeraca.aggregate([
      { $match: { ...pf, tingkat: 'Nasional' } },
      { $group: { _id: '$bulan', ketersediaan: { $sum: '$ketersediaan' }, kebutuhan: { $sum: '$kebutuhan' } } },
      { $addFields: { surplus: { $subtract: ['$ketersediaan', '$kebutuhan'] } } },
      { $replaceWith: { bulan: '$_id', ketersediaan: '$ketersediaan', kebutuhan: '$kebutuhan', surplus: '$surplus' } },
      { $sort: { bulan: 1 } },
    ]),
    ProyeksiNeraca.aggregate([
      { $match: { ...pf, tingkat: 'Nasional' } },
      { $group: { _id: { komoditas: '$komoditas' }, ketersediaan: { $sum: '$ketersediaan' }, kebutuhan: { $sum: '$kebutuhan' } } },
      { $addFields: { surplus: { $subtract: ['$ketersediaan', '$kebutuhan'] } } },
      { $replaceWith: { $mergeObjects: ['$_id', { ketersediaan: '$ketersediaan', kebutuhan: '$kebutuhan', surplus: '$surplus' }] } },
      { $sort: { surplus: -1 } },
    ]),
    HargaProdusenProvinsi.aggregate([
      { $match: pf },
      { $group: { _id: '$nama_provinsi', harga: { $avg: '$harga' } } },
      { $replaceWith: { provinsi: '$_id', harga: { $round: ['$harga', 0] } } },
      { $sort: { harga: -1 } },
      { $limit: 20 },
    ]),
    CadanganPanganProvinsi.aggregate([
      { $match: pf },
      { $group: { _id: { wilayah: '$wilayah' }, ton: { $sum: '$cppd_ton' } } },
      { $replaceWith: { $mergeObjects: ['$_id', { ton: { $round: ['$ton', 2] } }] } },
      { $sort: { ton: -1 } },
      { $limit: 20 },
    ]),
  ]);

  return {
    chartSupplyDemand: supplyDemand,
    chartCommodityBalance: commodityBalance,
    chartOpportunity: opportunityRanking,
    chartCppd: cppdRanking,
  };
}

/* ─── Map Data ──────────────────────────────────────────────── */

async function computeMapData(filters) {
  const pf = buildMatch(filters);

  const [producer, consumer, balance, opportunity] = await Promise.all([
    HargaProdusenProvinsi.aggregate([
      { $match: pf },
      { $group: { _id: { provinsi: '$nama_provinsi' }, harga: { $avg: '$harga' } } },
      { $replaceWith: { $mergeObjects: ['$_id', { harga: { $round: ['$harga', 0] } }] } },
    ]),
    HargaKonsumenProvinsi.aggregate([
      { $match: pf },
      { $group: { _id: { provinsi: '$nama_provinsi' }, harga: { $avg: '$harga' } } },
      { $replaceWith: { $mergeObjects: ['$_id', { harga: { $round: ['$harga', 0] } }] } },
    ]),
    ProyeksiNeraca.aggregate([
      { $match: { ...pf, tingkat: 'Nasional' } },
      { $group: { _id: null, ketersediaan: { $sum: '$ketersediaan' }, kebutuhan: { $sum: '$kebutuhan' } } },
    ]),
    HargaProdusenProvinsi.aggregate([
      { $match: pf },
      { $group: { _id: '$nama_provinsi', harga: { $avg: '$harga' } } },
      { $replaceWith: { provinsi: '$_id', harga: { $round: ['$harga', 0] } } },
      { $sort: { harga: -1 } },
      { $limit: 38 },
    ]),
  ]);

  const b = balance[0] || { ketersediaan: 0, kebutuhan: 0 };

  const marginMap = producer.map(p => {
    const c = consumer.find(x => x.provinsi === p.provinsi);
    return { provinsi: p.provinsi, margin: c ? c.harga - p.harga : 0 };
  });

  return { mapProducer: producer, mapConsumer: consumer, mapMargin: marginMap, mapBalance: [{ surplus: b.ketersediaan - b.kebutuhan }], mapOpportunity: opportunity };
}

/* ─── Tables ════════════════════════════════════════════ */

async function computeTables(filters, pagination) {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;
  const pf = buildMatch(filters);
  delete pf.komoditas;

  const [priceRaw, priceTotal, consRaw, consTotal, neracaRaw, neracaTotal, balanceRaw, balanceTotal] = await Promise.all([
    HargaProdusenNasional.find(pf).sort({ tahun: -1 }).skip(skip).limit(limit).lean(),
    HargaProdusenNasional.countDocuments(pf),
    HargaKonsumenNasional.find(pf).sort({ tahun: -1 }).skip(skip).limit(limit).lean(),
    HargaKonsumenNasional.countDocuments(pf),
    ProyeksiNeraca.find({ ...pf, tingkat: 'Nasional' }).sort({ tahun: -1, bulan: -1 }).skip(skip).limit(limit).lean(),
    ProyeksiNeraca.countDocuments({ ...pf, tingkat: 'Nasional' }),
    ProyeksiNeraca.find({ ...pf, tingkat: 'Nasional' }).sort({ neraca: -1 }).skip(skip).limit(limit).lean(),
    ProyeksiNeraca.countDocuments({ ...pf, tingkat: 'Nasional' }),
  ]);

  const toPage = (d, t) => ({ data: d, total: t, page, limit, totalPages: Math.ceil(t / limit) });

  return {
    tablePrices: toPage(priceRaw, priceTotal),
    tableConsumer: toPage(consRaw, consTotal),
    tableBalance: toPage(neracaRaw, neracaTotal),
    tableMarket: toPage(balanceRaw, balanceTotal),
    tableCommodity: { data: [], total: 0, page, limit, totalPages: 0 },
  };
}
