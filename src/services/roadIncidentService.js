/**
 * Modular Road Incident, Closure & Roadworks Telematics Service
 *
 * Interfaces with the backend TomTom Traffic Incidents v5 proxy to retrieve
 * live highway road closures, active/planned roadworks, and traffic incidents.
 *
 * Safety & Engineering Integrity:
 * 1. Checks incident locations against actual calculated route geometry (1 km buffer).
 * 2. Distinguishes confirmed road closures from roadworks and lane restrictions.
 * 3. Never invents incidents or construction dates when unconfigured.
 * 4. Never assumes an empty response guarantees roads are clear.
 */

export const INCIDENT_STATUS = {
  CONFIRMED_CLOSURE: 'CONFIRMED_CLOSURE',
  INCIDENTS_REPORTED: 'INCIDENTS_REPORTED',
  NO_INCIDENTS_FOUND: 'NO_INCIDENTS_FOUND',
  FEED_UNCONFIGURED: 'FEED_UNCONFIGURED',
  FEED_ERROR: 'FEED_ERROR'
};

export const INCIDENT_TYPES = {
  ROAD_CLOSED: 'roadClosed',
  ROAD_WORKS: 'roadWorks',
  LANE_CLOSED: 'laneClosed',
  ACCIDENT: 'accident',
  JAM: 'jam',
  HAZARD: 'hazard'
};

/**
 * Great-circle distance helper
 */
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Perpendicular distance from a point to a polyline segment in km
 */
function pointToSegmentDistanceKm(pLat, pLon, aLat, aLon, bLat, bLon) {
  const cosLat = Math.cos(((aLat + bLat) / 2) * Math.PI / 180);
  const dx = (bLon - aLon) * cosLat * 111.32;
  const dy = (bLat - aLat) * 110.57;
  const segLenSq = dx * dx + dy * dy;
  if (segLenSq === 0) return calculateDistanceKm(pLat, pLon, aLat, aLon);
  
  const px = (pLon - aLon) * cosLat * 111.32;
  const py = (pLat - aLat) * 110.57;
  const t = Math.max(0, Math.min(1, (px * dx + py * dy) / segLenSq));
  
  const projLat = aLat + t * (bLat - aLat);
  const projLon = aLon + t * (bLon - aLon);
  return calculateDistanceKm(pLat, pLon, projLat, projLon);
}

/**
 * Shortest distance from a point to a polyline in km
 */
export function pointToPolylineDistanceKm(pLat, pLon, polyline = []) {
  if (!polyline || polyline.length === 0) return Infinity;
  if (polyline.length === 1) return calculateDistanceKm(pLat, pLon, polyline[0][0], polyline[0][1]);
  
  let minDist = Infinity;
  for (let i = 0; i < polyline.length - 1; i++) {
    const d = pointToSegmentDistanceKm(
      pLat, pLon,
      polyline[i][0], polyline[i][1],
      polyline[i + 1][0], polyline[i + 1][1]
    );
    if (d < minDist) {
      minDist = d;
      if (minDist < 0.04) break; // Close enough to centerline
    }
  }
  return minDist;
}

/**
 * Fetch live road incidents along a route corridor via the backend proxy
 */
export async function getRouteRoadIncidents(routeCoordinates = [], corridorName = 'Transit Corridor') {
  if (!routeCoordinates || routeCoordinates.length === 0) {
    return {
      status: INCIDENT_STATUS.FEED_UNCONFIGURED,
      statusLabel: 'No Route Geometry Provided',
      isConfigured: false,
      incidents: [],
      closures: [],
      roadWorks: [],
      otherIncidents: [],
      lastChecked: new Date().toISOString(),
      disclaimer: 'The absence of reported incidents does NOT guarantee a route is completely open.'
    };
  }

  try {
    const response = await fetch('/api/route/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        routeCoordinates,
        corridorName
      }),
      signal: AbortSignal.timeout(8000)
    });

    if (response.ok) {
      const data = await response.json();
      const incidents = data.incidents || [];
      const closures = incidents.filter(i => i.isClosure || i.type === 'roadClosed');
      const roadWorks = incidents.filter(i => i.isRoadWorks || i.type === 'roadWorks');
      const otherIncidents = incidents.filter(i => !i.isClosure && !i.isRoadWorks && i.type !== 'roadClosed' && i.type !== 'roadWorks');

      return {
        status: closures.length > 0 ? INCIDENT_STATUS.CONFIRMED_CLOSURE : data.status,
        statusLabel: data.statusLabel || (closures.length > 0 ? 'Confirmed Road Closures on Route' : 'No Closures Reported'),
        isConfigured: data.isConfigured,
        provider: data.provider || 'TomTom Traffic Incidents API v5',
        incidents,
        closures,
        roadWorks,
        otherIncidents,
        totalCorridorIncidents: data.totalCorridorIncidents || incidents.length,
        setupInstructions: data.setupInstructions || null,
        lastChecked: data.lastChecked || new Date().toISOString(),
        isStale: Boolean(data.isFromCache),
        disclaimer: data.disclaimer || 'Absence of reported incidents does NOT guarantee a route is completely open.'
      };
    }
  } catch (err) {
    console.warn('[RoadIncidentService] Backend incident proxy unreachable:', err.message);
  }

  // Graceful unconfigured / offline fallback
  return {
    status: INCIDENT_STATUS.FEED_UNCONFIGURED,
    statusLabel: 'TomTom Traffic Feed Not Configured (Data Unavailable)',
    isConfigured: false,
    provider: 'TomTom Traffic Incidents API v5',
    incidents: [],
    closures: [],
    roadWorks: [],
    otherIncidents: [],
    lastChecked: new Date().toISOString(),
    setupInstructions: {
      provider: 'TomTom Traffic Incidents API (v5)',
      coverage: 'National Highways, State Highways, Expressways, and Municipal Arterials across India and worldwide.',
      pricingTier: 'Free Developer Tier (2,500 non-tile requests/day)',
      steps: [
        '1. Register a free developer account at https://developer.tomtom.com/',
        '2. Obtain your free TomTom API Key.',
        '3. Add TOMTOM_API_KEY=your_key to server/.env',
        '4. Restart backend server (cmd /c "node server/src/index.js").'
      ]
    },
    disclaimer: 'Safety Integrity Notice: Road closure feeds are unconfigured. The absence of incident feeds must NOT be interpreted as confirmation that every road is unobstructed. Always follow on-road physical signage, highway patrol advisories, and emergency vehicle guidance.'
  };
}

/**
 * Compare alternative route against reported closures to verify if it avoids them
 */
export function evaluateAlternativeRoute(primaryRoute, alternativeRoute, closures = []) {
  if (!alternativeRoute || !alternativeRoute.coordinates || alternativeRoute.coordinates.length === 0) {
    return {
      hasAlternative: false,
      avoidsClosures: false,
      message: 'No alternative route geometry provided by active routing engine.'
    };
  }

  if (!closures || closures.length === 0) {
    return {
      hasAlternative: true,
      avoidsClosures: true,
      hasClosuresOnPrimary: false,
      primaryDistanceKm: primaryRoute?.totalDistanceKm,
      primaryDurationHours: primaryRoute?.estimatedDriveTimeHours,
      altDistanceKm: alternativeRoute.distanceKm,
      altDurationHours: alternativeRoute.durationHours,
      distanceDiffKm: Math.round((alternativeRoute.distanceKm - (primaryRoute?.totalDistanceKm || 0)) * 10) / 10,
      durationDiffHours: Math.round((alternativeRoute.durationHours - (primaryRoute?.estimatedDriveTimeHours || 0)) * 10) / 10,
      message: `Alternative route available (${alternativeRoute.distanceKm} km, ~${alternativeRoute.durationHours} h). Primary route has 0 reported closures.`
    };
  }

  // Check each closure against alternative route polyline
  const obstructedClosuresOnAlt = [];
  for (const c of closures) {
    const distToAlt = pointToPolylineDistanceKm(c.lat, c.lon, alternativeRoute.coordinates);
    if (distToAlt <= 1.0) {
      obstructedClosuresOnAlt.push(c);
    }
  }

  const avoidsAll = obstructedClosuresOnAlt.length === 0;
  const distDiff = Math.round((alternativeRoute.distanceKm - (primaryRoute?.totalDistanceKm || 0)) * 10) / 10;
  const durDiff = Math.round((alternativeRoute.durationHours - (primaryRoute?.estimatedDriveTimeHours || 0)) * 10) / 10;

  return {
    hasAlternative: true,
    hasClosuresOnPrimary: true,
    avoidsClosures: avoidsAll,
    primaryDistanceKm: primaryRoute?.totalDistanceKm,
    primaryDurationHours: primaryRoute?.estimatedDriveTimeHours,
    altDistanceKm: alternativeRoute.distanceKm,
    altDurationHours: alternativeRoute.durationHours,
    distanceDiffKm: distDiff,
    durationDiffHours: durDiff,
    obstructedClosuresCount: obstructedClosuresOnAlt.length,
    message: avoidsAll
      ? `Alternative route (${alternativeRoute.distanceKm} km, ~${alternativeRoute.durationHours} h) successfully bypasses all ${closures.length} confirmed closure(s) on the main corridor (+${distDiff} km, +${durDiff} h).`
      : `Alternative route is also obstructed by ${obstructedClosuresOnAlt.length} closure(s). No verified detour bypass available.`
  };
}
