import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const LineChart = ({ data, xKey, lineKeys, colors = ['#0ea5e9', '#10b981', '#f59e0b'] }) => {
  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis dataKey={xKey} stroke="var(--color-muted)" fontSize={12} tickLine={false} axisLine={false} />
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
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;
