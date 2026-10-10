import React from 'react';
import { 
  Sun, Cloud, CloudRain, CloudLightning, Wind, Droplets, 
  Compass, RefreshCw, Thermometer, Waves, Sprout, ExternalLink, Globe, AlertCircle 
} from 'lucide-react';
import { useWeather } from '../../contexts/WeatherContext';
import { useFarmer } from '../../contexts/FarmerContext';
import { convertTemperature, getWmoWeatherInfo } from '../../utils/weatherUtils';
import { formatTime } from '../../utils/formatters';
import Badge from '../common/Badge';

export default function FarmerWeatherCard() {
  const { weatherData, currentLocation, isLoading, error, refreshWeather, retryWeather, unit } = useWeather();
  const { farmingAdvisory } = useFarmer();

  const current = weatherData?.current || {};
  const loc = currentLocation || weatherData?.location || {};
  const daily = weatherData?.daily || [];
  const soil = weatherData?.soil || {};
  const metrics = farmingAdvisory?.metrics || {};

  const displayTemp = convertTemperature(current.temperature, unit);
  const displayFeelsLike = convertTemperature(current.feelsLike, unit);
  const displaySoilTemp = convertTemperature(soil.temperature0cm ?? current.temperature, unit);

  const weatherIconInfo = getWmoWeatherInfo(current.weatherCode ?? 0);

  // Moisture classification
  const moisturePct = metrics.soilMoisturePercent ?? (soil.moisture0to1cm ? Math.round(soil.moisture0to1cm * 100) : 24);
  const moistureStatus = moisturePct > 35 ? 'Saturated' : moisturePct > 20 ? 'Optimal Field Capacity' : 'Low / Drying Out';
  const moistureColor = moisturePct > 35 ? 'text-blue-500' : moisturePct > 20 ? 'text-emerald-500' : 'text-amber-500';

  return (
    <div className="rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm overflow-hidden relative">
      {/* Loading overlay indicator */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 dark:bg-navy-950/70 backdrop-blur-xs z-20 flex items-center justify-center">
          <div className="flex items-center gap-2.5 px-4 py-2 bg-white dark:bg-navy-900 rounded-lg shadow-md border border-slate-200 dark:border-navy-700 text-xs font-medium text-slate-700 dark:text-slate-300">
            <RefreshCw className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin" />
            <span>Fetching live farm observations from Open-Meteo...</span>
          </div>
        </div>
      )}
      
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-slate-100 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-850/50">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${weatherData?.isLive ? 'bg-emerald-500 animate-pulse' : (error || weatherData?.fetchError) ? 'bg-rose-500' : 'bg-amber-500'}`} />
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {loc.name || 'Farm Station'}
          </span>
          {loc.region && <span className="text-xs text-slate-400">({loc.region})</span>}
          {loc.timezone && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-100 dark:bg-navy-800 px-2 py-0.5 rounded font-mono">
              <Globe className="w-3 h-3 text-slate-400" />
              <span>{loc.timezone}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {weatherData?.isLive ? (
            <Badge variant="emerald" size="sm" dot>LIVE OPEN-METEO</Badge>
          ) : (error || weatherData?.fetchError) ? (
            <Badge variant="rose" size="sm" dot>LIVE WEATHER UNAVAILABLE</Badge>
          ) : (
            <Badge variant="amber" size="sm" dot>DEMO DATA</Badge>
          )}

          <button
            onClick={refreshWeather}
            disabled={isLoading}
            className="p-1.5 rounded-lg border border-slate-300 dark:border-navy-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors disabled:opacity-50"
            title="Refresh live farm telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error / Offline Warning Notice Banner */}
      {(error || weatherData?.fetchError) && (
        <div className="px-5 py-2.5 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900/60 flex flex-wrap items-center justify-between gap-3 text-xs text-rose-800 dark:text-rose-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>LIVE WEATHER UNAVAILABLE:</strong> {error || weatherData?.fetchError}
            </span>
          </div>
          <button
            className="text-xs py-1 px-2.5 rounded border border-rose-300 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40 font-medium flex items-center gap-1 text-rose-900 dark:text-rose-100"
            onClick={retryWeather || refreshWeather}
            disabled={isLoading}
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            Retry Connection
          </button>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        
        {/* Left: Current Temperature and Condition */}
        <div className="md:col-span-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
            {current.weatherCode >= 95 ? (
              <CloudLightning className="w-10 h-10 text-amber-500" />
            ) : current.weatherCode >= 50 ? (
              <CloudRain className="w-10 h-10 text-blue-500" />
            ) : current.weatherCode >= 2 ? (
              <Cloud className="w-10 h-10 text-slate-400" />
            ) : (
              <Sun className="w-10 h-10 text-amber-500" />
            )}
          </div>

          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {displayTemp}
              </span>
              <span className="text-xl font-semibold text-slate-400">°{unit}</span>
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {current.condition}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Feels like <strong className="text-slate-600 dark:text-slate-300">{displayFeelsLike}°{unit}</strong>
            </p>
          </div>
        </div>

        {/* Right: Agricultural & Soil Metrics */}
        <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          
          {/* Soil Moisture */}
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-850 border border-slate-100 dark:border-navy-800">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
              <Waves className="w-3.5 h-3.5 text-blue-500" />
              <span>Soil Moisture</span>
            </div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {soil.moisture0to1cm != null ? `${soil.moisture0to1cm} m³/m³` : `${moisturePct}%`}
            </div>
            <div className={`text-[10px] font-medium mt-0.5 ${moistureColor}`}>
              {moistureStatus}
            </div>
          </div>

          {/* Soil Temperature */}
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-850 border border-slate-100 dark:border-navy-800">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
              <Thermometer className="w-3.5 h-3.5 text-amber-500" />
              <span>Soil Temp (0cm)</span>
            </div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {displaySoilTemp}°{unit}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Root zone thermal
            </div>
          </div>

          {/* Evapotranspiration ET0 */}
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-850 border border-slate-100 dark:border-navy-800">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
              <Sun className="w-3.5 h-3.5 text-orange-400" />
              <span>Evapotransp. (ET0)</span>
            </div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {soil.et0Today ?? (daily[0]?.et0 ?? 4.8)} <span className="text-[10px] font-normal text-slate-400">mm/d</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              7-Day Sum: ~{metrics.et0Week ?? 35} mm
            </div>
          </div>

          {/* Rainfall Summary */}
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-850 border border-slate-100 dark:border-navy-800">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
              <Droplets className="w-3.5 h-3.5 text-weather-500" />
              <span>Rainfall</span>
            </div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {current.precipitation ?? 0} <span className="text-[10px] font-normal text-slate-400">mm today</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              7-Day: ~{metrics.next7DaysRainMm ?? 0} mm
            </div>
          </div>

        </div>

      </div>

      {/* Atmospheric Secondary Metrics Bar */}
      <div className="px-5 py-2.5 bg-slate-50/70 dark:bg-navy-850/60 border-t border-slate-100 dark:border-navy-800 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-blue-500" />
            Relative Humidity: <strong className="text-slate-700 dark:text-slate-300">{current.humidity}%</strong>
          </span>
          <span className="flex items-center gap-1">
            <Wind className="w-3.5 h-3.5 text-blue-500" />
            Wind: <strong className="text-slate-700 dark:text-slate-300">{current.windSpeed} km/h {current.windDirectionText}</strong>
            {current.windGusts > 0 && <span className="text-[10px] text-slate-400">(Gusts: {current.windGusts} km/h)</span>}
          </span>
          <span className="flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-slate-400" />
            Safe Spraying Window: <strong className="text-emerald-600 dark:text-emerald-400">{metrics.safeSprayHoursCount || 0} hrs today</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span>
            Telemetry by{' '}
            <a 
              href="https://open-meteo.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5"
            >
              Open-Meteo.com
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </span>
          <span>•</span>
          <span>Updated: {formatTime(weatherData?.lastUpdated)}</span>
        </div>
      </div>

    </div>
  );
}
