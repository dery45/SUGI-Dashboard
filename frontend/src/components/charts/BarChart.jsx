import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const BarChart = ({ data, xKey, barKeys, colors = ['#0ea5e9', '#8b5cf6', '#ec4899'] }) => {
  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis dataKey={xKey} stroke="var(--color-muted)" fontSize={12} tickLine={false} axisLine={false} />
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
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;
