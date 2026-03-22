import React, { useState } from 'react';
import Card from '../components/common/Card';
import LineChart from '../components/charts/LineChart';
import BarChart from '../components/charts/BarChart';
import DataTable from '../components/common/DataTable';
import IndonesiaMap from '../components/map/IndonesiaMap';
import { foodSecurityData } from '../data/mockData';

const FarmerDashboard = () => {
  const [selectedMap, setSelectedMap] = useState('produsen');

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

  const stats = [
    { label: 'Harga GKP Nasional', value: 'Rp 4,889', sub: '/Kg' },
    { label: 'Target Paling Stabil', value: 'DI Yogyakarta', sub: 'CV 3.20%' },
    { label: 'Komoditas Utama', value: 'Beras Premium', sub: 'Jan 2026' }
  ];

  const cvColumns = [
    { header: 'Provinsi', accessor: 'provinsi' },
    { header: 'Koefisien Variasi (%)', accessor: 'cv' }
  ];

  const priceColumns = [
    { header: 'Provinsi', accessor: 'provinsi' },
    { header: 'Komoditas', accessor: 'komoditas' },
    { header: 'Harga (Rp)', accessor: 'harga' }
  ];

  const priceNasionalColumns = [
    { header: 'Komoditas', accessor: 'komoditas' },
    { header: 'Harga Tingkat Produsen (Rp/Kg)', accessor: 'harga' }
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-12">
      <div className="bg-surface/40 backdrop-blur-md p-6 rounded-[2rem] border border-border/40 flex flex-col gap-1 shadow-sm">
        <h1 className="text-2xl font-black text-foreground tracking-tight">Dashboard Petani 🌾</h1>
        <p className="text-muted text-xs font-bold opacity-50 uppercase tracking-widest">Pricing & Market Stability — Jan 2026</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-surface p-8 rounded-3xl border border-border/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] transition-all duration-300">
            <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-4">{s.label}</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black tracking-tighter text-foreground">{s.value}</span>
              <span className="text-sm font-bold text-muted opacity-50">{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* FULL WIDTH MAP */}
      <Card 
        title="Peta Indikator Pangan & Harga" 
        info={"Visualisasi performa dan harga komoditas utama tiap provinsi.\nSumber: BPS & Panel Harga Bapanas (2026)"}
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1 */}
        <Card 
          title="1. Rata-rata Harga Produsen Nasional (Rp/Kg)"
          info={"Menampilkan rata-rata harga di tingkat produsen (petani/penggilingan) per komoditas secara nasional.\nSumber Data: Panel Harga Bapanas (Jan 2026)"}
        >
          <div className="h-[300px]">
            <BarChart 
              data={foodSecurityData.hargaProdusenNasional} 
              xKey="komoditas" 
              barKeys={['harga']} 
              colors={['#10b981']}
            />
          </div>
        </Card>
        
        {/* Chart 2 */}
        <Card 
          title="2. Harga Konsumen Nasional vs Produsen (Komoditas Utama)"
          info={"Perbandingan antara harga beli konsumen tingkat ritel dan harga pokok.\nSumber Data: Panel Harga Bapanas (Jan 2026)"}
        >
          <div className="h-[300px]">
            <BarChart 
              data={foodSecurityData.hargaKonsumenNasional} 
              xKey="komoditas" 
              barKeys={['harga']} 
              colors={['#f59e0b']}
            />
          </div>
        </Card>
        
        {/* Chart 3 */}
        <Card 
          title="3. Stabilitas Harga (Koefisien Variasi %)"
          info={"Mengukur tingkat fluktuasi harga bulanan antar daerah. Semakin kecil nilainya semakin stabil.\nSumber Data: BPS & Badan Pangan Nasional"}
        >
          <div className="h-[300px]">
            <BarChart 
              data={foodSecurityData.koefisienVariasi.filter(d => d.cv !== null)} 
              xKey="provinsi" 
              barKeys={['cv']} 
              colors={['#0ea5e9']}
            />
          </div>
        </Card>

        {/* Chart 4 */}
        <Card 
          title="4. Harga Konsumen Provinsi (Beras Premium)"
          info={"Pergerakan harga beras premium di tingkat pengecer ditiap provinsi.\nSumber Data: Panel Harga Bapanas"}
        >
          <div className="h-[300px]">
            <LineChart 
              data={foodSecurityData.hargaKonsumenProv} 
              xKey="provinsi" 
              lineKeys={['harga']} 
              colors={['#ef4444']}
            />
          </div>
        </Card>

        {/* Chart 5 */}
        <Card 
          title="5. Harga Produsen (GKP) Provinsi"
          info={"Harga Gabah Kering Panen di tingkat petani pada wilayah-wilayah sentra produksi.\nSumber Data: Panel Harga Bapanas"}
        >
          <div className="h-[300px]">
             <BarChart 
              data={foodSecurityData.hargaProdusenProv.filter(d => d.harga !== null)} 
              xKey="provinsi" 
              barKeys={['harga']} 
              colors={['#8b5cf6']}
            />
          </div>
        </Card>

        {/* Chart 6 */}
        <Card 
          title="6. Proyeksi Neraca Beras Nasional 2026 (Ton)"
          info={"Estimasi neraca dan perbandingan antara total ketersediaan pangan vs kebutuhan beras bulanan secara nasional.\nSumber Data: Kementerian Pertanian & Bapanas"}
        >
          <div className="h-[300px]">
            <BarChart 
              data={foodSecurityData.proyeksiNeraca} 
              xKey="bulan" 
              barKeys={['ketersediaan', 'kebutuhan']} 
              colors={['#14b8a6', '#f43f5e']}
            />
          </div>
        </Card>
      </div>

      {/* TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
        <Card title="Daftar Harga GKP per Provinsi">
          <DataTable columns={priceColumns} data={foodSecurityData.hargaProdusenProv} showSearch={false} />
        </Card>
        <Card title="Harga Konsumen Provinsi (Beras Premium)">
          <DataTable columns={priceColumns} data={foodSecurityData.hargaKonsumenProv} showSearch={false} />
        </Card>
        <Card title="Data Koefisien Variasi Provinsi">
          <DataTable columns={cvColumns} data={foodSecurityData.koefisienVariasi} showSearch={false} />
        </Card>
        <Card title="Data Harga Produsen Nasional">
          <DataTable columns={priceNasionalColumns} data={foodSecurityData.hargaProdusenNasional} showSearch={false} />
        </Card>
      </div>

      {/* NEW SEARCHABLE TABLES */}
      <div className="flex flex-col gap-12 mt-12 border-t border-border/20 pt-12">
        <div className="px-2">
          <h2 className="text-xl font-black text-foreground tracking-tight uppercase tracking-wider">Rincian Data Harga Nasional</h2>
          <p className="text-muted text-xs mt-0.5 font-medium opacity-50">Analisis Mendalam Harga Produsen & Konsumen</p>
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

export default FarmerDashboard;
