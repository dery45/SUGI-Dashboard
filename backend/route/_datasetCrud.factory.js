const express = require('express');
const { authenticate, isGovernment } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     DatasetEntity:
 *       type: object
 *       description: A food-security dataset document. Field names vary per dataset (e.g. skor-pph has `tahun`, `pph_ketersediaan`; harga-produsen-nasional has `komoditas`, `bulan`, `harga`, ...). See the dataset model for the authoritative field set.
 *       properties:
 *         _id: { type: string }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     DatasetEnvelope:
 *       type: object
 *       description: Shared envelope for all dataset CRUD responses (see _datasetCrud.factory.js — the 13 dataset routes are generated from this single generic pattern).
 *       properties:
 *         success: { type: boolean, example: true }
 *         data: { oneOf: [{ type: array, items: { $ref: '#/components/schemas/DatasetEntity' } }, { $ref: '#/components/schemas/DatasetEntity' }] }
 *         total: { type: integer }
 *         page: { type: integer }
 *         limit: { type: integer }
 *         totalPages: { type: integer }
 * security:
 *   - bearerAuth: []
 * description: >-
 *   GENERIC DATASET CRUD FACTORY — one pattern, applied to all 13 dataset slugs.
 *
 *   Every slug under `/master/<slug>` exposes exactly five operations, all
 *   guarded by `authenticate` + `isGovernment` (superadmin, government):
 *   GET /  (paginated list: ?page=&limit=&search=&year=&month=...), GET /{id},
 *   POST / (create), PUT /{id} (update), DELETE /{id}.
 *
 *   The 13 slugs are: ketidakcukupan-nasional, ketidakcukupan-provinsi,
 *   konsumsi-per-jenis, penyaluran-donasi, proyeksi-neraca,
 *   gerakan-pangan-murah, harga-konsumen-provinsi, harga-konsumen-nasional,
 *   harga-produsen-nasional, harga-produsen-provinsi, skor-pph,
 *   pangan-terselamatkan, cadangan-pangan-provinsi.
 *
 *   Per-slug entries are generated from this single documented pattern; refer
 *   to `DatasetEnvelope` / `DatasetEntity` for the shared shapes.
 */

function createDatasetRoutes(controller) {
  const router = express.Router();

  router.use(authenticate);

  router.get('/', isGovernment, controller.list);
  router.get('/:id', isGovernment, controller.getById);
  router.post('/', isGovernment, controller.create);
  router.put('/:id', isGovernment, controller.update);
  router.delete('/:id', isGovernment, controller.remove);

  return router;
}

module.exports = createDatasetRoutes;
