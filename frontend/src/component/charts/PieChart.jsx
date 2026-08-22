import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#f43f5e'];

const PieChart = ({ data, nameKey, dataKey, showLegend }) => {
  return (
    <div className="w-full h-full min-w-0 min-h-[300px]">
      {/* width/height 99% + debounce avoids transient width(-1)/height(-1) warning (recharts#220) */}
      <ResponsiveContainer width="99%" height="99%" minWidth={1} minHeight={1} debounce={20}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey={dataKey}
            nameKey={nameKey}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-foreground)', borderRadius: '8px' }}
            itemStyle={{ color: 'var(--color-foreground)' }}
          />
          {showLegend && <Legend verticalAlign="bottom" height={36} />}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChart;
