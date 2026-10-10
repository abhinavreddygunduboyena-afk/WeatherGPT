import { degreesToCompass, getWmoWeatherInfo } from '../utils/weatherUtils.js';
import { SAMPLE_FALLBACK_WEATHER, DEFAULT_LOCATIONS } from '../data/defaultLocations.js';

const WEATHER_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';

// Cache configuration: 10 minutes TTL to respect API usage limits
const CACHE_TTL_MS = 10 * 60 * 1000;
const memoryCache = new Map();

function getCacheKey(lat, lon) {
  return `${Number(lat).toFixed(2)}_${Number(lon).toFixed(2)}`;
}

function getFromCache(key) {
  // Check memory cache first
  const memoryEntry = memoryCache.get(key);
  if (memoryEntry && (Date.now() - memoryEntry.timestamp) < CACHE_TTL_MS) {
    return memoryEntry.data;
  }

  // Check localStorage cache
  try {
    const raw = localStorage.getItem(`openmeteo_cache_${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
        memoryCache.set(key, parsed);
        return parsed.data;
      }
    }
  } catch (e) {
    // ignore storage errors
  }

  return null;
}

function saveToCache(key, data) {
  if (!data || !data.isLive) return;
  const cacheEntry = { timestamp: Date.now(), data };
  memoryCache.set(key, cacheEntry);
  try {
    localStorage.setItem(`openmeteo_cache_${key}`, JSON.stringify(cacheEntry));
  } catch (e) {
    // storage might be full or private browsing
  }
}

/**
 * Fetch real-time weather & multi-day forecast from Open-Meteo
 * @param {number|string} lat - Latitude
 * @param {number|string} lon - Longitude
 * @param {string} locationName - Name of city/area
 * @param {string} timezone - Optional timezone (e.g. 'Asia/Kolkata', 'auto')
 * @param {boolean} bypassCache - Set true on manual refresh
 */
export async function fetchWeatherData(lat, lon, locationName = 'Selected Location', timezone = 'auto', bypassCache = false) {
  const numLat = typeof lat === 'number' ? lat : parseFloat(lat);
  const numLon = typeof lon === 'number' ? lon : parseFloat(lon);

  if (isNaN(numLat) || isNaN(numLon) || numLat < -90 || numLat > 90 || numLon < -180 || numLon > 180) {
    const coordErr = `Invalid geographic coordinates: latitude ${lat}, longitude ${lon}`;
    console.error(`[Open-Meteo] ${coordErr}`);
    return {
      location: { name: locationName, lat: numLat || 0, lon: numLon || 0, timezone: timezone || 'auto' },
      isLive: false,
      isDemo: false,
      source: 'LIVE WEATHER UNAVAILABLE',
      fetchError: coordErr,
      lastUpdated: new Date().toISOString(),
      current: {
        temperature: null,
        feelsLike: null,
        condition: 'Invalid Coordinates',
        weatherCode: 0,
        humidity: null,
        windSpeed: null,
        windDirection: 0,
        windDirectionText: '--',
        precipitation: null,
        pressure: null,
        uvIndex: null,
        sunrise: '--:--',
        sunset: '--:--',
        isDay: 1
      },
      hourly: [],
      daily: []
    };
  }

  const cacheKey = getCacheKey(numLat, numLon);

  if (!bypassCache) {
    const cached = getFromCache(cacheKey);
    if (cached) {
      return {
        ...cached,
        isFromCache: true
      };
    }
  }

  try {
    const params = new URLSearchParams();
    params.set('latitude', numLat.toString());
    params.set('longitude', numLon.toString());
    params.set('current', [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'rain',
      'showers',
      'snowfall',
      'weather_code',
      'cloud_cover',
      'pressure_msl',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m'
    ].join(','));
    params.set('hourly', [
      'temperature_2m',
      'relative_humidity_2m',
      'precipitation_probability',
      'precipitation',
      'weather_code',
      'wind_speed_10m',
      'uv_index',
      'soil_temperature_0cm',
      'soil_moisture_0_to_1cm',
      'et0_fao_evapotranspiration'
    ].join(','));
    params.set('daily', [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'sunrise',
      'sunset',
      'uv_index_max',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'precipitation_sum',
      'et0_fao_evapotranspiration'
    ].join(','));

    // Note: Do NOT use encodeURIComponent here. URLSearchParams safely encodes parameter values.
    const cleanTimezone = (typeof timezone === 'string' && timezone.trim() && timezone !== 'UTC')
      ? timezone.trim()
      : 'auto';
    params.set('timezone', cleanTimezone);

    const url = `${WEATHER_BASE_URL}?${params.toString()}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });

    if (!response.ok) {
      let errorReason = response.statusText || 'Bad Request';
      try {
        const errorBody = await response.json();
        console.error('[Open-Meteo] HTTP Error Response Body:', errorBody);
        if (errorBody && errorBody.reason) {
          errorReason = errorBody.reason;
        }
      } catch (parseErr) {
        try {
          const errorText = await response.text();
          console.error('[Open-Meteo] HTTP Error Response Text:', errorText);
          if (errorText) errorReason = errorText;
        } catch (textErr) {}
      }
      throw new Error(`Open-Meteo API returned HTTP status ${response.status} (${errorReason})`);
    }

    const data = await response.json();
    const formatted = formatOpenMeteoResponse(data, locationName, numLat, numLon);

    // Save successful API response to cache
    saveToCache(cacheKey, formatted);

    return formatted;
  } catch (error) {
    console.error(`[Open-Meteo] Live fetch failed for ${locationName} (${numLat}, ${numLon}):`, error.message);
    
    // Check if we have an expired cache entry to use before resorting to error fallback
    try {
      const staleRaw = localStorage.getItem(`openmeteo_cache_${cacheKey}`);
      if (staleRaw) {
        const stale = JSON.parse(staleRaw);
        if (stale?.data) {
          return {
            ...stale.data,
            isStale: true,
            isLive: false,
            source: 'Open-Meteo (Cached Offline Fallback)',
            fetchError: error.message
          };
        }
      }
    } catch (e) {}

    return {
      location: {
        name: locationName,
        lat: numLat,
        lon: numLon,
        timezone: timezone || 'auto'
      },
      isLive: false,
      isDemo: false,
      source: 'LIVE WEATHER UNAVAILABLE',
      fetchError: error.message,
      lastUpdated: new Date().toISOString(),
      current: {
        temperature: null,
        feelsLike: null,
        condition: 'Data Unavailable',
        weatherCode: 0,
        humidity: null,
        windSpeed: null,
        windDirection: 0,
        windDirectionText: '--',
        precipitation: null,
        pressure: null,
        uvIndex: null,
        sunrise: '--:--',
        sunset: '--:--',
        isDay: 1
      },
      hourly: [],
      daily: []
    };
  }
}

/**
 * Search locations using Open-Meteo Geocoding API
 * https://geocoding-api.open-meteo.com/v1/search
 */
export async function searchLocations(query) {
  if (!query || query.trim().length < 2) return [];

  const lower = query.toLowerCase().trim();
  const localMatches = DEFAULT_LOCATIONS.filter(l => 
    l.name.toLowerCase().includes(lower) || 
    l.country.toLowerCase().includes(lower) ||
    (l.region && l.region.toLowerCase().includes(lower))
  );

  try {
    const url = `${GEOCODING_BASE_URL}?name=${encodeURIComponent(query)}&count=8&language=en&format=json`;
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    
    if (response.ok) {
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results.map(r => ({
          id: `${r.id || r.name}-${r.latitude}-${r.longitude}`,
          name: r.name,
          region: r.admin1 || r.admin2 || '',
          country: r.country || '',
          lat: r.latitude,
          lon: r.longitude,
          timezone: r.timezone || 'auto',
          elevation: r.elevation || 0,
          countryCode: r.country_code || ''
        }));
      }
      // Valid response but 0 matches found globally
      return [];
    } else {
      throw new Error(`Open-Meteo geocoding returned HTTP ${response.status}`);
    }
  } catch (err) {
    console.warn('[Open-Meteo] Geocoding network error, returning preset locations:', err.message);
    const fallback = [...localMatches];
    fallback.networkError = err.message || 'Geocoding network error';
    return fallback;
  }
}

/**
 * Normalizes Open-Meteo API response to standard WeatherGPT schema
 */
function formatOpenMeteoResponse(raw, locationName, lat, lon) {
  const current = raw.current || {};
  const daily = raw.daily || {};
  const hourly = raw.hourly || {};

  const weatherInfo = getWmoWeatherInfo(current.weather_code ?? 0);
  const uvMaxToday = daily.uv_index_max?.[0] ?? 6.0;

  // Format hourly forecast (next 24 hours for quick view, and full extended series for route analysis)
  const hourlyItems = [];
  const extendedHourlyItems = [];
  if (hourly.time && hourly.time.length) {
    for (let i = 0; i < hourly.time.length; i++) {
      const timeStr = hourly.time[i];
      // Time string from Open-Meteo with timezone=auto is in ISO or "YYYY-MM-DDTHH:MM"
      const hourPart = timeStr.includes('T') ? timeStr.split('T')[1].slice(0, 5) : timeStr.slice(11, 16);

      const item = {
        time: hourPart || timeStr,
        fullTime: timeStr,
        temp: Math.round((hourly.temperature_2m?.[i] ?? 0) * 10) / 10,
        precipProb: hourly.precipitation_probability?.[i] ?? 0,
        precipMm: hourly.precipitation?.[i] ?? 0,
        windSpeed: Math.round((hourly.wind_speed_10m?.[i] ?? 0) * 10) / 10,
        condition: getWmoWeatherInfo(hourly.weather_code?.[i] ?? 0).label,
        weatherCode: hourly.weather_code?.[i] ?? 0,
        humidity: hourly.relative_humidity_2m?.[i] ?? 0,
        uvIndex: hourly.uv_index?.[i] ?? 0,
        soilTemp: hourly.soil_temperature_0cm?.[i] != null ? Math.round(hourly.soil_temperature_0cm[i] * 10) / 10 : null,
        soilMoisture: hourly.soil_moisture_0_to_1cm?.[i] != null ? Math.round(hourly.soil_moisture_0_to_1cm[i] * 1000) / 1000 : null,
        et0: hourly.et0_fao_evapotranspiration?.[i] != null ? Math.round(hourly.et0_fao_evapotranspiration[i] * 100) / 100 : null
      };

      if (i < 24) {
        hourlyItems.push(item);
      }
      extendedHourlyItems.push(item);
    }
  }

  // Format daily forecast (up to 7 days)
  const dailyItems = [];
  if (daily.time && daily.time.length) {
    for (let i = 0; i < daily.time.length; i++) {
      const isToday = i === 0;
      const isTomorrow = i === 1;
      
      let dayName = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : '';
      if (!dayName) {
        try {
          const d = new Date(daily.time[i] + 'T00:00:00');
          dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        } catch (e) {
          dayName = daily.time[i];
        }
      }

      // Format sunrise and sunset strings (ISO strings e.g. "2026-10-09T06:12")
      const sunriseStr = daily.sunrise?.[i] ? formatTimeFromIso(daily.sunrise[i]) : '--:--';
      const sunsetStr = daily.sunset?.[i] ? formatTimeFromIso(daily.sunset[i]) : '--:--';

      dailyItems.push({
        date: dayName,
        fullDate: daily.time[i],
        maxTemp: Math.round((daily.temperature_2m_max?.[i] ?? 0) * 10) / 10,
        minTemp: Math.round((daily.temperature_2m_min?.[i] ?? 0) * 10) / 10,
        condition: getWmoWeatherInfo(daily.weather_code?.[i] ?? 0).label,
        weatherCode: daily.weather_code?.[i] ?? 0,
        rainProb: daily.precipitation_probability_max?.[i] ?? 0,
        precipSumMm: daily.precipitation_sum?.[i] ?? 0,
        windSpeed: Math.round((daily.wind_speed_10m_max?.[i] ?? 0) * 10) / 10,
        uv: Math.round((daily.uv_index_max?.[i] ?? 0) * 10) / 10,
        et0: daily.et0_fao_evapotranspiration?.[i] != null ? Math.round(daily.et0_fao_evapotranspiration[i] * 10) / 10 : null,
        sunrise: sunriseStr,
        sunset: sunsetStr
      });
    }
  }

  const windDirDeg = current.wind_direction_10m ?? 0;
  const currentPressure = current.pressure_msl ?? current.surface_pressure ?? 1013;

  return {
    location: {
      name: locationName,
      lat: Number(lat),
      lon: Number(lon),
      timezone: raw.timezone || 'auto',
      timezoneAbbr: raw.timezone_abbreviation || '',
      elevation: raw.elevation || 0
    },
    isLive: true,
    isDemo: false,
    lastUpdated: current.time ? (current.time.includes('T') ? current.time : new Date().toISOString()) : new Date().toISOString(),
    source: 'Open-Meteo High-Resolution NWP (Live)',
    attribution: 'Weather data by Open-Meteo.com',
    attributionUrl: 'https://open-meteo.com/',
    current: {
      temperature: current.temperature_2m != null ? Math.round(current.temperature_2m * 10) / 10 : 25,
      feelsLike: current.apparent_temperature != null ? Math.round(current.apparent_temperature * 10) / 10 : (current.temperature_2m != null ? Math.round(current.temperature_2m * 10) / 10 : 25),
      condition: weatherInfo.label,
      weatherCode: current.weather_code ?? 0,
      humidity: current.relative_humidity_2m ?? 0,
      windSpeed: current.wind_speed_10m != null ? Math.round(current.wind_speed_10m * 10) / 10 : 0,
      windGusts: current.wind_gusts_10m != null ? Math.round(current.wind_gusts_10m * 10) / 10 : 0,
      windDirection: windDirDeg,
      windDirectionText: degreesToCompass(windDirDeg),
      precipitation: current.precipitation ?? 0,
      rain: current.rain ?? 0,
      showers: current.showers ?? 0,
      snowfall: current.snowfall ?? 0,
      cloudCover: current.cloud_cover ?? 0,
      visibility: 10,
      pressure: Math.round(currentPressure),
      uvIndex: Math.round((uvMaxToday ?? 0) * 10) / 10,
      sunrise: dailyItems[0]?.sunrise || '--:--',
      sunset: dailyItems[0]?.sunset || '--:--',
      isDay: current.is_day ?? 1
    },
    soil: {
      temperature0cm: hourly.soil_temperature_0cm?.[0] != null ? Math.round(hourly.soil_temperature_0cm[0] * 10) / 10 : null,
      soilTemperature: hourly.soil_temperature_0cm?.[0] != null ? Math.round(hourly.soil_temperature_0cm[0] * 10) / 10 : null,
      moisture0to1cm: hourly.soil_moisture_0_to_1cm?.[0] != null ? Math.round(hourly.soil_moisture_0_to_1cm[0] * 1000) / 1000 : null,
      moisturePercent: hourly.soil_moisture_0_to_1cm?.[0] != null ? Math.round(hourly.soil_moisture_0_to_1cm[0] * 100) : null,
      soilMoisturePercent: hourly.soil_moisture_0_to_1cm?.[0] != null ? Math.round(hourly.soil_moisture_0_to_1cm[0] * 100) : null,
      et0Today: daily.et0_fao_evapotranspiration?.[0] != null ? Math.round(daily.et0_fao_evapotranspiration[0] * 10) / 10 : null,
      et0WeekSum: daily.et0_fao_evapotranspiration ? Math.round(daily.et0_fao_evapotranspiration.slice(0, 7).reduce((a, b) => a + (b || 0), 0) * 10) / 10 : null
    },
    hourly: hourlyItems,
    extendedHourly: extendedHourlyItems,
    daily: dailyItems
  };
}

function formatTimeFromIso(isoStr) {
  if (!isoStr) return '';
  if (isoStr.includes('T')) {
    const timePart = isoStr.split('T')[1].slice(0, 5);
    const [h, m] = timePart.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
  }
  return isoStr;
}
