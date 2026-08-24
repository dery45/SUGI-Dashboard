export const STATUS_LABELS = {
  // Land Preparation (Persiapan Lahan)
  Open: 'Terbuka',
  Closed: 'Tertutup',
  Completed: 'Selesai',
  In_Progress: 'Sedang Berlangsung',
  Pending: 'Tertunda',
  Cancelled: 'Dibatalkan',
  Planned: 'Direncanakan',

  // Planting (Penanaman)
  Planted: 'Ditanam',
  Maintenance: 'Perawatan',
  Harvesting: 'Panen',
  Failed: 'Gagal',

  // Maintenance (Perawatan)
  // Uses: Pending, In_Progress, Completed, Cancelled (already defined)

  // Harvest (Panen)
  // Uses: Open, Closed, Completed, In_Progress (already defined)

  // Generic / Master Data
  Active: 'Aktif',
  Inactive: 'Tidak Aktif',
  Draft: 'Draf',
  Submitted: 'Diajukan',
  Approved: 'Disetujui',
  Rejected: 'Ditolak',
};

export const STATUS_COLORS = {
  // Green - positive/active states
  Open: 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400',
  Planted: 'bg-emerald-100 text-emerald-700',
  Active: 'bg-green-100 text-green-800',
  Approved: 'bg-green-100 text-green-700',

  // Gray - neutral/closed states
  Closed: 'bg-gray-100 text-gray-600',
  Inactive: 'bg-gray-100 text-gray-600',
  Draft: 'bg-gray-100 text-gray-600',

  // Blue - completed states
  Completed: 'bg-blue-100 text-blue-700',

  // Yellow - in progress states
  In_Progress: 'bg-yellow-100 text-yellow-800',
  Maintenance: 'bg-yellow-100 text-yellow-800',
  Harvesting: 'bg-orange-100 text-orange-700',
  Submitted: 'bg-blue-100 text-blue-700',

  // Orange - pending/warning states
  Pending: 'bg-orange-100 text-orange-700',

  // Red - negative/cancelled states
  Cancelled: 'bg-red-100 text-red-700',
  Failed: 'bg-red-100 text-red-700',
  Rejected: 'bg-red-100 text-red-700',

  // Purple - planned states
  Planned: 'bg-purple-100 text-purple-700',
};

export const getStatusLabel = (status) => {
  if (!status) return '-';
  return STATUS_LABELS[status] || status.replace(/_/g, ' ');
};

export const getStatusColor = (status) => {
  if (!status) return 'bg-gray-100 text-gray-600';
  return STATUS_COLORS[status] || 'bg-gray-100 text-gray-600';
};

export const Badge = ({ status }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
    {getStatusLabel(status)}
  </span>
);