import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DataTable from '../component/common/DataTable';
import RecordSaleModal from '../component/management/RecordSaleModal';
import RecordExpenseModal from '../component/management/RecordExpenseModal';
import { API_BASE_URL as BASE_URL } from '../services/authService';

const BUYER_LABELS = { Mill: 'Pabrik', Middleman: 'Tengkulak', Direct: 'Langsung', Government: 'Pemerintah' };

const SalesDistributionPage = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('sales');
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [farms, setFarms] = useState([]);
  const [notification, setNotification] = useState(null);

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [sRes, eRes, fRes] = await Promise.all([
        fetch(`${BASE_URL}/sales`, { headers }),
        fetch(`${BASE_URL}/expenses`, { headers }),
        fetch(`${BASE_URL}/master-data/farms/all`, { headers })
      ]);
      const sJson = await sRes.json();
      const eJson = await eRes.json();
      const fJson = await fRes.json();
      if (sJson.success) setSales(sJson.data);
      if (eJson.success) setExpenses(eJson.data);
      if (fJson.success) setFarms(fJson.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showToast = (msg) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

  const handleSaveSale = async (saleForm) => {
    try {
      const res = await fetch(`${BASE_URL}/sales`, { method: 'POST', headers, body: JSON.stringify(saleForm) });
      const json = await res.json();
      if (!json.success) { if (json.errors) alert(Object.values(json.errors).join('\n')); else alert(json.message); return; }
      showToast('Penjualan berhasil dicatat!');
      setShowSaleModal(false);
      fetchData();
    } catch (e) { alert(e.message); }
  };

  const handleSaveExpense = async (expenseForm) => {
    try {
      const res = await fetch(`${BASE_URL}/expenses`, { method: 'POST', headers, body: JSON.stringify(expenseForm) });
      const json = await res.json();
      if (!json.success) { if (json.errors) alert(Object.values(json.errors).join('\n')); else alert(json.message); return; }
      showToast('Pengeluaran berhasil dicatat!');
      setShowExpenseModal(false);
      fetchData();
    } catch (e) { alert(e.message); }
  };

  const handleDeleteSale = async (id) => {
    if (!confirm('Hapus data penjualan ini?')) return;
    await fetch(`${BASE_URL}/sales/${id}`, { method: 'DELETE', headers });
    fetchData();
  };

  const handleDeleteExpense = async (id) => {
    if (!confirm('Hapus data pengeluaran ini?')) return;
    await fetch(`${BASE_URL}/expenses/${id}`, { method: 'DELETE', headers });
    fetchData();
  };

  const totalKg = sales.reduce((s, r) => s + (r.quantity_kg || 0), 0);
  const totalRevenue = sales.reduce((s, r) => s + (r.total_revenue || r.quantity_kg * r.price_per_kg || 0), 0);
  const avgPrice = totalKg > 0 ? Math.round(totalRevenue / totalKg) : 0;
  const totalExpense = expenses.reduce((s, r) => s + (r.amount_idr || 0), 0);

  const saleColumns = [
    { header: 'Tanggal', accessor: (r) => new Date(r.sale_date).toLocaleDateString('id-ID') },
    { header: 'Farm', accessor: (r) => r.farm_id?.name || '-' },
    { header: 'Pembeli', accessor: 'buyer_name' },
    { header: 'Tipe', accessor: (r) => BUYER_LABELS[r.buyer_type] || r.buyer_type },
    { header: 'Kg', accessor: (r) => r.quantity_kg?.toLocaleString('id-ID') },
    { header: 'Harga/Kg', accessor: (r) => `Rp ${r.price_per_kg?.toLocaleString('id-ID')}` },
    { header: 'Total', accessor: (r) => `Rp ${(r.total_revenue || r.quantity_kg * r.price_per_kg || 0).toLocaleString('id-ID')}` },
    { header: 'Invoice', accessor: 'invoice_ref' }
  ];

  const expenseColumns = [
    { header: 'Tanggal', accessor: (r) => new Date(r.expense_date).toLocaleDateString('id-ID') },
    { header: 'Farm', accessor: (r) => r.farm_id?.name || '-' },
    { header: 'Kategori', accessor: 'category' },
    { header: 'Jumlah (Rp)', accessor: (r) => r.amount_idr?.toLocaleString('id-ID') },
    { header: 'Deskripsi', accessor: (r) => r.description || '-' },
    { header: 'Nota', accessor: (r) => r.receipt_ref || '-' }
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-16">
      {notification && (
        <div className="fixed top-4 right-4 z-[100] bg-primary text-white px-6 py-3 rounded-xl shadow-lg text-sm font-bold">{notification}</div>
      )}

      <div className="bg-gradient-to-br from-surface/60 via-surface/30 to-transparent backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/30 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full" />
            <div><h1 className="text-2xl font-black text-foreground tracking-tight">Penjualan & Distribusi</h1><p className="text-muted text-xs font-bold uppercase tracking-[0.25em] opacity-60 mt-0.5">Catat dan pantau transaksi penjualan</p></div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowExpenseModal(true)} className="px-4 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all font-bold text-xs uppercase tracking-wider">+ Catat Pengeluaran</button>
            <button onClick={() => { setShowSaleModal(true); }} className="px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-bold text-xs uppercase tracking-wider">+ Catat Penjualan</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Pendapatan', value: `Rp ${totalRevenue.toLocaleString('id-ID')}`, color: 'from-orange-400 to-amber-500' },
          { label: 'Total Hasil Terjual', value: `${totalKg.toLocaleString('id-ID')} kg`, color: 'from-blue-400 to-cyan-500' },
          { label: 'Harga Rata-rata/Kg', value: `Rp ${avgPrice.toLocaleString('id-ID')}`, color: 'from-green-400 to-emerald-500' }
        ].map((s, i) => (
          <div key={i} className="relative overflow-hidden bg-gradient-to-br from-surface/60 via-surface/30 to-transparent backdrop-blur-xl p-6 rounded-[1.5rem] border border-border/30 shadow-lg">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${s.color} opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`} />
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider">{s.label}</p>
            <p className="text-2xl font-black text-foreground mt-2">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-surface/60 via-surface/30 to-transparent backdrop-blur-xl rounded-[2.5rem] border border-border/30 shadow-lg overflow-hidden">
        <div className="flex flex-wrap border-b border-border/20">
          <button onClick={() => setActiveTab('sales')}
            className={`px-6 py-3.5 text-sm font-bold transition relative ${activeTab === 'sales' ? 'text-emerald-600' : 'text-muted hover:text-foreground'}`}>
            Penjualan
            {activeTab === 'sales' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
          </button>
          <button onClick={() => setActiveTab('expenses')}
            className={`px-6 py-3.5 text-sm font-bold transition relative ${activeTab === 'expenses' ? 'text-amber-600' : 'text-muted hover:text-foreground'}`}>
            Pengeluaran
            {activeTab === 'expenses' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />}
          </button>
        </div>
        <div className="p-6">
          {activeTab === 'sales' ? (
            <DataTable columns={saleColumns} data={sales} onDelete={(id) => handleDeleteSale(id)} itemsPerPage={10} />
          ) : (
            <DataTable columns={expenseColumns} data={expenses} onDelete={(id) => handleDeleteExpense(id)} itemsPerPage={10} />
          )}
        </div>
      </div>

      {showSaleModal && (
        <RecordSaleModal
          isOpen={showSaleModal}
          onClose={() => setShowSaleModal(false)}
          onSave={handleSaveSale}
          farms={farms}
        />
      )}

      {showExpenseModal && (
        <RecordExpenseModal
          isOpen={showExpenseModal}
          onClose={() => setShowExpenseModal(false)}
          onSave={handleSaveExpense}
          farms={farms}
        />
      )}
    </div>
  );
};

export default SalesDistributionPage;
