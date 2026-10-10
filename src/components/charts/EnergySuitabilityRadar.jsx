import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

export default function EnergySuitabilityRadar({ data = [] }) {
  const { isDark } = useTheme();

  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-xs text-slate-400">No radar metrics available.</div>;
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke={isDark ? '#334155' : '#cbd5e1'} />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: isDark ? '#cbd5e1' : '#475569', fontSize: 11 }} 
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 10 }} 
          />
          <Tooltip 
            content={<RadarTooltip isDark={isDark} />}
          />
          <Radar 
            name="Suitability Score" 
            dataKey="A" 
            stroke="#0d9488" 
            fill="#0d9488" 
            fillOpacity={isDark ? 0.45 : 0.3} 
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

function RadarTooltip({ active, payload, isDark }) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className={`p-2 rounded shadow-md text-xs border ${
        isDark ? 'bg-navy-900 border-navy-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <p className="font-semibold text-energy-600 dark:text-energy-400">{item.subject}</p>
        <p className="text-slate-500 dark:text-slate-400">Score: <strong className="text-slate-900 dark:text-slate-100">{item.A} / 100</strong></p>
      </div>
    );
  }
  return null;
}
