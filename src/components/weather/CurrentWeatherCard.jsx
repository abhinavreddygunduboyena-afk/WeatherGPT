import React from 'react';
import { 
  Sun, Cloud, CloudRain, CloudLightning, Wind, Droplets, 
  Eye, Compass, ArrowUp, ArrowDown, RefreshCw, Bookmark, BookmarkCheck,
  Gauge, AlertCircle, ExternalLink, Globe, CloudDrizzle
} from 'lucide-react';
import { useWeather } from '../../contexts/WeatherContext';
import { convertTemperature, getUvCategory, getWmoWeatherInfo } from '../../utils/weatherUtils';
import { formatCoordinates, formatTime } from '../../utils/formatters';
import DemoBadge from '../common/DemoBadge';
import Badge from '../common/Badge';
import Button from '../common/Button';

export default function CurrentWeatherCard() {
  const { 
    weatherData, 
    currentLocation,
    isLoading, 
    error, 
    refreshWeather, 
    retryWeather, 
    unit, 
    toggleUnit, 
    saveLocation, 
    removeLocation, 
    isSaved 
  } = useWeather();

  const current = weatherData?.current || {};
  const loc = currentLocation || weatherData?.location || {};
  const daily = weatherData?.daily || [];
  const todayForecast = daily[0] || {};
  const isPinned = isSaved(loc.name);

  const displayTemp = convertTemperature(current.temperature, unit);
  const displayFeelsLike = convertTemperature(current.feelsLike, unit);
  const todayMax = convertTemperature(todayForecast.maxTemp ?? current.temperature, unit);
  const todayMin = convertTemperature(todayForecast.minTemp ?? (current.temperature - 5), unit);

  const uvInfo = getUvCategory(current.uvIndex ?? 5);
  const weatherIconInfo = getWmoWeatherInfo(current.weatherCode ?? 0);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm overflow-hidden relative">
      {/* Loading overlay indicator */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 dark:bg-navy-950/70 backdrop-blur-xs z-20 flex items-center justify-center">
          <div className="flex items-center gap-2.5 px-4 py-2 bg-white dark:bg-navy-900 rounded-lg shadow-md border border-slate-200 dark:border-navy-700 text-xs font-medium text-slate-700 dark:text-slate-300">
            <RefreshCw className="w-4 h-4 text-weather-600 dark:text-weather-400 animate-spin" />
            <span>Fetching live observations from Open-Meteo...</span>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-850/50">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${weatherData.isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {loc.name || 'Selected Location'}
          </span>
          {loc.country && (
            <span className="text-xs text-slate-400">({loc.country})</span>
          )}
          <span className="hidden sm:inline-block text-[11px] text-slate-400 font-mono">
            {formatCoordinates(loc.lat, loc.lon)}
          </span>
          {loc.timezone && (
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-100 dark:bg-navy-800 px-2 py-0.5 rounded">
              <Globe className="w-3 h-3 text-slate-400" />
              <span>{loc.timezone}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {weatherData.isLive ? (
            <Badge variant="emerald" size="sm" dot>LIVE OPEN-METEO</Badge>
          ) : (error || weatherData.fetchError) ? (
            <Badge variant="rose" size="sm" dot>LIVE WEATHER UNAVAILABLE</Badge>
          ) : (
            <DemoBadge label="SIMULATED DEMO DATA" />
          )}

          {/* Unit Switcher */}
          <button
            onClick={toggleUnit}
            className="px-2 py-1 text-xs font-semibold rounded border border-slate-300 dark:border-navy-700 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            title="Toggle Temperature Unit"
          >
            °{unit}
          </button>

          {/* Pin Location */}
          <button
            onClick={() => isPinned ? removeLocation(loc.name) : saveLocation(loc)}
            className={`p-1.5 rounded-lg border transition-colors ${
              isPinned 
                ? 'border-weather-500 text-weather-600 dark:text-weather-400 bg-weather-50 dark:bg-weather-950' 
                : 'border-slate-300 dark:border-navy-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
            title={isPinned ? "Remove from saved locations" : "Save location"}
          >
            {isPinned ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>

          {/* Refresh / Retry */}
          <button
            onClick={refreshWeather}
            disabled={isLoading}
            className="p-1.5 rounded-lg border border-slate-300 dark:border-navy-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors disabled:opacity-50"
            title="Refresh live weather data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error / Offline Warning Notice Banner if applicable */}
      {(error || weatherData.fetchError) && (
        <div className="px-5 py-2.5 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900/60 flex flex-wrap items-center justify-between gap-3 text-xs text-rose-800 dark:text-rose-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>LIVE WEATHER UNAVAILABLE:</strong> {error || weatherData.fetchError}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="text-xs py-1 px-2.5 h-auto text-rose-900 dark:text-rose-100 border-rose-300 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40"
            onClick={retryWeather}
            disabled={isLoading}
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Retry Connection
          </Button>
        </div>
      )}

      {/* Main Stats Display */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Temperature, High/Low, Condition */}
        <div className="md:col-span-5 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-weather-500/10 dark:bg-weather-400/10 flex items-center justify-center shrink-0">
            {current.weatherCode >= 95 ? (
              <CloudLightning className="w-10 h-10 text-amber-500" />
            ) : current.weatherCode >= 50 ? (
              <CloudRain className="w-10 h-10 text-weather-500" />
            ) : current.weatherCode >= 2 ? (
              <Cloud className="w-10 h-10 text-blue-400" />
            ) : (
              <Sun className="w-10 h-10 text-amber-500" />
            )}
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {displayTemp}
              </span>
              <span className="text-2xl font-semibold text-slate-400">°{unit}</span>
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-0.5">
              {current.condition}
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
              <span>Feels like <strong className="font-semibold text-slate-700 dark:text-slate-300">{displayFeelsLike}°{unit}</strong></span>
              <span>•</span>
              <span className="text-slate-500 font-medium">H: {todayMax}° L: {todayMin}°</span>
            </div>
          </div>
        </div>

        {/* Right: Key atmospheric metrics grid */}
        <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Wind */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-navy-850 border border-slate-100 dark:border-navy-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Wind className="w-3.5 h-3.5 text-blue-500" />
              <span>Wind</span>
            </div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {current.windSpeed != null ? current.windSpeed : '--'} <span className="text-xs font-normal text-slate-400">km/h</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
              <Compass className="w-3 h-3" />
              <span>{current.windDirectionText || '--'} ({current.windDirection ?? 0}°)</span>
            </div>
          </div>

          {/* Humidity */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-navy-850 border border-slate-100 dark:border-navy-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
              <span>Humidity</span>
            </div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {current.humidity != null ? `${current.humidity}%` : '--'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {current.humidity != null ? (current.humidity > 70 ? 'High' : current.humidity < 35 ? 'Dry' : 'Comfortable') : '--'}
            </div>
          </div>

          {/* Precipitation */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-navy-850 border border-slate-100 dark:border-navy-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <CloudDrizzle className="w-3.5 h-3.5 text-weather-500" />
              <span>Precipitation</span>
            </div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {current.precipitation != null ? current.precipitation : '--'} <span className="text-xs font-normal text-slate-400">mm</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Today: {todayForecast.rainProb ?? 0}% prob
            </div>
          </div>

          {/* UV Index / Pressure */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-navy-850 border border-slate-100 dark:border-navy-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>UV Index</span>
            </div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {current.uvIndex != null ? current.uvIndex : '--'} <span className="text-xs font-normal text-slate-400">/ 11</span>
            </div>
            <div className={`text-[11px] font-medium mt-0.5 ${uvInfo.color}`}>
              {uvInfo.level} {current.pressure != null ? `(${current.pressure} hPa)` : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Sunrise, Sunset, Attribution */}
      <div className="px-5 py-2.5 bg-slate-50/70 dark:bg-navy-850/60 border-t border-slate-100 dark:border-navy-800 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <ArrowUp className="w-3 h-3 text-amber-500" /> Sunrise: <strong className="text-slate-700 dark:text-slate-300 font-medium">{current.sunrise}</strong>
          </span>
          <span className="flex items-center gap-1">
            <ArrowDown className="w-3 h-3 text-indigo-400" /> Sunset: <strong className="text-slate-700 dark:text-slate-300 font-medium">{current.sunset}</strong>
          </span>
        </div>

        {/* Visible Attribution */}
        <div className="flex items-center gap-2 text-[11px]">
          <span>
            Weather data by{' '}
            <a 
              href="https://open-meteo.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-semibold text-weather-600 dark:text-weather-400 hover:underline inline-flex items-center gap-0.5"
            >
              Open-Meteo.com
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </span>
          <span>•</span>
          <span>Updated: {formatTime(weatherData.lastUpdated)}</span>
        </div>
      </div>
    </div>
  );
}
