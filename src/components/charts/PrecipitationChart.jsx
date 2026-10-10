import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

export default function PrecipitationChart({ data = [] }) {
  const { isDark } = useTheme();

  if (!data || data.length === 0) {
    return <div className="h-44 flex items-center justify-center text-xs text-slate-400">No precipitation data available.</div>;
  }

  return (
    <div className="w-full h-44">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke={isDark ? '#1e293b' : '#e2e8f0'} 
          />
          <XAxis 
            dataKey="time" 
            tickLine={false} 
            axisLine={false} 
            tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} 
          />
          <YAxis 
            domain={[0, 100]} 
            tickLine={false} 
            axisLine={false} 
            tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
            unit="%"
          />
          <Tooltip 
            content={<CustomBarTooltip isDark={isDark} />}
          />
          <Bar 
            dataKey="precipProb" 
            name="Precipitation Probability" 
            fill="#38bdf8" 
            radius={[4, 4, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function CustomBarTooltip({ active, payload, label, isDark }) {
  if (active && payload && payload.length) {
    return (
      <div className={`p-2.5 rounded-lg shadow-lg text-xs border ${
        isDark ? 'bg-navy-900 border-navy-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <p className="font-semibold text-slate-400 mb-1">{label}</p>
        <p className="text-weather-500 font-medium">
          Rain Chance: <strong>{payload[0].value}%</strong>
        </p>
      </div>
    );
  }
  return null;
}
