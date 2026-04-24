import React from 'react';

/**
 * AlertsPanel — Renders the list of active alerts with "Mark Done" and "Assign UM" actions
 * @param {{ alerts: Array, onMarkDone: Function, onAssignUM: Function }} props
 */
const AlertsPanel = ({ alerts = [], onMarkDone, onAssignUM }) => {
  if (alerts.length === 0) {
    return (
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">🔔 Peringatan & Notifikasi</h2>
        <p className="text-gray-400 text-sm italic">Tidak ada peringatan aktif. Semua berjalan lancar ✅</p>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6" aria-label="Peringatan Aktif">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">🔔 Peringatan & Notifikasi</h2>
        <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-full">{alerts.length} Aktif</span>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, i) => {
          const isWarning = alert.type === 'Warning';
          return (
            <div
              key={i}
              className={`p-4 rounded-lg flex items-start justify-between gap-3 ${
                isWarning
                  ? 'bg-orange-50 text-orange-800 border border-orange-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5" aria-hidden="true">{isWarning ? '⚠️' : 'ℹ️'}</span>
                <div>
                  <p className="font-semibold text-sm">{alert.message}</p>
                  {alert.dueDate && (
                    <p className="text-xs opacity-70 mt-0.5">
                      Jatuh Tempo: {new Date(alert.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                {onAssignUM && (
                  <button
                    onClick={() => onAssignUM(alert)}
                    className="text-xs font-semibold px-2 py-1 rounded bg-white border border-current opacity-75 hover:opacity-100 transition"
                    aria-label="Tugaskan Unit Manajemen"
                  >
                    Tugaskan UM
                  </button>
                )}
                {onMarkDone && (
                  <button
                    onClick={() => onMarkDone(i)}
                    className="text-xs font-semibold px-2 py-1 rounded bg-white border border-green-400 text-green-700 hover:bg-green-50 transition"
                    aria-label="Tandai selesai"
                  >
                    ✓ Selesai
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AlertsPanel;
