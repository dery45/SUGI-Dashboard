import React from 'react';

const KPI_CONFIGS = [
  { key: 'activeFarmsCount',  label: 'Lahan Aktif',          unit: '',        icon: '🌿', border: 'border-blue-500',    bg: 'bg-blue-50'    },
  { key: 'activeCyclesCount', label: 'Siklus Aktif',          unit: '',        icon: '🔄', border: 'border-green-500',   bg: 'bg-green-50'   },
  { key: 'totalYieldTons',    label: 'Total Hasil Panen',     unit: ' ton',    icon: '📦', border: 'border-emerald-500', bg: 'bg-emerald-50' },
  { key: 'avgYieldPerHa',     label: 'Rata-rata Hasil/Ha',    unit: ' ton/ha', icon: '📊', border: 'border-teal-500',    bg: 'bg-teal-50'    },
  { key: 'costPerKg',         label: 'Biaya/Kg',              unit: '',        icon: '💰', border: 'border-amber-500',   bg: 'bg-amber-50', format: 'currency' },
  { key: 'roiPercentage',     label: 'ROI',                   unit: '%',       icon: '📈', border: 'border-purple-500',  bg: 'bg-purple-50'  },
  { key: 'unassignedUMs',     label: 'UM Belum Ditugaskan',   unit: '',        icon: '⚠️', border: 'border-red-500',     bg: 'bg-red-50'     },
  { key: 'alerts',            label: 'Peringatan Aktif',      unit: '',        icon: '🔔', border: 'border-orange-500',  bg: 'bg-orange-50', isArray: true },
];

const Skeleton = () => (
  <div className="animate-pulse bg-gray-200 rounded-xl h-20 w-full" />
);

/**
 * KPISection — 8-card KPI grid with skeleton loading state
 * @param {{ data: object, loading: boolean }} props
 */
const KPISection = ({ data, loading }) => {
  if (loading) {
    return (
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {KPI_CONFIGS.map((_, i) => <Skeleton key={i} />)}
      </section>
    );
  }

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4" aria-label="Ringkasan KPI">
      {KPI_CONFIGS.map((kpi) => {
        let rawValue = data?.[kpi.key] ?? 0;
        let displayValue;

        if (kpi.isArray) {
          displayValue = Array.isArray(rawValue) ? rawValue.length : 0;
        } else if (kpi.format === 'currency') {
          displayValue = `Rp ${Number(rawValue).toLocaleString('id-ID')}`;
        } else {
          displayValue = `${rawValue}${kpi.unit}`;
        }

        return (
          <div
            key={kpi.key}
            className={`${kpi.bg} p-5 rounded-xl border-l-4 ${kpi.border} transition hover:shadow-md cursor-default`}
            role="region"
            aria-label={kpi.label}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg" aria-hidden="true">{kpi.icon}</span>
              <h3 className="text-gray-600 text-xs font-semibold uppercase tracking-wide">{kpi.label}</h3>
            </div>
            <p className="text-2xl font-bold text-gray-800">{displayValue}</p>
          </div>
        );
      })}
    </section>
  );
};

export default KPISection;
