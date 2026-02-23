'use client';

import { Line, LineChart, CartesianGrid, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';

export function TrendLine({ data, dataKey, color = '#34d399' }: { data: any[]; dataKey: string; color?: string }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="date" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
