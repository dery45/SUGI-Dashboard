import React, { useState } from 'react';
import Card from '../components/common/Card';
import LineChart from '../components/charts/LineChart';
import BarChart from '../components/charts/BarChart';
import PieChart from '../components/charts/PieChart';
import DataTable from '../components/common/DataTable';
import IndonesiaMap from '../components/map/IndonesiaMap';
import { foodSecurityData } from '../data/mockData';

const GovernmentDashboard = () => {
  const [selectedMap, setSelectedMap] = useState('pou');

  const mapConfig = {
    produsen: {
      data: foodSecurityData.hargaProdusenProv.filter(d => d.harga !== null),
      valueKey: 'harga',
      unit: 'Rp'
    },
    konsumen: {
      data: foodSecurityData.hargaKonsumenProv,
      valueKey: 'harga',
      unit: 'Rp'
    },
    pou: {
      data: foodSecurityData.pouProvinsi,
      valueKey: 'pou',
      unit: '%'
    }
  };

  const currentMap = mapConfig[selectedMap];
  const donationColumns = [
    { header: 'Bulan', accessor: 'bulan' },
    { header: 'Donasi (Kg)', accessor: 'donasi_kg' },
    { header: 'Penerima Manfaat', accessor: 'penerima' }
  ];

  const cppdColumns = [
    { header: 'Wilayah', accessor: 'wilayah' },
    { header: 'Cadangan (Ton)', accessor: 'ton' }
  ];

  const interventionsColumns = [
    { header: 'Wilayah', accessor: 'provinsi' },
    { header: 'Kab/Kota', accessor: 'kab_kota' },
    { header: 'Jumlah Implementasi', accessor: 'jumlah' }
  ];

  const pouColumns = [
    { header: 'Tahun', accessor: 'tahun' },
    { header: 'PoU (%)', accessor: 'pou' },
    { header: 'Undernourished (Jiwa)', accessor: 'undernourish' }
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-12">
      <div className="bg-surface/40 backdrop-blur-md p-6 rounded-[2rem] border border-border/40 flex flex-col gap-1 shadow-sm">
        <h1 className="text-2xl font-black text-foreground tracking-tight">Dashboard Pemerintah 🏛️</h1>
        <p className="text-muted text-xs font-bold opacity-50 uppercase tracking-widest">National Food Security Analysis — 2018-2026</p>
      </div>

      {/* FULL WIDTH MAP */}
      <Card 
        title="Peta Indikator Pangan & Harga" 
        info={"Peta sebaran tingkat ketidakcukupan konsumsi energi (PoU) tiap provinsi.\nSumber: BPS"}
        action={
          <select 
            value={selectedMap} 
            onChange={(e) => setSelectedMap(e.target.value)}
            className="bg-background border border-border text-foreground rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary outline-none cursor-pointer w-full max-w-md"
          >
            <option value="produsen">Peta Sebaran Harga GKP Tingkat produsen per Provinsi (Rp/Kg)</option>
            <option value="konsumen">Peta Sebaran Harga GKP Tingkat konsumen per Provinsi (Rp/Kg)</option>
            <option value="pou">Peta Persebaran Ketidakcukupan Konsumsi Pangan (PoU % per Provinsi)</option>
          </select>
        }
        className="w-full"
      >
        <div className="w-full min-h-[500px]">
          <IndonesiaMap 
            provinceData={currentMap.data} 
            valueKey={currentMap.valueKey} 
            unit={currentMap.unit} 
          />
        </div>
      </Card>

      {/* 5 CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
        {/* Chart 1 */}
        <Card 
          title="1. Trend Ketidakcukupan Konsumsi Nasional (PoU %)"
          info={"Tren proporsi penduduk dengan asupan kalori kurang dari kebutuhan minimum.\nSumber Data: BPS"}
        >
          <div className="h-[300px]">
            <LineChart 
              data={foodSecurityData.pouNasional} 
              xKey="tahun" 
              lineKeys={['pou']} 
              colors={['#ef4444']} 
            />
          </div>
        </Card>
        
        {/* Chart 2 */}
        <Card 
          title="2. Proyeksi Neraca Beras Nasional 2026 (Ton)"
          info={"Perbandingan antara ketersediaan dan kebutuhan beras untuk memastikan pasokan aman.\nSumber Data: Kementerian Pertanian/Bapanas"}
        >
          <div className="h-[300px]">
            <BarChart 
              data={foodSecurityData.proyeksiNeraca} 
              xKey="bulan" 
              barKeys={['ketersediaan', 'kebutuhan']} 
              colors={['#10b981', '#6366f1']}
            />
          </div>
        </Card>

        {/* Chart 3 */}
        <Card 
          title="3. Skor Pola Pangan Harapan Nasional"
          info={"Indikator mutu dan keragaman konsumsi pangan penduduk.\nSumber Data: Bapanas & BPS"}
        >
          <div className="h-[300px]">
             <LineChart 
              data={foodSecurityData.skorPPH} 
              xKey="tahun" 
              lineKeys={['skor']} 
              colors={['#0ea5e9']} 
            />
          </div>
        </Card>

        {/* Chart 4 */}
        <Card 
          title="4. Indeks Konsumsi per Jenis Pangan (Beras, Jagung, dll)"
          info={"Pangsa konsumsi masyarakat berdasarkan kelompok dan jenis komoditas.\nSumber Data: Susenas BPS"}
        >
          <div className="h-[300px] flex items-center justify-center">
            <PieChart data={foodSecurityData.konsumsiPangan} nameKey="komoditas" dataKey="nilai" />
          </div>
        </Card>

        {/* Chart 5 */}
        <Card 
          className="lg:col-span-2" 
          title="5. Jumlah Pangan Terselamatkan (Kg) 2026"
          info={"Jumlah food waste/loss yang berhasil diselamatkan dan didistribusikan lewat donasi pangan.\nSumber Data: Sistem Pemantauan Pangan"}
        >
          <div className="h-[300px]">
            <BarChart 
              data={foodSecurityData.panganTerselamatkan} 
              xKey="bulan" 
              barKeys={['kg']} 
              colors={['#8b5cf6']}
            />
          </div>
        </Card>
      </div>

      {/* TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
        <Card title="Data Ketidakcukupan Konsumsi Nasional">
          <DataTable columns={pouColumns} data={foodSecurityData.pouNasional} showSearch={false} />
        </Card>
        <Card title="Daftar Cadangan Pangan Pemerintah Daerah (CPPD)">
          <DataTable columns={cppdColumns} data={foodSecurityData.cppdProvinsi} showSearch={false} />
        </Card>
        <Card title="Realisasi Gerakan Pangan Murah (2026)">
          <DataTable columns={interventionsColumns} data={foodSecurityData.gerakanPanganMurah} showSearch={false} />
        </Card>
        <Card title="Penyaluran Donasi Pangan (2024)">
          <DataTable columns={donationColumns} data={foodSecurityData.donasiPangan} showSearch={false} />
        </Card>
      </div>

      {/* NEW SEARCHABLE TABLES */}
      <div className="flex flex-col gap-12 mt-12 border-t border-border/20 pt-12">
        <div className="px-2">
          <h2 className="text-xl font-black text-foreground tracking-tight uppercase tracking-wider">Laporan Harga Pangan Provinsi</h2>
          <p className="text-muted text-xs mt-0.5 font-medium opacity-50">Rekapitulasi Nasional Harga Produsen & Konsumen</p>
        </div>

        <DataTable 
          title="Harga GKP Produsen" 
          subtitle="Data perbandingan harga di tingkat petani per provinsi secara nasional"
          columns={[
            { header: 'Provinsi', accessor: 'provinsi' },
            { header: 'Komoditas', accessor: 'komoditas' },
            { header: 'Harga (Rp/Kg)', accessor: 'harga', format: (val) => `Rp ${val.toLocaleString()}` }
          ]} 
          data={foodSecurityData.hargaProdusenProv.filter(d => d.harga !== null)} 
          itemsPerPage={10}
        />

        <DataTable 
          title="Harga GKP Konsumen" 
          subtitle="Data perbandingan harga di tingkat ritel/konsumen per provinsi secara nasional"
          columns={[
            { header: 'Provinsi', accessor: 'provinsi' },
            { header: 'Komoditas', accessor: 'komoditas' },
            { header: 'Harga (Rp/Kg)', accessor: 'harga', format: (val) => `Rp ${val.toLocaleString()}` }
          ]} 
          data={foodSecurityData.hargaKonsumenProv} 
          itemsPerPage={10}
        />
      </div>
    </div>
  );
};

export default GovernmentDashboard;
