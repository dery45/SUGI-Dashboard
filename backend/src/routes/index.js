const express = require('express');
const router = express.Router();

const farmerRoutes = require('./farmerRoutes');
const governmentRoutes = require('./governmentRoutes');
const sharedRoutes = require('./sharedRoutes');
const managementDashboardRoutes = require('./managementDashboardRoutes');
const lifecycleRoutes = require('./lifecycleRoutes');
const salesRoutes = require('./salesRoutes');
const expenseRoutes = require('./expenseRoutes');
const farmerManagementRoutes = require('./farmerManagementRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const authRoutes = require('./authRoutes');
const masterDataRoutes = require('./masterDataRoutes');
const assignmentRoutes = require('./assignmentRoutes');

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
const bulkImportRoutes = require('./bulkImportRoutes');
const settingsRoutes = require('./settingsRoutes');
const filterRoutes = require('./filterRoutes');
const insightRoutes = require('./insightRoutes');

router.use('/auth', authRoutes);
router.use('/master-data', masterDataRoutes);
router.use('/assignments', assignmentRoutes);

router.use('/bulk-import', bulkImportRoutes);
router.use('/farmer', farmerRoutes);
router.use('/government', governmentRoutes);
router.use('/shared', sharedRoutes);
router.use('/management', managementDashboardRoutes);
router.use('/lifecycle', lifecycleRoutes);
router.use('/sales', salesRoutes);
router.use('/expenses', expenseRoutes);
router.use('/farmers', farmerManagementRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/settings', settingsRoutes);
router.use('/filters', filterRoutes);
router.use('/insights', insightRoutes);

router.use('/master/ketidakcukupan-nasional', ketidakcukupanNasionalRoutes);
router.use('/master/ketidakcukupan-provinsi', ketidakcukupanProvinsiRoutes);
router.use('/master/konsumsi-per-jenis', konsumsiPerJenisRoutes);
router.use('/master/penyaluran-donasi', penyaluranDonasiRoutes);
router.use('/master/proyeksi-neraca', proyeksiNeracaRoutes);
router.use('/master/gerakan-pangan-murah', gerakanPanganMurahRoutes);
router.use('/master/harga-konsumen-provinsi', hargaKonsumenProvinsiRoutes);
router.use('/master/harga-konsumen-nasional', hargaKonsumenNasionalRoutes);
router.use('/master/harga-produsen-nasional', hargaProdusenNasionalRoutes);
router.use('/master/harga-produsen-provinsi', hargaProdusenProvinsiRoutes);
router.use('/master/skor-pph', skorPPHRoutes);
router.use('/master/pangan-terselamatkan', panganTerselamatkanRoutes);
router.use('/master/cadangan-pangan-provinsi', cadanganPanganProvinsiRoutes);

module.exports = router;
