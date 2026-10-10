import React, { useState } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { 
  Calendar, BarChart3, TrendingUp, Droplets, Sun, 
  CloudRain, Wind, Waves, Thermometer 
} from 'lucide-react';
import { useWeather } from '../../contexts/WeatherContext';
import { useTheme } from '../../contexts/ThemeContext';
import { convertTemperature, getWmoWeatherInfo } from '../../utils/weatherUtils';
import Card from '../common/Card';

export default function FarmerForecastTabs() {
  const { weatherData, unit } = useWeather();
  const { isDark } = useTheme();

  const [activeTab, setActiveTab] = useState('7day'); // '7day' | 'temp_et0' | 'rain_moisture'

  const daily = weatherData?.daily || [];
  const hourly = weatherData?.hourly || [];

  // Prepare chart data for 7-day agro trends
  const chartDaily = daily.map(d => ({
    date: d.date,
    maxTemp: d.maxTemp,
    minTemp: d.minTemp,
    precipSum: d.precipSumMm || 0,
    rainProb: d.rainProb || 0,
    et0: d.et0 || 4.5,
    wind: d.windSpeed || 10
  }));

  // Hourly soil trend for first 24h
  const chartSoilHourly = hourly.slice(0, 24).map(h => ({
    time: h.time,
    temp: h.temp,
    soilTemp: h.soilTemp ?? h.temp,
    soilMoisture: h.soilMoisture != null ? Math.round(h.soilMoisture * 100) : 24,
    precipProb: h.precipProb || 0,
    et0: h.et0 || 0.2
  }));

  return (
    <div className="rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm overflow-hidden">
      
      {/* Tab Switcher Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-850/50">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            7-Day Agricultural Forecast & Trends
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Field moisture, thermal bounds, and evaporative water demand
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-navy-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('7day')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              activeTab === '7day'
                ? 'bg-white dark:bg-navy-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>7-Day Cards</span>
          </button>

          <button
            onClick={() => setActiveTab('temp_et0')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'temp_et0'
                ? 'bg-white dark:bg-navy-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Temp & ET0 Chart</span>
          </button>

          <button
            onClick={() => setActiveTab('rain_moisture')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'rain_moisture'
                ? 'bg-white dark:bg-navy-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Rain & Soil Moisture</span>
          </button>
        </div>
      </div>

      {/* Tab 1: 7-Day Forecast Cards */}
      {activeTab === '7day' && (
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {daily.map((d, idx) => {
              const displayMax = convertTemperature(d.maxTemp, unit);
              const displayMin = convertTemperature(d.minTemp, unit);
              const isRainy = (d.precipSumMm || 0) >= 3 || (d.rainProb || 0) >= 50;

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-center flex flex-col justify-between transition-colors ${
                    isRainy
                      ? 'border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20'
                      : 'border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-850/50 hover:border-slate-300 dark:hover:border-navy-700'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                      {d.date}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {d.fullDate?.slice(5)}
                    </span>
                  </div>

                  {/* Icon & Temp */}
                  <div className="my-2.5">
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {displayMax}° / <span className="text-slate-400 font-normal">{displayMin}°</span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate mt-0.5">
                      {d.condition}
                    </span>
                  </div>

                  {/* Agro metrics pills */}
                  <div className="space-y-1 text-[10px] border-t border-slate-100 dark:border-navy-800/80 pt-2">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>Rain:</span>
                      <strong className={isRainy ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600'}>
                        {d.precipSumMm || 0} mm ({d.rainProb || 0}%)
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                      <span>ET0:</span>
                      <span>{d.et0 || 4.5} mm/d</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                      <span>Wind:</span>
                      <span>{d.windSpeed} km/h</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Temperature & ET0 Chart */}
      {activeTab === 'temp_et0' && (
        <div className="p-5">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              7-Day Maximum Temperature (°{unit}) & Evapotranspiration (ET0 mm/day)
            </span>
            <span className="text-[11px] text-slate-400">
              Blue = Temperature • Amber = ET0 Water Loss
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartDaily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tempAgroGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={isDark ? 0.4 : 0.2} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1e293b' : '#e2e8f0'} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} />
                <YAxis yAxisId="temp" domain={['auto', 'auto']} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} unit={`°${unit}`} />
                <YAxis yAxisId="et0" orientation="right" domain={[0, 10]} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#f59e0b' }} unit=" mm" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-2.5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-lg shadow-lg text-xs space-y-1">
                          <p className="font-bold text-slate-800 dark:text-slate-200">{data.date}</p>
                          <p className="text-blue-500 font-medium">Max Temp: {data.maxTemp}°{unit} (Min: {data.minTemp}°{unit})</p>
                          <p className="text-amber-500 font-medium">Daily ET0 Demand: {data.et0} mm/day</p>
                          <p className="text-slate-400">Wind: {data.wind} km/h</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area yAxisId="temp" type="monotone" dataKey="maxTemp" stroke="#0284c7" strokeWidth={2.5} fill="url(#tempAgroGrad)" name="Max Temp" />
                <Line yAxisId="et0" type="monotone" dataKey="et0" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="ET0 (mm)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab 3: Rainfall & Soil Moisture Trend */}
      {activeTab === 'rain_moisture' && (
        <div className="p-5">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Next 24-Hour Precipitation (mm) & Soil Moisture Saturation (% Volumetric)
            </span>
            <span className="text-[11px] text-slate-400">
              Blue Bars = Rain • Emerald Line = Soil Moisture %
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartSoilHourly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1e293b' : '#e2e8f0'} />
                <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} interval={2} />
                <YAxis yAxisId="rain" domain={[0, 'auto']} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#0284c7' }} unit="mm" />
                <YAxis yAxisId="moist" orientation="right" domain={[0, 50]} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#10b981' }} unit="%" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-2.5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-lg shadow-lg text-xs space-y-1">
                          <p className="font-bold text-slate-800 dark:text-slate-200">{data.time} hrs</p>
                          <p className="text-blue-500">Rain Prob: {data.precipProb}%</p>
                          <p className="text-emerald-500 font-semibold">Soil Moisture: {data.soilMoisture}% volumetric</p>
                          <p className="text-amber-500">Soil Surface Temp: {data.soilTemp}°C</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar yAxisId="rain" dataKey="precipProb" fill="#0284c7" radius={[4, 4, 0, 0]} name="Rain Prob %" />
                <Line yAxisId="moist" type="monotone" dataKey="soilMoisture" stroke="#10b981" strokeWidth={2.5} dot={{ r: 2 }} name="Soil Moisture %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

    </div>
  );
}
