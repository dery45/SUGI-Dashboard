const fs = require('fs');
const path = require('path');

const datasets = [
  { name: 'KetidakcukupanNasional', camel: 'ketidakcukupanNasional', schema: "tahun: { type: String, required: true }, pou: { type: String, required: true }, jumlah_penduduk: { type: Number, required: true }, penduduk_undernourish: { type: Number, required: true }" },
  { name: 'KetidakcukupanProvinsi', camel: 'ketidakcukupanProvinsi', schema: "tahun: { type: String, required: true }, kode_provinsi: { type: String, required: true }, provinsi: { type: String, required: true }, pou: { type: String, required: true }, jumlah_penduduk: { type: Number, required: true }, penduduk_undernourish: { type: Number, required: true }" },
  { name: 'KonsumsiPerJenis', camel: 'konsumsiPerJenis', schema: "kelompok_bahan_pangan: { type: String, required: true }, komoditas: { type: String, required: true }, konsumsi_pangan: { type: String, required: true }, satuan: { type: String, required: true }, tahun: { type: String, required: true }" },
  { name: 'PenyaluranDonasi', camel: 'penyaluranDonasi', schema: "tahun: { type: String, required: true }, bulan: { type: String, required: true }, jumlah_donasi_kg: { type: Number, required: true }, penerima_manfaat_jiwa: { type: Number, required: true }" },
  { name: 'ProyeksiNeraca', camel: 'proyeksiNeraca', schema: "tahun: { type: String, required: true }, bulan: { type: String, required: true }, status: { type: String, required: true }, tingkat: { type: String, required: true }, komoditas: { type: String, required: true }, ketersediaan: { type: Number, required: true }, kebutuhan: { type: Number, required: true }, neraca: { type: Number, required: true }, satuan: { type: String, required: true }" },
  { name: 'GerakanPanganMurah', camel: 'gerakanPanganMurah', schema: "tahun: { type: String, required: true }, bulan: { type: String, required: true }, provinsi: { type: String, required: true }, kode_provinsi: { type: String, required: true }, kab_kota: { type: String, required: true }, kode_kab_kota: { type: String, required: true }, pelaksana: { type: Number, required: true }" },
  { name: 'HargaKonsumenProvinsi', camel: 'hargaKonsumenProvinsi', schema: "kode_provinsi: { type: String, required: true }, nama_provinsi: { type: String, required: true }, komoditas: { type: String, required: true }, tahun: { type: String, required: true }, bulan: { type: String, required: true }, harga: { type: Number, required: true }" },
  { name: 'HargaKonsumenNasional', camel: 'hargaKonsumenNasional', schema: "komoditas: { type: String, required: true }, tahun: { type: String, required: true }, bulan: { type: String, required: true }, harga: { type: Number, required: true }" },
  { name: 'HargaProdusenNasional', camel: 'hargaProdusenNasional', schema: "komoditas: { type: String, required: true }, tahun: { type: String, required: true }, bulan: { type: String, required: true }, harga: { type: Number, required: true }" },
  { name: 'HargaProdusenProvinsi', camel: 'hargaProdusenProvinsi', schema: "kode_provinsi: { type: String, required: true }, nama_provinsi: { type: String, required: true }, komoditas: { type: String, required: true }, tahun: { type: String, required: true }, bulan: { type: String, required: true }, harga: { type: Number, required: true }" },
  { name: 'VariasiHargaProdusen', camel: 'variasiHargaProdusen', schema: "kode_wilayah: { type: String, required: true }, provinsi: { type: String, required: true }, komoditas: { type: String, required: true }, tahun: { type: String, required: true }, bulan: { type: String, required: true }, koefisien_variasi: { type: Number, required: true }" },
  { name: 'SkorPPH', camel: 'skorPPH', schema: "tahun: { type: String, required: true }, pph_ketersediaan: { type: String, required: true }, keterangan: { type: String, required: true }" },
  { name: 'PanganTerselamatkan', camel: 'panganTerselamatkan', schema: "tahun: { type: String, required: true }, bulan: { type: String, required: true }, jumlah_donasi_kg: { type: Number, required: true }" },
  { name: 'CadanganPanganProvinsi', camel: 'cadanganPanganProvinsi', schema: "tahun: { type: String, required: true }, bulan: { type: String, required: true }, kode_wilayah: { type: String, required: true }, wilayah: { type: String, required: true }, cppd_ton: { type: Number, required: true }" }
];

const basePath = path.join(__dirname, 'src');

datasets.forEach(ds => {
  // Generate Model
  const modelContent = "const mongoose = require('mongoose');\n" +
"\n" +
"const schema = new mongoose.Schema({\n" +
"  " + ds.schema + "\n" +
"}, { timestamps: true });\n" +
"\n" +
"module.exports = mongoose.model('" + ds.name + "', schema);\n";
  fs.writeFileSync(path.join(basePath, 'models', ds.name + '.js'), modelContent);

  // Generate Controller
  const controllerContent = "const " + ds.name + " = require('../models/" + ds.name + "');\n" +
"\n" +
"// Create\n" +
"exports.create" + ds.name + " = async (req, res) => {\n" +
"  try {\n" +
"    const newData = new " + ds.name + "(req.body);\n" +
"    await newData.save();\n" +
"    res.status(201).json(newData);\n" +
"  } catch (err) {\n" +
"    res.status(400).json({ error: err.message });\n" +
"  }\n" +
"};\n" +
"\n" +
"// Read Action\n" +
"exports.get" + ds.name + " = async (req, res) => {\n" +
"  try {\n" +
"    const data = await " + ds.name + ".find().sort({ createdAt: -1 });\n" +
"    res.status(200).json(data);\n" +
"  } catch (err) {\n" +
"    res.status(500).json({ error: err.message });\n" +
"  }\n" +
"};\n" +
"\n" +
"// Update\n" +
"exports.update" + ds.name + " = async (req, res) => {\n" +
"  try {\n" +
"    const updatedData = await " + ds.name + ".findByIdAndUpdate(req.params.id, req.body, { new: true });\n" +
"    if (!updatedData) return res.status(404).json({ error: 'Data not found' });\n" +
"    res.status(200).json(updatedData);\n" +
"  } catch (err) {\n" +
"    res.status(400).json({ error: err.message });\n" +
"  }\n" +
"};\n" +
"\n" +
"// Delete\n" +
"exports.delete" + ds.name + " = async (req, res) => {\n" +
"  try {\n" +
"    const deletedData = await " + ds.name + ".findByIdAndDelete(req.params.id);\n" +
"    if (!deletedData) return res.status(404).json({ error: 'Data not found' });\n" +
"    res.status(200).json({ message: 'Data deleted successfully' });\n" +
"  } catch (err) {\n" +
"    res.status(500).json({ error: err.message });\n" +
"  }\n" +
"};\n";
  fs.writeFileSync(path.join(basePath, 'controllers', ds.camel + 'Controller.js'), controllerContent);

  // Generate Route
  const routeContent = "const express = require('express');\n" +
"const router = express.Router();\n" +
"const " + ds.camel + "Controller = require('../controllers/" + ds.camel + "Controller');\n" +
"\n" +
"router.post('/', " + ds.camel + "Controller.create" + ds.name + ");\n" +
"router.get('/', " + ds.camel + "Controller.get" + ds.name + ");\n" +
"router.put('/:id', " + ds.camel + "Controller.update" + ds.name + ");\n" +
"router.delete('/:id', " + ds.camel + "Controller.delete" + ds.name + ");\n" +
"\n" +
"module.exports = router;\n";
  fs.writeFileSync(path.join(basePath, 'routes', ds.camel + 'Routes.js'), routeContent);
});

console.log('Successfully generated models, controllers, and routes for 14 datasets.');
