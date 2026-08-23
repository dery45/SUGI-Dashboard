import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const MANY_ITEMS_THRESHOLD = 10;
const LONG_LABEL_LENGTH = 10;

// Compact axis ticks: 1596090000 -> "1,6 M" (miliar), 236722312 -> "237 jt"
function formatCompactNumber(value) {
  const num = Number(value) || 0;
  const abs = Math.abs(num);
  const scaled = (divisor, suffix, digits = 1) => {
    const v = num / divisor;
    const rounded = Math.abs(v) >= 100 ? Math.round(v) : Number(v.toFixed(digits));
    return `${rounded.toLocaleString('id-ID')}${suffix}`;
  };
  if (abs >= 1e12) return scaled(1e12, ' T');
  if (abs >= 1e9) return scaled(1e9, ' M');
  if (abs >= 1e6) return scaled(1e6, ' jt');
  if (abs >= 1e3) return scaled(1e3, ' rb', 0);
  return num.toLocaleString('id-ID');
}

function truncateLabel(label, maxLen = 16) {
  if (!label || typeof label !== 'string') return label || '';
  return label.length > maxLen ? `${label.slice(0, maxLen)}…` : label;
}

const BarChart = ({
  data,
  xKey,
  barKeys,
  colors = ['#0ea5e9', '#8b5cf6', '#ec4899'],
  tickFormatter,
  yTickFormatter = formatCompactNumber,
  valueFormatter,
}) => {
  const itemCount = data?.length || 0;
  // Rotate whenever any label is long (e.g. cycle names), not just when there are many bars
  const hasLongLabels = (data || []).some(d => String(d?.[xKey] ?? '').length > LONG_LABEL_LENGTH);
  const needsRotation = itemCount > MANY_ITEMS_THRESHOLD || hasLongLabels;

  const tooltipFormatter = valueFormatter
    ? (value, name) => [valueFormatter(value), name]
    : undefined;

  return (
    <div className="w-full h-full min-w-0 min-h-[300px] animate-chart-fade-in">
      {/* width/height 99% + debounce avoids transient width(-1)/height(-1) warning (recharts#220) */}
      <ResponsiveContainer width="99%" height="99%" minWidth={1} minHeight={1} debounce={20}>
        <RechartsBarChart data={data} margin={{ top: 10, right: 30, left: 4, bottom: needsRotation ? 56 : 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey={xKey}
            stroke="var(--color-muted)"
            fontSize={needsRotation ? 11 : 12}
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={needsRotation ? -35 : 0}
            textAnchor={needsRotation ? 'end' : 'middle'}
            height={needsRotation ? 72 : 30}
            tickMargin={needsRotation ? 6 : 0}
            tickFormatter={tickFormatter || (v => truncateLabel(v))}
          />
          <YAxis
            stroke="var(--color-muted)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={58}
            tickFormatter={yTickFormatter}
          />
          <Tooltip
            formatter={tooltipFormatter}
            contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
            cursor={{ fill: 'var(--color-border)', opacity: 0.4 }}
          />
          <Legend wrapperStyle={{ paddingTop: '16px' }} />
          {barKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colors[index % colors.length]}
              radius={[4, 4, 0, 0]}
              isAnimationActive={true}
              animationDuration={600}
              animationEasing="ease-out"
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;
