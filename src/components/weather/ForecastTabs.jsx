import React, { useState } from 'react';
import { Cloud, CloudRain, Sun, CloudLightning, Calendar, Clock, BarChart3, TrendingUp } from 'lucide-react';
import { useWeather } from '../../contexts/WeatherContext';
import { convertTemperature, getWmoWeatherInfo } from '../../utils/weatherUtils';
import TemperatureTrendChart from '../charts/TemperatureTrendChart';
import PrecipitationChart from '../charts/PrecipitationChart';

export default function ForecastTabs() {
  const { weatherData, unit } = useWeather();
  const [viewMode, setViewMode] = useState('hourly'); // 'hourly' | 'daily' | 'charts'
  const [chartSubTab, setChartSubTab] = useState('temp'); // 'temp' | 'precip'

  const hourly = weatherData?.hourly || [];
  const daily = weatherData?.daily || [];

  return (
    <div className="rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm overflow-hidden">
      {/* Header and View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-slate-100 dark:border-navy-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Forecast & Analytical Projections
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            High-resolution atmospheric model simulation
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-navy-800 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('hourly')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'hourly'
                ? 'bg-white dark:bg-navy-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Hourly</span>
          </button>

          <button
            onClick={() => setViewMode('daily')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'daily'
                ? 'bg-white dark:bg-navy-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>7-Day</span>
          </button>

          <button
            onClick={() => setViewMode('charts')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'charts'
                ? 'bg-white dark:bg-navy-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Charts</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Hourly Forecast Strip */}
      {viewMode === 'hourly' && (
        <div className="p-4">
          <div className="overflow-x-auto pb-2 scrollbar-thin">
            <div className="flex gap-2.5 min-w-max">
              {hourly.map((h, idx) => {
                const info = getWmoWeatherInfo(h.weatherCode);
                const displayHtemp = convertTemperature(h.temp, unit);
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-navy-800/80 bg-slate-50/60 dark:bg-navy-850/60 w-24 text-center hover:border-slate-300 dark:hover:border-navy-700 transition-colors"
                  >
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {h.time}
                    </span>

                    <div className="my-2 text-weather-500">
                      {h.weatherCode >= 95 ? (
                        <CloudLightning className="w-5 h-5 text-amber-500 mx-auto" />
                      ) : h.weatherCode >= 50 ? (
                        <CloudRain className="w-5 h-5 text-blue-500 mx-auto" />
                      ) : h.weatherCode >= 2 ? (
                        <Cloud className="w-5 h-5 text-slate-400 mx-auto" />
                      ) : (
                        <Sun className="w-5 h-5 text-amber-500 mx-auto" />
                      )}
                    </div>

                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {displayHtemp}°{unit}
                    </div>

                    <div className="mt-1 text-[11px] text-blue-500 font-medium">
                      {h.precipProb}% rain
                    </div>

                    <div className="mt-0.5 text-[10px] text-slate-400">
                      {h.windSpeed} km/h
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: 7-Day Forecast */}
      {viewMode === 'daily' && (
        <div className="p-4 divide-y divide-slate-100 dark:divide-navy-800">
          {daily.map((d, idx) => {
            const maxT = convertTemperature(d.maxTemp, unit);
            const minT = convertTemperature(d.minTemp, unit);
            return (
              <div
                key={idx}
                className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs first:pt-0 last:pb-0"
              >
                <div className="w-24 font-semibold text-slate-800 dark:text-slate-200">
                  {d.date}
                </div>

                <div className="flex items-center gap-2 flex-1 min-w-[140px]">
                  {d.weatherCode >= 95 ? (
                    <CloudLightning className="w-4 h-4 text-amber-500 shrink-0" />
                  ) : d.weatherCode >= 50 ? (
                    <CloudRain className="w-4 h-4 text-blue-500 shrink-0" />
                  ) : d.weatherCode >= 2 ? (
                    <Cloud className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  <span className="text-slate-600 dark:text-slate-300 truncate">
                    {d.condition}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-slate-500 dark:text-slate-400">
                  <span className="text-blue-500 font-medium w-16">
                    {d.rainProb}% rain
                  </span>
                  <span className="hidden md:inline text-[11px] text-slate-400">
                    Rise: {d.sunrise} • Set: {d.sunset}
                  </span>
                  <span className="w-16 text-[11px]">
                    UV: <strong className="text-slate-700 dark:text-slate-300">{d.uv}</strong>
                  </span>
                  <span className="w-16">
                    {d.windSpeed} km/h
                  </span>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 w-20 text-right">
                    <span>{maxT}°</span>
                    <span className="text-slate-400 font-normal ml-1.5">{minT}°</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Charts */}
      {viewMode === 'charts' && (
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setChartSubTab('temp')}
              className={`px-2.5 py-1 text-xs rounded font-medium border ${
                chartSubTab === 'temp'
                  ? 'bg-weather-50 border-weather-300 text-weather-700 dark:bg-weather-950 dark:border-weather-700 dark:text-weather-300'
                  : 'border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              Hourly Temperature Trend
            </button>
            <button
              onClick={() => setChartSubTab('precip')}
              className={`px-2.5 py-1 text-xs rounded font-medium border ${
                chartSubTab === 'precip'
                  ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950 dark:border-blue-700 dark:text-blue-300'
                  : 'border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              Precipitation Probability
            </button>
          </div>

          {chartSubTab === 'temp' ? (
            <TemperatureTrendChart data={hourly} unit={unit} />
          ) : (
            <PrecipitationChart data={hourly} />
          )}
        </div>
      )}
    </div>
  );
}
