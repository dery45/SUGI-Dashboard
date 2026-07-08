const KetidakcukupanNasional = require('../models/KetidakcukupanNasional');
const KetidakcukupanProvinsi = require('../models/KetidakcukupanProvinsi');
const KonsumsiPerJenis = require('../models/KonsumsiPerJenis');
const PenyaluranDonasi = require('../models/PenyaluranDonasi');
const ProyeksiNeraca = require('../models/ProyeksiNeraca');
const GerakanPanganMurah = require('../models/GerakanPanganMurah');
const HargaKonsumenProvinsi = require('../models/HargaKonsumenProvinsi');
const HargaKonsumenNasional = require('../models/HargaKonsumenNasional');
const HargaProdusenNasional = require('../models/HargaProdusenNasional');
const HargaProdusenProvinsi = require('../models/HargaProdusenProvinsi');
const VariasiHargaProdusen = require('../models/VariasiHargaProdusen');
const SkorPPH = require('../models/SkorPPH');
const PanganTerselamatkan = require('../models/PanganTerselamatkan');
const CadanganPanganProvinsi = require('../models/CadanganPanganProvinsi');

function safeParseNum(val) {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

const getFarmerDashboard = async (req, res) => {
  try {
    const [
      hargaProdusenNasional,
      hargaKonsumenNasional,
      variasi,
      hargaKonsumenProv,
      hargaProdusenProv,
      proyeksiNeraca,
      pouProvinsi
    ] = await Promise.all([
      HargaProdusenNasional.find().sort({ tahun: -1, bulan: -1 }).lean().limit(100),
      HargaKonsumenNasional.find().sort({ tahun: -1, bulan: -1 }).lean().limit(100),
      VariasiHargaProdusen.find().sort({ tahun: -1, bulan: -1 }).lean().limit(100),
      HargaKonsumenProvinsi.find().sort({ tahun: -1, bulan: -1 }).lean().limit(100),
      HargaProdusenProvinsi.find().sort({ tahun: -1, bulan: -1 }).lean().limit(100),
      ProyeksiNeraca.find().sort({ tahun: -1, bulan: -1 }).lean().limit(100),
      KetidakcukupanProvinsi.find().sort({ tahun: -1 }).lean().limit(100)
    ]);

    const gkpNasional = hargaProdusenNasional.find(
      h => h.komoditas && h.komoditas.toLowerCase().includes('gkp')
    );
    const hargaGKP = gkpNasional ? gkpNasional.harga : 4889;

    let mostStable = null;
    let minCv = Infinity;
    for (const v of variasi) {
      const cv = safeParseNum(v.koefisien_variasi);
      if (cv > 0 && cv < minCv) {
        minCv = cv;
        mostStable = v;
      }
    }

    const latestKonsumen = hargaKonsumenNasional.length > 0
      ? hargaKonsumenNasional.reduce((a, b) =>
          (a.harga || 0) > (b.harga || 0) ? a : b
        )
      : null;

    const latestYear = hargaProdusenNasional.length > 0
      ? hargaProdusenNasional[0].tahun || '2026'
      : '2026';
    const latestMonth = hargaProdusenNasional.length > 0
      ? hargaProdusenNasional[0].bulan || 'Januari'
      : 'Januari';

    res.json({
      success: true,
      data: {
        stats: {
          gkpNasional: { harga: hargaGKP },
          mostStable: mostStable
            ? { provinsi: mostStable.provinsi, cv: minCv }
            : { provinsi: 'DI Yogyakarta', cv: 3.20 },
          komoditasUtama: latestKonsumen
            ? { komoditas: latestKonsumen.komoditas, harga: latestKonsumen.harga, tahun: latestYear, bulan: latestMonth }
            : { komoditas: 'Beras Premium', harga: 12319, tahun: '2026', bulan: 'Januari' }
        },
        hargaProdusenNasional: hargaProdusenNasional.map(h => ({
          komoditas: h.komoditas,
          harga: h.harga
        })),
        hargaKonsumenNasional: hargaKonsumenNasional.map(h => ({
          komoditas: h.komoditas,
          harga: h.harga
        })),
        koefisienVariasi: variasi.map(v => ({
          provinsi: v.provinsi,
          cv: safeParseNum(v.koefisien_variasi)
        })),
        hargaKonsumenProv: hargaKonsumenProv.map(h => ({
          provinsi: h.nama_provinsi,
          komoditas: h.komoditas,
          harga: h.harga
        })),
        hargaProdusenProv: hargaProdusenProv.map(h => ({
          provinsi: h.nama_provinsi,
          komoditas: h.komoditas,
          harga: h.harga
        })),
        proyeksiNeraca: proyeksiNeraca.map(p => ({
          bulan: p.bulan,
          ketersediaan: p.ketersediaan,
          kebutuhan: p.kebutuhan,
          neraca: p.neraca
        })),
        pouProvinsi: pouProvinsi.map(p => ({
          provinsi: p.provinsi,
          pou: safeParseNum(p.pou),
          penduduk: p.jumlah_penduduk,
          undernourish: p.penduduk_undernourish
        }))
      }
    });
  } catch (error) {
    console.error('Farmer dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getGovernmentDashboard = async (req, res) => {
  try {
    const [
      pouNasional,
      pouProvinsi,
      konsumsiPangan,
      donasiPangan,
      proyeksiNeraca,
      gerakanPanganMurah,
      skorPPH,
      panganTerselamatkan,
      cppdProvinsi
    ] = await Promise.all([
      KetidakcukupanNasional.find().sort({ tahun: -1 }).lean().limit(100),
      KetidakcukupanProvinsi.find().sort({ tahun: -1 }).lean().limit(100),
      KonsumsiPerJenis.find().sort({ tahun: -1 }).lean().limit(100),
      PenyaluranDonasi.find().sort({ tahun: -1, bulan: -1 }).lean().limit(100),
      ProyeksiNeraca.find().sort({ tahun: -1, bulan: -1 }).lean().limit(100),
      GerakanPanganMurah.find().sort({ tahun: -1, bulan: -1 }).lean().limit(100),
      SkorPPH.find().sort({ tahun: -1 }).lean().limit(100),
      PanganTerselamatkan.find().sort({ tahun: -1, bulan: -1 }).lean().limit(100),
      CadanganPanganProvinsi.find().sort({ tahun: -1, bulan: -1 }).lean().limit(100)
    ]);

    res.json({
      success: true,
      data: {
        pouNasional: pouNasional.map(p => ({
          tahun: p.tahun,
          pou: safeParseNum(p.pou),
          jumlah_penduduk: p.jumlah_penduduk,
          undernourish: p.penduduk_undernourish
        })),
        pouProvinsi: pouProvinsi.map(p => ({
          provinsi: p.provinsi,
          pou: safeParseNum(p.pou),
          penduduk: p.jumlah_penduduk,
          undernourish: p.penduduk_undernourish
        })),
        konsumsiPangan: konsumsiPangan.map(k => ({
          kelompok: k.kelompok_bahan_pangan,
          komoditas: k.komoditas,
          nilai: safeParseNum(k.konsumsi_pangan)
        })),
        donasiPangan: donasiPangan.map(d => ({
          bulan: d.bulan,
          donasi_kg: d.jumlah_donasi_kg,
          penerima: d.penerima_manfaat_jiwa
        })),
        proyeksiNeraca: proyeksiNeraca.map(p => ({
          bulan: p.bulan,
          ketersediaan: p.ketersediaan,
          kebutuhan: p.kebutuhan,
          neraca: p.neraca
        })),
        gerakanPanganMurah: gerakanPanganMurah.map(g => ({
          provinsi: g.provinsi,
          kab_kota: g.kab_kota,
          jumlah: g.pelaksana
        })),
        skorPPH: skorPPH.map(s => ({
          tahun: s.tahun,
          skor: safeParseNum(s.pph_ketersediaan)
        })),
        panganTerselamatkan: panganTerselamatkan.map(p => ({
          bulan: p.bulan,
          kg: p.jumlah_donasi_kg
        })),
        cppdProvinsi: cppdProvinsi.map(c => ({
          wilayah: c.wilayah,
          ton: c.cppd_ton
        }))
      }
    });
  } catch (error) {
    console.error('Government dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getFarmerDashboard, getGovernmentDashboard };
