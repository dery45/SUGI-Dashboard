import React, { useState } from 'react';
import RecordSaleModal from '../components/management/RecordSaleModal';
import RecordExpenseModal from '../components/management/RecordExpenseModal';

const dummySales = [
  { _id: '1', sale_date: '2026-03-20', farm: 'Blok A - Sumatra',    buyer_name: 'PT Maju Jaya',     buyer_type: 'Mill',       quantity_kg: 5000, price_per_kg: 3800, total_revenue: 19000000, invoice_ref: 'INV-001' },
  { _id: '2', sale_date: '2026-03-15', farm: 'Blok B - Kalimantan', buyer_name: 'Pak Hendra',       buyer_type: 'Middleman',  quantity_kg: 2000, price_per_kg: 3600, total_revenue: 7200000,  invoice_ref: 'INV-002' },
  { _id: '3', sale_date: '2026-03-10', farm: 'Blok A - Sumatra',    buyer_name: 'Dinas Pertanian',  buyer_type: 'Government', quantity_kg: 3000, price_per_kg: 4000, total_revenue: 12000000, invoice_ref: 'INV-003' },
];

const BUYER_COLORS = { Mill: 'bg-blue-100 text-blue-700', Middleman: 'bg-orange-100 text-orange-700', Direct: 'bg-green-100 text-green-700', Government: 'bg-purple-100 text-purple-700' };
const BUYER_LABELS = { Mill: 'Pabrik', Middleman: 'Tengkulak', Direct: 'Langsung', Government: 'Pemerintah' };

const SalesDistributionPage = () => {
  const [sales, setSales] = useState(dummySales);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const showToast = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

  const handleSaveSale = async (data) => {
    const newSale = {
      _id: Date.now().toString(),
      sale_date: data.sale_date,
      farm: data.farm_id === 'farm_1' ? 'Blok A - Sumatra' : 'Blok B - Kalimantan',
      buyer_name: data.buyer_name,
      buyer_type: data.buyer_type,
      quantity_kg: parseFloat(data.quantity_kg),
      price_per_kg: parseFloat(data.price_per_kg),
      total_revenue: parseFloat(data.quantity_kg) * parseFloat(data.price_per_kg),
      invoice_ref: data.invoice_ref || '-',
    };
    setSales(prev => [newSale, ...prev]);
    showToast('Penjualan berhasil dicatat!');
  };

  const totalKg = sales.reduce((s, r) => s + r.quantity_kg, 0);
  const totalRevenue = sales.reduce((s, r) => s + r.total_revenue, 0);
  const avgPrice = totalKg > 0 ? Math.round(totalRevenue / totalKg) : 0;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-[100] bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg text-sm font-medium">
          ✓ {notification}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Penjualan & Distribusi</h1>
          <p className="text-gray-500 text-sm">Catat dan pantau seluruh transaksi penjualan hasil panen</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsExpenseModalOpen(true)} className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 text-sm shadow-sm">
            + Catat Pengeluaran
          </button>
          <button onClick={() => setIsSaleModalOpen(true)} className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 text-sm shadow-sm">
            + Catat Penjualan
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-5 rounded-xl shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Total Pendapatan</p>
          <p className="text-2xl font-black mt-1">Rp {totalRevenue.toLocaleString('id-ID')}</p>
          <p className="text-xs opacity-70 mt-1">{sales.length} transaksi</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-5 rounded-xl shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Total Hasil Terjual</p>
          <p className="text-2xl font-black mt-1">{totalKg.toLocaleString('id-ID')} kg</p>
          <p className="text-xs opacity-70 mt-1">dari {sales.length} transaksi</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-5 rounded-xl shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Harga Rata-rata/Kg</p>
          <p className="text-2xl font-black mt-1">Rp {avgPrice.toLocaleString('id-ID')}</p>
          <p className="text-xs opacity-70 mt-1">rata-rata dari semua penjualan</p>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">📋 Riwayat Penjualan</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Tanggal</th>
                <th className="px-6 py-3 text-left">Farm</th>
                <th className="px-6 py-3 text-left">Pembeli</th>
                <th className="px-6 py-3 text-left">Tipe</th>
                <th className="px-6 py-3 text-right">Jumlah (Kg)</th>
                <th className="px-6 py-3 text-right">Harga/Kg</th>
                <th className="px-6 py-3 text-right">Total Rp</th>
                <th className="px-6 py-3 text-left">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sales.length === 0 && (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-400 italic">Belum ada data penjualan.</td></tr>
              )}
              {sales.map(sale => (
                <tr key={sale._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-500">{new Date(sale.sale_date).toLocaleDateString('id-ID')}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{sale.farm}</td>
                  <td className="px-6 py-4 text-gray-600">{sale.buyer_name}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${BUYER_COLORS[sale.buyer_type] || 'bg-gray-100 text-gray-600'}`}>
                      {BUYER_LABELS[sale.buyer_type] || sale.buyer_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-700 font-medium">{sale.quantity_kg.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-right text-gray-600">Rp {sale.price_per_kg.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-right font-bold text-green-600">Rp {sale.total_revenue.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-gray-400 text-xs font-mono">{sale.invoice_ref}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <RecordSaleModal isOpen={isSaleModalOpen} onClose={() => setIsSaleModalOpen(false)} onSave={handleSaveSale} />
      <RecordExpenseModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} onSave={(d) => { showToast(`Pengeluaran Rp ${Number(d.amount_idr).toLocaleString('id-ID')} dicatat.`); }} />
    </div>
  );
};

export default SalesDistributionPage;
