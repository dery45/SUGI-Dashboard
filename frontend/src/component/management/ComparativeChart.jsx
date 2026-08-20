import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const LINES = [
  { key: 'companies',   label: 'Perusahaan', color: '#10b981' },
  { key: 'groups',      label: 'Kelompok Tani', color: '#3b82f6' },
  { key: 'independent', label: 'Petani Mandiri', color: '#f59e0b' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-bold text-gray-700 mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value.toLocaleString('id-ID')} kg
        </p>
      ))}
    </div>
  );
};

/**
 * ComparativeChart — Recharts LineChart for yield trend comparison
 * @param {{ data: Array }} props — [{month, companies, groups, independent}]
 */
const ComparativeChart = ({ data = [] }) => {
  if (!data.length) {
    return (
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">📊 Tren Hasil Panen Komparatif</h2>
        <div className="animate-pulse bg-gray-100 h-64 rounded-lg" />
      </section>
    );
  }

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6" aria-label="Tren Hasil Panen Komparatif">
      <h2 className="text-lg font-bold text-gray-800 mb-1">📊 Tren Hasil Panen Komparatif</h2>
      <p className="text-gray-400 text-xs mb-5">Perusahaan vs Kelompok Tani vs Petani Mandiri (kg/bulan)</p>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
          <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }}
            formatter={(value) => LINES.find(l => l.key === value)?.label || value}
          />
          {LINES.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.key}
              stroke={line.color}
              strokeWidth={2.5}
              dot={{ r: 4, fill: line.color }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
};

export default ComparativeChart;
