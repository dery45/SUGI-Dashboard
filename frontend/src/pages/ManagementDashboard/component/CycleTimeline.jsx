import React, { useMemo } from 'react';

const STAGE_COLORS = {
  Persiapan_Lahan: '#3b82f6',
  Penanaman: '#10b981',
  Perawatan: '#f59e0b',
  Panen: '#ef4444',
};

const STAGE_LABELS = {
  Persiapan_Lahan: 'Persiapan Lahan',
  Penanaman: 'Penanaman',
  Perawatan: 'Perawatan',
  Panen: 'Panen',
};

const STAGE_ORDER = ['Persiapan_Lahan', 'Penanaman', 'Perawatan', 'Panen'];

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function formatDate(date) {
  if (!date) return null;
  const d = new Date(date);
  return { day: d.getDate(), month: d.getMonth(), year: d.getFullYear(), full: d };
}

function getMonthDiff(start, end) {
  if (!start || !end) return 0;
  return (end.year - start.year) * 12 + (end.month - start.month) + (end.day >= start.day ? 1 : 0);
}

function getDayOfYear(date) {
  if (!date) return 0;
  const start = new Date(date.year, 0, 0);
  const diff = date.full - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

const CycleTimeline = ({ data }) => {
  // Process data into timeline rows
  const rows = useMemo(() => {
    return data.map((cycle, rowIndex) => {
      const stages = [];

      // Persiapan Lahan: from land_opening_date to land_closing_date (or planting_date if no closing)
      if (cycle.land_opening_date) {
        const start = formatDate(cycle.land_opening_date);
        let end = cycle.land_closing_date ? formatDate(cycle.land_closing_date) : (cycle.planting_date ? formatDate(cycle.planting_date) : null);
        if (start && end && end.full > start.full) {
          stages.push({
            stage: 'Persiapan_Lahan',
            label: STAGE_LABELS.Persiapan_Lahan,
            start,
            end,
            color: STAGE_COLORS.Persiapan_Lahan,
          });
        } else if (start) {
          // Point marker if no end date
          stages.push({
            stage: 'Persiapan_Lahan',
            label: STAGE_LABELS.Persiapan_Lahan,
            start,
            end: null,
            isPoint: true,
            color: STAGE_COLORS.Persiapan_Lahan,
          });
        }
      }

      // Penanaman: planting_date as point marker
      if (cycle.planting_date) {
        const point = formatDate(cycle.planting_date);
        stages.push({
          stage: 'Penanaman',
          label: STAGE_LABELS.Penanaman,
          start: point,
          end: null,
          isPoint: true,
          color: STAGE_COLORS.Penanaman,
        });
      }

      // Perawatan: from first activity date to last activity date (or harvest_opening_date)
      if (cycle.maintenance_start && cycle.maintenance_end) {
        const start = formatDate(cycle.maintenance_start);
        const end = formatDate(cycle.maintenance_end);
        if (start && end && end.full > start.full) {
          stages.push({
            stage: 'Perawatan',
            label: STAGE_LABELS.Perawatan,
            start,
            end,
            color: STAGE_COLORS.Perawatan,
          });
        } else if (start) {
          stages.push({
            stage: 'Perawatan',
            label: STAGE_LABELS.Perawatan,
            start,
            end: null,
            isPoint: true,
            color: STAGE_COLORS.Perawatan,
          });
        }
      }

      // Panen: from harvest_opening_date to harvest_closing_date (or expected_end)
      if (cycle.harvest_opening_date) {
        const start = formatDate(cycle.harvest_opening_date);
        let end = cycle.harvest_closing_date ? formatDate(cycle.harvest_closing_date) : (cycle.expected_end ? formatDate(cycle.expected_end) : null);
        if (start && end && end.full > start.full) {
          stages.push({
            stage: 'Panen',
            label: STAGE_LABELS.Panen,
            start,
            end,
            color: STAGE_COLORS.Panen,
          });
        } else if (start) {
          stages.push({
            stage: 'Panen',
            label: STAGE_LABELS.Panen,
            start,
            end: null,
            isPoint: true,
            color: STAGE_COLORS.Panen,
          });
        }
      }

      return {
        id: cycle._id || cycle.id || rowIndex,
        cycle: cycle.cycle || `Siklus ${rowIndex + 1}`,
        crop_type: cycle.crop_type || '-',
        variety: cycle.variety || '',
        block_name: cycle.block?.name || cycle.block_name || '-',
        farm_name: cycle.farm_master?.name || cycle.farm_name || '-',
        stages,
      };
    }).filter(row => row.stages.length > 0);
  }, [data]);

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted">
        <p className="text-sm italic">Tidak ada data timeline untuk ditampilkan</p>
      </div>
    );
  }

  // Determine date range for the timeline
  const allDates = rows.flatMap(r => r.stages.flatMap(s => [s.start, s.end].filter(Boolean).map(d => d.full)));
  const minDate = allDates.length ? new Date(Math.min(...allDates.map(d => d.getTime()))) : new Date();
  const maxDate = allDates.length ? new Date(Math.max(...allDates.map(d => d.getTime()))) : new Date();

  // Normalize to month boundaries
  const startMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  const endMonth = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);

  const totalDays = Math.ceil((endMonth - startMonth) / (1000 * 60 * 60 * 24));
  const months = [];
  let current = new Date(startMonth);
  while (current <= endMonth) {
    months.push({ month: current.getMonth(), year: current.getFullYear(), label: MONTH_LABELS[current.getMonth()] + ' ' + current.getFullYear() });
    current.setMonth(current.getMonth() + 1);
  }

  const dayWidth = Math.max(2, 800 / Math.max(1, totalDays)); // Min 2px per day, scale to ~800px width

  return (
    <div className="overflow-x-auto overflow-y-hidden">
      <div className="min-w-max" style={{ width: Math.max(800, totalDays * dayWidth + 300) }}>
        {/* Header: Month labels */}
        <div className="flex border-b border-border/30 bg-background/30 sticky left-0 z-10">
          <div className="w-64 border-r border-border/30 flex-shrink-0" />
          <div className="flex" style={{ width: totalDays * dayWidth }}>
            {months.map((m, i) => {
              const monthStart = new Date(m.year, m.month, 1);
              const monthEnd = new Date(m.year, m.month + 1, 0);
              const monthDays = Math.ceil((monthEnd - monthStart) / (1000 * 60 * 60 * 24)) + 1;
              return (
                <div key={i} className="border-r border-border/20 flex items-center justify-center text-[10px] font-bold text-muted uppercase tracking-wider" style={{ width: monthDays * dayWidth }}>
                  {m.label}
                </div>
              );
            })}
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border/20">
          {rows.map((row, rowIndex) => (
            <div key={row.id} className="flex min-h-[60px] {rowIndex % 2 === 0 ? 'bg-background/20' : 'bg-transparent'}">
              {/* Left label */}
              <div className="w-64 border-r border-border/30 flex-shrink-0 p-3 flex flex-col justify-center">
                <div className="font-semibold text-sm text-foreground truncate">{row.cycle}</div>
                <div className="text-[11px] text-muted-foreground truncate">{row.crop_type}{row.variety ? ` (${row.variety})` : ''}</div>
                <div className="text-[10px] text-muted-foreground/70">{row.block_name} · {row.farm_name}</div>
              </div>

              {/* Timeline bars */}
              <div className="relative flex-1 py-2" style={{ width: totalDays * dayWidth }}>
                {/* Today line */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-red-500/50 pointer-events-none" style={{ left: `${Math.max(0, (new Date() - startMonth) / (1000 * 60 * 60 * 24)) * dayWidth}px` }} />

                {row.stages.map((stage, stageIndex) => {
                  const startDay = Math.max(0, Math.floor((stage.start.full - startMonth) / (1000 * 60 * 60 * 24)));
                  const endDay = stage.end ? Math.max(startDay, Math.floor((stage.end.full - startMonth) / (1000 * 60 * 60 * 24))) : startDay;
                  const width = Math.max(stage.isPoint ? 8 : 4, (endDay - startDay + 1) * dayWidth);
                  const left = startDay * dayWidth;

                  return (
                    <div
                      key={stage.stage}
                      className="absolute flex items-center"
                      style={{ left: `${left}px`, top: '8px', height: '36px' }}
                    >
                      {stage.isPoint ? (
                        <div
                          className="w-2 h-2 rounded-full border-2 border-white shadow-lg"
                          style={{ backgroundColor: stage.color, width: '10px', height: '10px', borderWidth: '2px', marginLeft: '-1px' }}
                          title={`${stage.label}: ${stage.start.full.toLocaleDateString('id-ID')}`}
                        />
                      ) : (
                        <div
                          className="rounded-lg border border-white/20 shadow-sm transition-all hover:shadow-md hover:scale-[1.02] hover:z-10"
                          style={{
                            backgroundColor: stage.color,
                            width: `${width}px`,
                            minWidth: '24px',
                          }}
                          title={`${stage.label}: ${stage.start.full.toLocaleDateString('id-ID')} – ${stage.end.full.toLocaleDateString('id-ID')}`}
                        >
                          {width > 60 && (
                            <span className="text-[10px] font-bold text-white/90 px-1.5 truncate block w-full">{stage.label}</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 p-4 bg-background/30 border-t border-border/30">
          {STAGE_ORDER.map(stage => (
            <div key={stage} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: STAGE_COLORS[stage] }} />
              <span className="text-sm text-muted-foreground">{STAGE_LABELS[stage]}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 ml-auto">
            <div className="w-6 h-0.5 bg-red-500/50" />
            <span className="text-sm text-muted-foreground">Hari ini</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CycleTimeline;