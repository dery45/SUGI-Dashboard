const express = require('express');
const router = express.Router();

const ketidakcukupanNasionalRoutes = require('./ketidakcukupanNasionalRoutes');
const ketidakcukupanProvinsiRoutes = require('./ketidakcukupanProvinsiRoutes');
const konsumsiPerJenisRoutes = require('./konsumsiPerJenisRoutes');
const penyaluranDonasiRoutes = require('./penyaluranDonasiRoutes');
const proyeksiNeracaRoutes = require('./proyeksiNeracaRoutes');
const gerakanPanganMurahRoutes = require('./gerakanPanganMurahRoutes');
const hargaKonsumenProvinsiRoutes = require('./hargaKonsumenProvinsiRoutes');
const hargaKonsumenNasionalRoutes = require('./hargaKonsumenNasionalRoutes');
const hargaProdusenNasionalRoutes = require('./hargaProdusenNasionalRoutes');
const hargaProdusenProvinsiRoutes = require('./hargaProdusenProvinsiRoutes');
const skorPPHRoutes = require('./skorPPHRoutes');
const panganTerselamatkanRoutes = require('./panganTerselamatkanRoutes');
const cadanganPanganProvinsiRoutes = require('./cadanganPanganProvinsiRoutes');

router.use('/ketidakcukupan-nasional', ketidakcukupanNasionalRoutes);
router.use('/ketidakcukupan-provinsi', ketidakcukupanProvinsiRoutes);
router.use('/konsumsi-per-jenis', konsumsiPerJenisRoutes);
router.use('/penyaluran-donasi', penyaluranDonasiRoutes);
router.use('/proyeksi-neraca', proyeksiNeracaRoutes);
router.use('/gerakan-pangan-murah', gerakanPanganMurahRoutes);
router.use('/harga-konsumen-provinsi', hargaKonsumenProvinsiRoutes);
router.use('/harga-konsumen-nasional', hargaKonsumenNasionalRoutes);
router.use('/harga-produsen-nasional', hargaProdusenNasionalRoutes);
router.use('/harga-produsen-provinsi', hargaProdusenProvinsiRoutes);
router.use('/skor-pph', skorPPHRoutes);
router.use('/pangan-terselamatkan', panganTerselamatkanRoutes);
router.use('/cadangan-pangan-provinsi', cadanganPanganProvinsiRoutes);

module.exports = router;