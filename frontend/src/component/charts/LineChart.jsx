import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function truncateLabel(label, maxLen = 14) {
  if (!label || typeof label !== 'string') return label || '';
  return label.length > maxLen ? `${label.slice(0, maxLen)}..` : label;
}

const LONG_LABEL_THRESHOLD = 12;

const LineChart = ({ data, xKey, lineKeys, colors = ['#0ea5e9', '#10b981', '#f59e0b'], tickFormatter }) => {
  const itemCount = data?.length || 0;
  const needsRotation = itemCount > LONG_LABEL_THRESHOLD;

  return (
    <div className="w-full h-full min-h-[300px] animate-chart-fade-in">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: needsRotation ? 50 : 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey={xKey}
            stroke="var(--color-muted)"
            fontSize={needsRotation ? 10 : 12}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            angle={needsRotation ? -45 : 0}
            textAnchor={needsRotation ? 'end' : 'middle'}
            height={needsRotation ? 60 : 30}
            tickFormatter={tickFormatter || (v => truncateLabel(v, needsRotation ? 8 : 16))}
          />
          <YAxis stroke="var(--color-muted)" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
            itemStyle={{ color: 'var(--color-foreground)' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          {lineKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[index % colors.length]}
              strokeWidth={3}
              dot={{ r: 4, fill: colors[index % colors.length] }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;
