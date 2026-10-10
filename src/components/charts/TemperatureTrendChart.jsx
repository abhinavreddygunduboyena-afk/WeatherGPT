import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

export default function TemperatureTrendChart({ data = [], unit = 'C' }) {
  const { isDark } = useTheme();

  if (!data || data.length === 0) {
    return <div className="h-48 flex items-center justify-center text-xs text-slate-400">No temperature data available.</div>;
  }

  // Find min/max for dynamic domain
  const temps = data.map(d => d.temp);
  const minTemp = Math.floor(Math.min(...temps) - 2);
  const maxTemp = Math.ceil(Math.max(...temps) + 2);

  return (
    <div className="w-full h-52">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0284c7" stopOpacity={isDark ? 0.45 : 0.25} />
              <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
            </linearGradient>
          </defs>
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
            domain={[minTemp, maxTemp]} 
            tickLine={false} 
            axisLine={false} 
            tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }}
            unit={`°${unit}`}
          />
          <Tooltip 
            content={<CustomTooltip isDark={isDark} unit={unit} />}
          />
          <Area 
            type="monotone" 
            dataKey="temp" 
            stroke="#0284c7" 
            strokeWidth={2.5} 
            fillOpacity={1} 
            fill="url(#tempGradient)" 
            name="Temperature"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function CustomTooltip({ active, payload, label, isDark, unit }) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className={`p-2.5 rounded-lg shadow-lg text-xs border ${
        isDark ? 'bg-navy-900 border-navy-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <p className="font-semibold text-slate-400 mb-1">{label}</p>
        <p className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-weather-500"></span>
          <span>Temperature: <strong>{payload[0].value}°{unit}</strong></span>
        </p>
        {item.condition && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Condition: {item.condition}
          </p>
        )}
        {item.precipProb !== undefined && (
          <p className="text-[11px] text-blue-500 mt-0.5">
            Precipitation: {item.precipProb}%
          </p>
        )}
      </div>
    );
  }
  return null;
}
