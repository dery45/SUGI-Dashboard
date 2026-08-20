import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const LONG_LABEL_THRESHOLD = 8;

function truncateLabel(label, maxLen = 14) {
  if (!label || typeof label !== 'string') return label || '';
  return label.length > maxLen ? `${label.slice(0, maxLen)}..` : label;
}

const BarChart = ({ data, xKey, barKeys, colors = ['#0ea5e9', '#8b5cf6', '#ec4899'], tickFormatter }) => {
  const itemCount = data?.length || 0;
  const needsRotation = itemCount > LONG_LABEL_THRESHOLD;

  return (
    <div className="w-full h-full min-h-[300px] animate-chart-fade-in">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: needsRotation ? 50 : 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey={xKey}
            stroke="var(--color-muted)"
            fontSize={needsRotation ? 10 : 12}
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={needsRotation ? -45 : 0}
            textAnchor={needsRotation ? 'end' : 'middle'}
            height={needsRotation ? 60 : 30}
            tickFormatter={tickFormatter || (v => truncateLabel(v, needsRotation ? 10 : 20))}
          />
          <YAxis stroke="var(--color-muted)" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
            cursor={{ fill: 'var(--color-border)', opacity: 0.4 }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
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
