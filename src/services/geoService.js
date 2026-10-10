import { fetchWeatherData } from './weatherService.js';

/**
 * Great-circle distance calculation between two points in km
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Fetch real driving route geometry from backend proxy (OpenRouteService / OSRM fallback)
 */
export async function fetchDrivingRoute(originCoords, destCoords) {
  const startParam = `${originCoords.lon},${originCoords.lat}`;
  const endParam = `${destCoords.lon},${destCoords.lat}`;

  try {
    // 1. Try secure backend proxy endpoint
    const response = await fetch(`/api/route?start=${startParam}&end=${endParam}`, {
      signal: AbortSignal.timeout(9000)
    });

    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      const data = await response.json();
      if (data.success && data.coordinates && data.coordinates.length > 0) {
        return data;
      }
    }
  } catch (backendErr) {
    console.warn('[Routing Service] Backend proxy unreachable, falling back to direct public OSRM:', backendErr.message);
  }

  // 2. Direct fallback to OpenStreetMap public routing engine if backend proxy fails
  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originCoords.lon},${originCoords.lat};${destCoords.lon},${destCoords.lat}?overview=full&geometries=geojson&alternatives=true`;
    const osrmRes = await fetch(osrmUrl, { signal: AbortSignal.timeout(8000) });

    if (osrmRes.ok) {
      const osrmData = await osrmRes.json();
      if (osrmData.code === 'Ok' && osrmData.routes?.length > 0) {
        const route = osrmData.routes[0];
        const coordinates = route.geometry.coordinates.map(([lon, lat]) => [lat, lon]);

        let alternativeRoute = null;
        if (osrmData.routes.length > 1) {
          const alt = osrmData.routes[1];
          alternativeRoute = {
            distanceKm: Math.round((alt.distance / 1000) * 10) / 10,
            durationHours: Math.round((alt.duration / 3600) * 10) / 10,
            coordinates: alt.geometry.coordinates.map(([lon, lat]) => [lat, lon])
          };
        }

        return {
          success: true,
          provider: 'OpenStreetMap OSRM (Direct Public Client Fallback)',
          providerCode: 'OSRM',
          distanceMeters: route.distance,
          durationSeconds: route.duration,
          distanceKm: Math.round((route.distance / 1000) * 10) / 10,
          durationHours: Math.round((route.duration / 3600) * 10) / 10,
          coordinates,
          alternativeRoute
        };
      }
    }
  } catch (err) {
    console.error('[Routing Service] Direct OSRM query failed:', err);
  }

  // 3. Fallback straight-line interpolation if completely offline
  const dist = calculateDistanceKm(originCoords.lat, originCoords.lon, destCoords.lat, destCoords.lon);
  const straightLine = [
    [originCoords.lat, originCoords.lon],
    [(originCoords.lat + destCoords.lat) / 2, (originCoords.lon + destCoords.lon) / 2],
    [destCoords.lat, destCoords.lon]
  ];

  return {
    success: true,
    provider: 'Straight-line Corridor Interpolator (Network Offline)',
    providerCode: 'OFFLINE_ESTIMATE',
    distanceKm: dist,
    durationHours: Math.round((dist / 65) * 10) / 10,
    coordinates: straightLine
  };
}

/**
 * Generate route checkpoints with live weather along the actual road path
 */
/**
 * Utility: format date to YYYY-MM-DDTHH:00 in specified timezone to match Open-Meteo hourly timestamps
 */
function getLocalHourlyTarget(date, timeZone) {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timeZone && timeZone !== 'auto' ? timeZone : undefined,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      hour12: false
    }).formatToParts(date);
    const y = parts.find(p => p.type === 'year')?.value;
    const m = parts.find(p => p.type === 'month')?.value;
    const d = parts.find(p => p.type === 'day')?.value;
    let h = parts.find(p => p.type === 'hour')?.value || '00';
    if (h === '24') h = '00';
    return `${y}-${m}-${d}T${h}:00`;
  } catch (e) {
    return date.toISOString().slice(0, 13) + ':00';
  }
}

/**
 * Generate route checkpoints with live weather along the actual road path
 */
export async function generateTravelCorridorWithLiveWeather(
  originName, 
  originCoords, 
  destName, 
  destCoords, 
  departureTime = '08:00',
  departureDate = null
) {
  // Step 1: Fetch driving route
  const routeResult = await fetchDrivingRoute(originCoords, destCoords);
  const polyline = routeResult.coordinates || [];
  const totalDistanceKm = routeResult.distanceKm || calculateDistanceKm(originCoords.lat, originCoords.lon, destCoords.lat, destCoords.lon);
  const durationHours = routeResult.durationHours || Math.round((totalDistanceKm / 65) * 10) / 10;

  // Step 2: Select 5 representative sample points along the route geometry
  const numWaypoints = 5;
  const rawWaypoints = [];
  const totalPoints = polyline.length;

  for (let i = 0; i < numWaypoints; i++) {
    const fraction = i / (numWaypoints - 1);
    const pointIdx = Math.min(totalPoints - 1, Math.round(fraction * (totalPoints - 1)));
    const [lat, lon] = polyline[pointIdx] || [originCoords.lat, originCoords.lon];
    const pointDistKm = Math.round(totalDistanceKm * fraction);

    let name = '';
    if (i === 0) name = `Origin: ${originName}`;
    else if (i === numWaypoints - 1) name = `Destination: ${destName}`;
    else name = `Corridor Milepost ${pointDistKm} km`;

    rawWaypoints.push({
      step: i + 1,
      fraction,
      name,
      lat,
      lon,
      distanceFromOrigin: pointDistKm
    });
  }

  // Step 3: Compute ETAs and fetch live forecasts from Open-Meteo
  const depDateStr = (departureDate && departureDate.trim()) || new Date().toISOString().slice(0, 10);
  const [depHour, depMin] = (departureTime || '08:00').split(':').map(Number);
  const depDateTime = new Date(`${depDateStr}T${String(depHour || 8).padStart(2, '0')}:${String(depMin || 0).padStart(2, '0')}:00`);

  const checkpointsWithWeather = await Promise.all(
    rawWaypoints.map(async (wp) => {
      const travelMins = Math.round((wp.fraction * durationHours) * 60);
      const eta = new Date(depDateTime.getTime() + travelMins * 60000);
      const etaStr = eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      try {
        // Fetch weather from cached Open-Meteo service
        const weather = await fetchWeatherData(wp.lat, wp.lon, wp.name, 'auto');
        const tz = weather?.location?.timezone || 'auto';
        const tzAbbr = weather?.location?.timezoneAbbr || '';
        
        // Find hourly forecast closest to the arrival time in waypoint's local timezone
        const targetIso = getLocalHourlyTarget(eta, tz);
        const hourlySeries = weather?.extendedHourly || weather?.hourly || [];
        
        let matchedHourly = hourlySeries.find(h => h.fullTime === targetIso);
        if (!matchedHourly && hourlySeries.length > 0) {
          // Find closest hourly item by absolute time distance
          const etaEpoch = eta.getTime();
          let closestDiff = Infinity;
          for (const item of hourlySeries) {
            const itemEpoch = new Date(item.fullTime).getTime();
            const diff = Math.abs(itemEpoch - etaEpoch);
            if (diff < closestDiff) {
              closestDiff = diff;
              matchedHourly = item;
            }
          }
        }

        const curr = weather?.current || {};
        const temp = matchedHourly?.temp != null ? Math.round(matchedHourly.temp) : (curr.temperature != null ? Math.round(curr.temperature) : null);
        const condition = matchedHourly?.condition || curr.condition || 'Clear';
        const weatherCode = matchedHourly?.weatherCode ?? curr.weatherCode ?? 0;
        const windSpeed = matchedHourly?.windSpeed != null ? Math.round(matchedHourly.windSpeed) : (curr.windSpeed != null ? Math.round(curr.windSpeed) : 0);
        const rainProb = matchedHourly?.precipProb != null ? matchedHourly.precipProb : (curr.precipitation > 0 ? 80 : 0);
        const precipitationMm = matchedHourly?.precipMm != null ? matchedHourly.precipMm : (curr.precipitation ?? 0);
        const humidity = matchedHourly?.humidity ?? curr.humidity ?? null;

        // Realistic road surface assessment strictly based on physical telemetry
        let roadCondition = 'Dry & Stable';
        if (rainProb >= 50 || precipitationMm >= 2.0) {
          roadCondition = 'Wet Pavement — High Aquaplaning Risk';
        } else if (rainProb >= 30 || precipitationMm > 0) {
          roadCondition = 'Damp Pavement — Caution on Curves';
        } else if (temp != null && temp >= 38) {
          roadCondition = 'Dry — Elevated Thermal Asphalt Temp';
        } else if (temp != null && temp <= 2) {
          roadCondition = 'Possible Freezing / Frost Hazard';
        }

        return {
          ...wp,
          eta: etaStr,
          etaIso: eta.toISOString(),
          forecastTime: `${etaStr} (${tzAbbr || tz})`,
          timezone: tz,
          timezoneAbbr: tzAbbr,
          temp,
          condition,
          weatherCode,
          windSpeed,
          windDirectionText: curr.windDirectionText || 'SW',
          rainProb,
          precipitationMm,
          humidity,
          roadCondition,
          isLive: weather?.isLive ?? false,
          isStale: Boolean(weather?.isStale),
          isUnavailable: !weather?.isLive && !weather?.isStale,
          lastUpdated: weather?.lastUpdated || new Date().toISOString(),
          allHourly: hourlySeries
        };
      } catch (err) {
        return {
          ...wp,
          eta: etaStr,
          etaIso: eta.toISOString(),
          forecastTime: `${etaStr} (Local)`,
          timezone: 'auto',
          timezoneAbbr: '',
          temp: null,
          condition: 'Data Unavailable',
          weatherCode: 0,
          windSpeed: null,
          windDirectionText: '--',
          rainProb: null,
          precipitationMm: null,
          humidity: null,
          roadCondition: 'Forecast Unavailable',
          isLive: false,
          isStale: false,
          isUnavailable: true,
          fetchError: err.message,
          lastUpdated: new Date().toISOString(),
          allHourly: []
        };
      }
    })
  );

  return {
    totalDistanceKm,
    estimatedDriveTimeHours: durationHours,
    provider: routeResult.provider,
    providerCode: routeResult.providerCode,
    isOrsKeyConfigured: routeResult.isOrsKeyConfigured,
    polyline,
    alternativeRoute: routeResult.alternativeRoute || null,
    checkpoints: checkpointsWithWeather
  };
}

/**
 * Query official meteorological and highway warning status (IMD)
 */
export async function fetchOfficialWarnings() {
  try {
    const res = await fetch('/api/imd/warnings');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch (e) {
    console.warn('[IMD Service] Warning endpoint request error:', e.message);
  }

  return {
    success: false,
    isConfigured: false,
    authority: 'India Meteorological Department (Ministry of Earth Sciences)',
    status: 'AUTH_REQUIRED',
    message: 'Official IMD National Highway and District nowcasts require government authentication credentials registered with the Ministry of Earth Sciences Data Portal.',
    docUrl: 'https://api.imd.gov.in/public/api_reference.html'
  };
}

/**
 * Retrieve verified road closure information
 * Strict constraint: Never invent road closures without authenticated feed.
 */
export function getRoadClosureFeedStatus() {
  return {
    status: 'DATA_UNAVAILABLE',
    statusLabel: 'Data Unavailable (No Public Feed)',
    coverage: 'National Highway Corridor',
    reason: 'Official highway incident and live closure feeds are currently unavailable for this corridor. NHAI and traffic authorities do not offer open public feeds without institutional clearances. OpenStreetMap geometry is not a live closure feed. In accordance with safety integrity standards, WeatherGPT strictly does not invent road closures without verified authority data.',
    disclaimer: 'Absence of reported incidents does NOT guarantee a route is 100% free of obstructions or construction.'
  };
}
