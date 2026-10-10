import { config } from '../config/env.js';

export async function handleGetDrivingRoute(req, res, next) {
  try {
    const { start, end } = req.routeCoordinates;
    const [startLon, startLat] = start;
    const [endLon, endLat] = end;
    const orsApiKey = config.orsApiKey;

    // 1. If OpenRouteService API key is configured in backend environment:
    if (orsApiKey && orsApiKey.length > 10) {
      try {
        const orsUrl = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';
        const orsResponse = await fetch(orsUrl, {
          method: 'POST',
          headers: {
            'Authorization': orsApiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json, application/geo+json'
          },
          body: JSON.stringify({
            coordinates: [[startLon, startLat], [endLon, endLat]]
          }),
          signal: AbortSignal.timeout(8000)
        });

        if (orsResponse.ok) {
          const orsData = await orsResponse.json();
          const feature = orsData.features?.[0];

          if (feature) {
            const summary = feature.properties?.summary || {};
            const leafletCoordinates = feature.geometry.coordinates.map(([lon, lat]) => [lat, lon]);

            return res.json({
              success: true,
              provider: 'OpenRouteService (via Secure Express Backend)',
              providerCode: 'ORS',
              isOrsKeyConfigured: true,
              distanceMeters: summary.distance,
              durationSeconds: summary.duration,
              distanceKm: Math.round((summary.distance / 1000) * 10) / 10,
              durationHours: Math.round((summary.duration / 3600) * 10) / 10,
              coordinates: leafletCoordinates
            });
          }
        } else {
          console.warn(`[RouteController] OpenRouteService HTTP ${orsResponse.status}. Falling back to OpenStreetMap OSRM.`);
        }
      } catch (orsErr) {
        console.warn('[RouteController] OpenRouteService request error:', orsErr.message);
      }
    }

    // 2. Fallback to open-access OpenStreetMap routing engine (OSRM)
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson&alternatives=true`;
    const osrmResponse = await fetch(osrmUrl, { signal: AbortSignal.timeout(8000) });

    if (osrmResponse.ok) {
      const osrmData = await osrmResponse.json();
      if (osrmData.code === 'Ok' && osrmData.routes?.length > 0) {
        const route = osrmData.routes[0];
        const leafletCoordinates = route.geometry.coordinates.map(([lon, lat]) => [lat, lon]);

        let alternativeRoute = null;
        if (osrmData.routes.length > 1) {
          const altRoute = osrmData.routes[1];
          alternativeRoute = {
            distanceKm: Math.round((altRoute.distance / 1000) * 10) / 10,
            durationHours: Math.round((altRoute.duration / 3600) * 10) / 10,
            coordinates: altRoute.geometry.coordinates.map(([lon, lat]) => [lat, lon])
          };
        }

        return res.json({
          success: true,
          provider: orsApiKey ? 'OpenStreetMap OSRM (Keyless Fallback)' : 'OpenStreetMap OSRM (Open Driving Directions)',
          providerCode: 'OSRM',
          isOrsKeyConfigured: Boolean(orsApiKey && orsApiKey.length > 10),
          distanceMeters: route.distance,
          durationSeconds: route.duration,
          distanceKm: Math.round((route.distance / 1000) * 10) / 10,
          durationHours: Math.round((route.duration / 3600) * 10) / 10,
          coordinates: leafletCoordinates,
          alternativeRoute
        });
      }
    }

    return res.status(502).json({
      success: false,
      error: 'Unable to calculate driving route between specified points from active routing providers.',
      code: 'ROUTING_SERVICE_UNAVAILABLE'
    });
  } catch (err) {
    next(err);
  }
}

export async function handleRouteAiAdvisor(req, res, next) {
  try {
    const { 
      origin = 'Origin', 
      destination = 'Destination', 
      distanceKm = 0, 
      durationHours = 0, 
      departureTime = '08:00',
      departureDate = '',
      checkpoints = [] 
    } = req.body;
    
    const geminiApiKey = config.geminiApiKey;

    if (geminiApiKey && geminiApiKey.length > 10) {
      try {
        const checkpointsSummary = checkpoints.map(cp => 
          `- ${cp.name} (ETA: ${cp.eta} ${cp.timezoneAbbr || ''}): Temp ${cp.temp ?? '--'}°C, Condition: ${cp.condition || 'Fair'}, Rain Prob: ${cp.rainProb ?? 0}%, Precip: ${cp.precipitationMm ?? 0} mm, Wind: ${cp.windSpeed ?? 0} km/h, Road: ${cp.roadCondition || 'Dry'}`
        ).join('\n');

        const systemPrompt = `You are an expert Highway Agrometeorologist and Travel Corridor Safety Analyst.
Route Details:
- Origin: ${origin}
- Destination: ${destination}
- Distance: ${distanceKm} km, Duration: ~${durationHours} hours
- Planned Departure: ${departureDate} at ${departureTime}

Checkpoint Forecast Telemetry:
${checkpointsSummary}

STRICT SAFETY & INTEGRITY CONSTRAINTS:
1. Base every conclusion strictly on the provided checkpoint forecasts (temp, rain prob, precipitation mm, wind speed).
2. NEVER invent weather observations, official government alerts, traffic accidents, or road closures.
3. NEVER guarantee that a route is 100% safe.
4. DO NOT claim an alternate route is better without physical data.
5. Road-closure feeds are unconfigured; remind driver that missing closure alerts does not mean roads are clear.

Provide a response in JSON format with exactly the following structure:
{
  "feasibility": "FAVORABLE" | "CAUTION_ADVISED" | "HIGH_RISK",
  "feasibilityLabel": "Favorable" | "Caution Advised" | "High Weather Impact",
  "summaryText": "Concise summary of corridor driving conditions under 80 words.",
  "cautionSections": [
    {
      "location": "Name of section",
      "severity": "MODERATE" | "HIGH",
      "metric": "Key weather metric",
      "reason": "Clear explanation of why this section was flagged",
      "action": "Concrete driver action"
    }
  ],
  "drivingImpacts": {
    "rainImpact": "Analysis of wet pavement, aquaplaning risk, and braking distances.",
    "heatImpact": "Analysis of thermal asphalt stress, tire pressure, and engine cooling.",
    "windImpact": "Analysis of crosswinds and vehicle stability."
  },
  "departureAdvice": "Evaluation of whether departing earlier or later offers better weather conditions.",
  "precautions": [
    "Precaution 1",
    "Precaution 2",
    "Precaution 3"
  ]
}`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nAnalyze this corridor and output raw JSON only.` }]
            }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 800,
              responseMimeType: 'application/json'
            }
          }),
          signal: AbortSignal.timeout(10000)
        });

        if (response.ok) {
          const data = await response.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            let parsed = null;
            try {
              parsed = JSON.parse(rawText);
            } catch (pErr) {
              const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
              parsed = JSON.parse(cleaned);
            }

            if (parsed) {
              return res.json({
                success: true,
                isLlm: true,
                provider: 'Google Gemini 1.5 Flash (via Express Backend)',
                recommendations: parsed
              });
            }
          }
        }
      } catch (geminiErr) {
        console.warn('[RouteController] Gemini AI advisor request error:', geminiErr.message);
      }
    }

    // Graceful fallback indicating rule-based engine should be used
    return res.json({
      success: false,
      fallback: true,
      isKeyConfigured: Boolean(geminiApiKey && geminiApiKey.length > 10),
      message: 'Gemini API key not configured or unreachable. Utilizing local Corridor Agrometeorological Engine.',
      provider: 'Rule-Based Agrometeorological & Corridor Engine (Open-Meteo NWP Telemetry)'
    });
  } catch (err) {
    next(err);
  }
}

// In-memory cache for TomTom Traffic Incident responses: 5-minute TTL to respect request limits
const incidentCache = new Map();
const INCIDENT_CACHE_TTL_MS = 5 * 60 * 1000;

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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

function pointToPolylineDistanceKm(pLat, pLon, polyline) {
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
      if (minDist < 0.05) break; // Within 50m of centerline
    }
  }
  return minDist;
}

export async function handleGetRouteIncidents(req, res, next) {
  try {
    const { routeCoordinates = [], bbox: inputBbox, corridorName = 'Transit Corridor' } = req.body;
    const tomtomApiKey = config.tomtomApiKey;

    // Compute bounding box if not explicitly passed
    let bbox = inputBbox;
    if ((!bbox || bbox.length < 4) && routeCoordinates.length > 0) {
      let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;
      for (const [lat, lon] of routeCoordinates) {
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lon < minLon) minLon = lon;
        if (lon > maxLon) maxLon = lon;
      }
      // Add a 0.08 degree (~8-9km) safety margin
      const pad = 0.08;
      bbox = [
        Math.max(-180, Math.round((minLon - pad) * 10000) / 10000),
        Math.max(-90, Math.round((minLat - pad) * 10000) / 10000),
        Math.min(180, Math.round((maxLon + pad) * 10000) / 10000),
        Math.min(90, Math.round((maxLat + pad) * 10000) / 10000)
      ];
    }

    // 1. If TomTom API Key is NOT configured:
    if (!tomtomApiKey || tomtomApiKey.length < 10) {
      return res.json({
        success: false,
        isConfigured: false,
        status: 'FEED_UNCONFIGURED',
        statusLabel: 'TomTom Traffic Feed Not Configured (Data Unavailable)',
        provider: 'TomTom Traffic Incidents API v5',
        incidents: [],
        lastChecked: new Date().toISOString(),
        setupInstructions: {
          provider: 'TomTom Traffic Incidents API (v5)',
          coverage: 'National Highways, State Highways, Expressways, and Municipal Arterials across India and worldwide.',
          pricingTier: 'Free Developer Tier (2,500 non-tile requests/day)',
          steps: [
            '1. Register a free developer account at https://developer.tomtom.com/',
            '2. Create an app to get your free TomTom API Key.',
            '3. Set TOMTOM_API_KEY=your_key in server/.env',
            '4. Restart the backend server (cmd /c "node server/src/index.js").'
          ]
        },
        disclaimer: 'Safety Integrity Notice: Road closure feeds are unconfigured. The absence of incident feeds must NOT be interpreted as confirmation that every road is unobstructed. Always follow on-road physical signage, highway patrol advisories, and emergency vehicle guidance.'
      });
    }

    // 2. If TomTom API Key is configured, check in-memory cache:
    const cacheKey = bbox ? bbox.join(',') : 'all';
    const cached = incidentCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < INCIDENT_CACHE_TTL_MS)) {
      return res.json({
        ...cached.data,
        isFromCache: true
      });
    }

    // Query TomTom Traffic Incident Details API v5
    const bboxParam = `${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}`;
    const tomtomUrl = `https://api.tomtom.com/traffic/services/5/incidentDetails?key=${tomtomApiKey}&bbox=${bboxParam}&fields={incidents{type,geometry{type,coordinates},properties{id,iconCategory,magnitudeOfDelay,events{code,description},from,to,roadNumbers,startTime,endTime,length,delay}}}&language=en-GB&timeValidityFilter=present`;

    const response = await fetch(tomtomUrl, { signal: AbortSignal.timeout(9000) });

    if (!response.ok) {
      console.warn(`[RouteController] TomTom Incident API returned HTTP ${response.status}`);
      return res.json({
        success: false,
        isConfigured: true,
        status: 'FEED_ERROR',
        statusLabel: `TomTom API Error (HTTP ${response.status})`,
        provider: 'TomTom Traffic Incidents API v5',
        incidents: [],
        lastChecked: new Date().toISOString(),
        disclaimer: 'Temporary provider communication error. Road status unverified.'
      });
    }

    const data = await response.json();
    const rawIncidents = data.incidents || [];
    const matchedIncidents = [];

    for (const inc of rawIncidents) {
      const geom = inc.geometry || {};
      const props = inc.properties || {};

      let lat = null, lon = null;
      if (geom.type === 'Point' && Array.isArray(geom.coordinates)) {
        [lon, lat] = geom.coordinates;
      } else if (geom.type === 'LineString' && Array.isArray(geom.coordinates) && geom.coordinates.length > 0) {
        // Use midpoint of the line string
        const midIdx = Math.floor(geom.coordinates.length / 2);
        [lon, lat] = geom.coordinates[midIdx];
      }

      if (lat == null || lon == null) continue;

      // Calculate distance to calculated route polyline
      const distToRoute = pointToPolylineDistanceKm(lat, lon, routeCoordinates);
      const isBufferMatch = distToRoute <= 1.0; // 1 km corridor buffer

      const iconCat = props.iconCategory;
      let type = 'hazard';
      let typeLabel = 'Traffic Hazard';
      if (iconCat === 8) {
        type = 'roadClosed';
        typeLabel = 'Road Closed';
      } else if (iconCat === 9) {
        type = 'roadWorks';
        typeLabel = 'Road Works';
      } else if (iconCat === 7) {
        type = 'laneClosed';
        typeLabel = 'Lane Closed';
      } else if (iconCat === 1) {
        type = 'accident';
        typeLabel = 'Accident';
      } else if (iconCat === 6) {
        type = 'jam';
        typeLabel = 'Severe Congestion';
      }

      let severityLabel = 'Moderate';
      if (props.magnitudeOfDelay === 4 || iconCat === 8) severityLabel = 'Major / Complete Closure';
      else if (props.magnitudeOfDelay === 3) severityLabel = 'High Delay';
      else if (props.magnitudeOfDelay === 2) severityLabel = 'Moderate Delay';
      else if (props.magnitudeOfDelay === 1) severityLabel = 'Minor Delay';

      const roadName = props.from 
        ? `${props.from}${props.to ? ` to ${props.to}` : ''}`
        : (props.roadNumbers && props.roadNumbers.length > 0 ? props.roadNumbers.join(', ') : 'Corridor Highway');

      const desc = props.events && props.events.length > 0 
        ? props.events.map(e => e.description).join('. ')
        : typeLabel;

      const incidentObj = {
        id: props.id || `inc-${lat}-${lon}`,
        type,
        typeLabel,
        iconCategory: iconCat,
        severity: severityLabel,
        isClosure: iconCat === 8,
        isRoadWorks: iconCat === 9,
        isLaneClosed: iconCat === 7,
        roadName,
        roadNumbers: props.roadNumbers || [],
        description: desc,
        startTime: props.startTime || null,
        endTime: props.endTime || null,
        delaySeconds: props.delay || 0,
        lengthMeters: props.length || 0,
        lat: Math.round(lat * 100000) / 100000,
        lon: Math.round(lon * 100000) / 100000,
        distToRouteKm: Math.round(distToRoute * 100) / 100,
        affectsRoute: isBufferMatch
      };

      if (isBufferMatch) {
        matchedIncidents.push(incidentObj);
      }
    }

    const responsePayload = {
      success: true,
      isConfigured: true,
      status: matchedIncidents.length > 0 ? 'INCIDENTS_REPORTED' : 'NO_INCIDENTS_FOUND',
      statusLabel: matchedIncidents.length > 0 
        ? `${matchedIncidents.length} Incident(s) Directly Affecting Route` 
        : 'No Matching Road Closures or Works Reported by Provider',
      provider: 'TomTom Traffic Incidents API v5',
      incidents: matchedIncidents,
      totalCorridorIncidents: rawIncidents.length,
      lastChecked: new Date().toISOString(),
      disclaimer: 'The absence of reported incidents does NOT guarantee a route is completely open or free of construction delays. Local uncatalogued municipal diversions or sudden police interventions may not be reflected in telematics feeds.'
    };

    incidentCache.set(cacheKey, { timestamp: Date.now(), data: responsePayload });
    return res.json(responsePayload);

  } catch (err) {
    next(err);
  }
}
