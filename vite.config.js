import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'secure-backend-api-proxy',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const parsedUrl = new URL(req.url, 'http://localhost:5173');

            // 1. ROUTING PROXY: /api/route
            if (parsedUrl.pathname === '/api/route') {
              try {
                const start = parsedUrl.searchParams.get('start'); // 'lon,lat'
                const end = parsedUrl.searchParams.get('end');     // 'lon,lat'

                if (!start || !end) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Missing start or end coordinate parameter.' }));
                  return;
                }

                const [startLon, startLat] = start.split(',').map(Number);
                const [endLon, endLat] = end.split(',').map(Number);

                if (isNaN(startLon) || isNaN(startLat) || isNaN(endLon) || isNaN(endLat)) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Invalid coordinate values.' }));
                  return;
                }

                const orsApiKey = env.ORS_API_KEY || env.OPENROUTESERVICE_API_KEY || process.env.ORS_API_KEY || process.env.OPENROUTESERVICE_API_KEY;

                // A. If OpenRouteService API key is configured in backend environment:
                if (orsApiKey && orsApiKey.trim().length > 10) {
                  try {
                    const orsUrl = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';
                    const orsResponse = await fetch(orsUrl, {
                      method: 'POST',
                      headers: {
                        'Authorization': orsApiKey.trim(),
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

                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({
                          success: true,
                          provider: 'OpenRouteService (via Secure Backend Proxy)',
                          providerCode: 'ORS',
                          isOrsKeyConfigured: true,
                          distanceMeters: summary.distance,
                          durationSeconds: summary.duration,
                          distanceKm: Math.round((summary.distance / 1000) * 10) / 10,
                          durationHours: Math.round((summary.duration / 3600) * 10) / 10,
                          coordinates: leafletCoordinates
                        }));
                        return;
                      }
                    } else {
                      console.warn(`[Backend Proxy] OpenRouteService HTTP ${orsResponse.status}. Falling back to OpenStreetMap routing engine.`);
                    }
                  } catch (orsErr) {
                    console.warn('[Backend Proxy] OpenRouteService request error:', orsErr.message);
                  }
                }

                // B. Fallback to open-access OpenStreetMap routing engine (OSRM)
                const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`;
                const osrmResponse = await fetch(osrmUrl, { signal: AbortSignal.timeout(8000) });

                if (osrmResponse.ok) {
                  const osrmData = await osrmResponse.json();
                  if (osrmData.code === 'Ok' && osrmData.routes?.length > 0) {
                    const route = osrmData.routes[0];
                    const leafletCoordinates = route.geometry.coordinates.map(([lon, lat]) => [lat, lon]);

                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      success: true,
                      provider: orsApiKey ? 'OpenStreetMap OSRM (Keyless Fallback)' : 'OpenStreetMap OSRM (Open Driving Directions)',
                      providerCode: 'OSRM',
                      isOrsKeyConfigured: Boolean(orsApiKey && orsApiKey.trim().length > 10),
                      distanceMeters: route.distance,
                      durationSeconds: route.duration,
                      distanceKm: Math.round((route.distance / 1000) * 10) / 10,
                      durationHours: Math.round((route.duration / 3600) * 10) / 10,
                      coordinates: leafletCoordinates
                    }));
                    return;
                  }
                }

                res.statusCode = 502;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: false,
                  error: 'Unable to calculate road route between specified points.'
                }));
                return;
              } catch (routeErr) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: routeErr.message }));
                return;
              }
            }

            // 2. OFFICIAL IMD WARNINGS PROXY: /api/imd/warnings
            if (parsedUrl.pathname === '/api/imd/warnings') {
              try {
                const imdApiKey = env.IMD_API_KEY || process.env.IMD_API_KEY;

                if (imdApiKey && imdApiKey.trim().length > 5) {
                  try {
                    const imdUrl = 'https://api.imd.gov.in/api/v1/districtwarning';
                    const imdResponse = await fetch(imdUrl, {
                      headers: { 'x-api-key': imdApiKey.trim() },
                      signal: AbortSignal.timeout(6000)
                    });

                    if (imdResponse.ok) {
                      const data = await imdResponse.json();
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify({
                        success: true,
                        isConfigured: true,
                        authority: 'India Meteorological Department (Ministry of Earth Sciences)',
                        data
                      }));
                      return;
                    }
                  } catch (e) {
                    console.warn('[Backend Proxy] IMD warning query failed:', e.message);
                  }
                }

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: false,
                  isConfigured: Boolean(imdApiKey && imdApiKey.trim().length > 5),
                  authority: 'India Meteorological Department (Ministry of Earth Sciences)',
                  status: 'AUTH_REQUIRED',
                  message: 'Official IMD National Highway and District nowcasts require government authentication credentials registered with the Ministry of Earth Sciences Data Portal.',
                  docUrl: 'https://api.imd.gov.in/public/api_reference.html'
                }));
                return;
              } catch (imdErr) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: imdErr.message }));
                return;
              }
            }

            // 3. SECURE FARMER LLM AI ASSISTANT PROXY: /api/farmer/ai-chat
            if (parsedUrl.pathname === '/api/farmer/ai-chat' && req.method === 'POST') {
              try {
                let body = '';
                for await (const chunk of req) {
                  body += chunk;
                }
                const payload = JSON.parse(body || '{}');
                const geminiApiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

                if (geminiApiKey && geminiApiKey.trim().length > 10) {
                  try {
                    const { prompt, lang = 'te', weather = {}, farm = {}, advisory = {}, history = [] } = payload;
                    const cropName = advisory.crop?.name || farm.cropId || 'Crop';
                    const stageName = advisory.stage?.name || 'Active Stage';
                    const locName = weather.location?.name || 'Farm';
                    const soilMoist = advisory.metrics?.soilMoisturePercent ?? 24;
                    const rain48h = advisory.metrics?.next48hRainMm ?? 0;
                    const rain7d = advisory.metrics?.next7DaysRainMm ?? 0;
                    const et0 = advisory.metrics?.et0Today ?? 4.8;
                    const temp = weather.current?.temperature ?? 28;
                    const wind = weather.current?.windSpeed ?? 10;

                    const systemInstruction = `You are an expert Agronomist & Agricultural AI Assistant advising a smallholder farmer in India.
Field Context:
- Location: ${locName}
- Crop: ${cropName} (Growth Stage: ${stageName})
- Soil Type: ${advisory.soilType?.name || 'Loam'}, Irrigation: ${advisory.irrigation?.name || 'Scheduled'}
- Current Weather: Temp ${temp}°C, Wind ${wind} km/h, Humidity ${weather.current?.humidity ?? 55}%
- Soil Telemetry: Topsoil Moisture ~${soilMoist}%, Evapotranspiration (ET0) ~${et0} mm/day
- Rainfall Forecast: Next 48h ~${rain48h} mm, 7-day cumulative ~${rain7d} mm

Rules:
1. Always reply in the requested language: ${lang === 'te' ? 'Telugu (తెలుగు)' : lang === 'hi' ? 'Hindi (हिन्दी)' : 'English'}.
2. Keep the answer practical, conversational, respectful, and concise (under 120 words).
3. Base your recommendation firmly on the provided weather and soil telemetry. Never invent rain or false risks.
4. Distinguish weather model forecasts from official government warnings. Never prescribe unregistered chemical doses without caution.`;

                    const contents = [
                      { role: 'user', parts: [{ text: `${systemInstruction}\n\nFarmer Question: ${prompt}` }] }
                    ];

                    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey.trim()}`;
                    const geminiResp = await fetch(geminiUrl, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        contents,
                        generationConfig: { temperature: 0.3, maxOutputTokens: 500 }
                      }),
                      signal: AbortSignal.timeout(10000)
                    });

                    if (geminiResp.ok) {
                      const data = await geminiResp.json();
                      const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
                      if (answer) {
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({
                          success: true,
                          answer,
                          provider: 'Google Gemini 1.5 Flash (via Secure Backend)'
                        }));
                        return;
                      }
                    }
                  } catch (gemErr) {
                    console.warn('[Backend Proxy] Gemini API query failed:', gemErr.message);
                  }
                }

                // If Gemini key is not configured or fails, inform caller to use local agronomic engine
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: false,
                  fallback: true,
                  isKeyConfigured: Boolean(geminiApiKey && geminiApiKey.trim().length > 10),
                  message: 'Gemini API key not configured or unreachable. Utilizing local Agronomic Intelligence Engine.'
                }));
                return;
              } catch (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message, fallback: true }));
                return;
              }
            }

            // 4. BHASHINI SERVICE STATUS: /api/bhashini/info
            if (parsedUrl.pathname === '/api/bhashini/info') {
              const bhashiniKey = env.BHASHINI_API_KEY || process.env.BHASHINI_API_KEY;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                isConfigured: Boolean(bhashiniKey && bhashiniKey.trim().length > 5),
                activeEngine: bhashiniKey ? 'Bhashini National Translation Mission' : 'Web Speech API (Native Indian Engine)',
                supportedLanguages: ['te', 'hi', 'en', 'kn', 'ta', 'mr'],
                docUrl: 'https://bhashini.gov.in/'
              }));
              return;
            }

            next();
          });
        }
      }
    ],
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false
        }
      }
    }
  };
});
