/**
 * Travel Advisor Risk Analysis & Recommendation Service
 * 
 * Provides:
 * 1. Transparent, configurable weather risk threshold evaluation.
 * 2. Multi-window departure timing comparison (-2h to +2h).
 * 3. Secure backend LLM integration proxy (Google Gemini).
 * 4. High-precision rule-based physical agrometeorological fallback engine.
 * 5. Strict safety integrity mandates: never invent closures, alerts, or safety guarantees.
 */

export const RISK_THRESHOLDS = {
  RAIN_PROB_MODERATE: 35,      // % precipitation probability
  RAIN_PROB_HIGH: 60,          // %
  RAIN_MM_MODERATE: 1.0,       // mm/hr
  RAIN_MM_HEAVY: 5.0,          // mm/hr
  HEAT_HIGH_C: 38,             // °C ambient air temperature
  HEAT_EXTREME_C: 42,          // °C
  WIND_STRONG_KMH: 30,         // km/h crosswind speed
  WIND_GALE_KMH: 50,           // km/h
  COLD_FREEZING_C: 2           // °C
};

/**
 * Identify potential travel concerns from checkpoint forecast data
 */
export function analyzeRouteWeatherRisks(checkpoints = []) {
  const risks = [];

  checkpoints.forEach((cp, idx) => {
    if (cp.isUnavailable) {
      risks.push({
        id: `unavail-${idx}`,
        location: cp.name,
        type: 'DATA_UNAVAILABLE',
        severity: 'LOW',
        metric: 'Telemetry Missing',
        threshold: 'Live Open-Meteo NWP Feed',
        reason: `Live forecast telemetry is temporarily unreachable for this checkpoint (${cp.fetchError || 'Network timeout'}). Drive cautiously with vigilance.`,
        action: 'Rely on on-road visual assessment and dynamic highway signboards.'
      });
      return;
    }

    // 1. Heavy Rain / Convective Downpour
    if (cp.precipitationMm >= RISK_THRESHOLDS.RAIN_MM_HEAVY || cp.rainProb >= RISK_THRESHOLDS.RAIN_PROB_HIGH) {
      risks.push({
        id: `rain-high-${idx}`,
        location: cp.name,
        type: 'HEAVY_RAIN',
        severity: 'HIGH',
        metric: `${cp.rainProb}% rain prob | ${cp.precipitationMm} mm expected`,
        threshold: `> ${RISK_THRESHOLDS.RAIN_PROB_HIGH}% prob or > ${RISK_THRESHOLDS.RAIN_MM_HEAVY} mm`,
        reason: `Elevated convective downpour projected around ${cp.eta} (${cp.timezoneAbbr || 'Local'}). Wet asphalt drastically reduces tire friction coefficient and increases braking distance by 30-50%.`,
        action: 'Increase following distance to 4+ seconds, activate low-beam headlights, and avoid sudden braking.'
      });
    } else if (cp.precipitationMm >= RISK_THRESHOLDS.RAIN_MM_MODERATE || cp.rainProb >= RISK_THRESHOLDS.RAIN_PROB_MODERATE) {
      risks.push({
        id: `rain-mod-${idx}`,
        location: cp.name,
        type: 'MODERATE_RAIN',
        severity: 'MODERATE',
        metric: `${cp.rainProb}% rain prob | ${cp.precipitationMm} mm`,
        threshold: `> ${RISK_THRESHOLDS.RAIN_PROB_MODERATE}% prob or > ${RISK_THRESHOLDS.RAIN_MM_MODERATE} mm`,
        reason: `Scattered convective showers or damp road surface expected around ${cp.eta}. Initial rain loosens surface oil and grime, making pavement slippery.`,
        action: 'Exercise heightened caution on curves and highway interchanges.'
      });
    }

    // 2. Extreme Heat
    if (cp.temp != null && cp.temp >= RISK_THRESHOLDS.HEAT_EXTREME_C) {
      risks.push({
        id: `heat-ext-${idx}`,
        location: cp.name,
        type: 'EXTREME_HEAT',
        severity: 'HIGH',
        metric: `${cp.temp}°C ambient temp`,
        threshold: `>= ${RISK_THRESHOLDS.HEAT_EXTREME_C}°C`,
        reason: `Severe atmospheric heat around ${cp.eta}. Asphalt surface temperatures often exceed 58°C, drastically increasing tire blowout risk and engine cooling system stress.`,
        action: 'Verify tire cold inflation pressures before departure and monitor vehicle engine temperature gauges.'
      });
    } else if (cp.temp != null && cp.temp >= RISK_THRESHOLDS.HEAT_HIGH_C) {
      risks.push({
        id: `heat-high-${idx}`,
        location: cp.name,
        type: 'HIGH_HEAT',
        severity: 'MODERATE',
        metric: `${cp.temp}°C ambient temp`,
        threshold: `>= ${RISK_THRESHOLDS.HEAT_HIGH_C}°C`,
        reason: `Elevated highway ambient heat around ${cp.eta}. Prolonged driving under high thermal load stresses battery, coolant, and AC compressors.`,
        action: 'Carry sufficient drinking water, ensure windshield washer fluid is full, and plan shaded rest breaks.'
      });
    }

    // 3. Strong Winds / Crosswinds
    if (cp.windSpeed != null && cp.windSpeed >= RISK_THRESHOLDS.WIND_GALE_KMH) {
      risks.push({
        id: `wind-gale-${idx}`,
        location: cp.name,
        type: 'GALE_WINDS',
        severity: 'HIGH',
        metric: `${cp.windSpeed} km/h wind speed`,
        threshold: `>= ${RISK_THRESHOLDS.WIND_GALE_KMH} km/h`,
        reason: `Dangerous crosswinds projected around ${cp.eta}. Elevated flyovers, river bridges, and open highway plains pose severe lateral rollover risks for high-profile vehicles.`,
        action: 'Reduce cruising speed by 15-20 km/h and maintain a firm two-handed steering grip.'
      });
    } else if (cp.windSpeed != null && cp.windSpeed >= RISK_THRESHOLDS.WIND_STRONG_KMH) {
      risks.push({
        id: `wind-str-${idx}`,
        location: cp.name,
        type: 'STRONG_WINDS',
        severity: 'MODERATE',
        metric: `${cp.windSpeed} km/h wind speed`,
        threshold: `>= ${RISK_THRESHOLDS.WIND_STRONG_KMH} km/h`,
        reason: `Noticeable crosswinds on open corridors around ${cp.eta}. Overtaking heavy commercial vehicles may induce sudden aerodynamic turbulence.`,
        action: 'Anticipate wind buffeting when exiting cuts, tunnels, or passing large container trucks.'
      });
    }

    // 4. Near-Freezing / Frost
    if (cp.temp != null && cp.temp <= RISK_THRESHOLDS.COLD_FREEZING_C) {
      risks.push({
        id: `cold-${idx}`,
        location: cp.name,
        type: 'FREEZING_TEMP',
        severity: 'HIGH',
        metric: `${cp.temp}°C ambient temp`,
        threshold: `<= ${RISK_THRESHOLDS.COLD_FREEZING_C}°C`,
        reason: `Near-freezing temperatures projected around ${cp.eta}. Elevated bridges and shaded cuts are prone to invisible black ice or frost patches.`,
        action: 'Avoid cruise control, brake very gently, and maintain extended following distance.'
      });
    }

    // 5. Thunderstorms & Low Visibility (Fog/Storm codes)
    if ([95, 96, 99].includes(cp.weatherCode)) {
      risks.push({
        id: `storm-${idx}`,
        location: cp.name,
        type: 'THUNDERSTORM',
        severity: 'HIGH',
        metric: `WMO Code ${cp.weatherCode}: ${cp.condition}`,
        threshold: 'Active convective electrical thunderstorm',
        reason: `Severe convective activity with possible lightning and sudden downpours at ${cp.eta}.`,
        action: 'Avoid parking beneath isolated trees or high billboards; slow down substantially.'
      });
    } else if ([45, 48].includes(cp.weatherCode)) {
      risks.push({
        id: `fog-${idx}`,
        location: cp.name,
        type: 'DENSE_FOG',
        severity: 'HIGH',
        metric: `WMO Code ${cp.weatherCode}: Fog`,
        threshold: 'Atmospheric visibility < 1 km',
        reason: `Dense fog reducing forward sightline distance around ${cp.eta}.`,
        action: 'Engage yellow fog lamps and low beams; use lane markings as visual guides.'
      });
    }
  });

  return risks;
}

/**
 * Compare alternative departure times (-2h, -1h, planned, +1h, +2h) using pre-fetched hourly data
 */
export function analyzeDepartureWindows(checkpoints = [], departureTime = '08:00', departureDate = null, durationHours = 4) {
  const depDateStr = (departureDate && departureDate.trim()) || new Date().toISOString().slice(0, 10);
  const [depHour, depMin] = (departureTime || '08:00').split(':').map(Number);
  const baseEpoch = new Date(`${depDateStr}T${String(depHour || 8).padStart(2, '0')}:${String(depMin || 0).padStart(2, '0')}:00`).getTime();

  // Test 5 window offsets: -2h, -1h, 0h (Planned), +1h, +2h
  const offsetsMinutes = [-120, -60, 0, 60, 120];

  const windowResults = offsetsMinutes.map(offsetMins => {
    const shiftedDepEpoch = baseEpoch + offsetMins * 60000;
    const shiftedDepDate = new Date(shiftedDepEpoch);
    const windowTimeStr = shiftedDepDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let maxRainProb = 0;
    let maxPrecipMm = 0;
    let maxTemp = -999;
    let minTemp = 999;
    let maxWind = 0;
    let wetCount = 0;

    checkpoints.forEach(cp => {
      const travelMins = Math.round((cp.fraction || 0) * (durationHours || 4) * 60);
      const waypointEtaEpoch = shiftedDepEpoch + travelMins * 60000;
      const hourlySeries = cp.allHourly || [];

      let matched = null;
      if (hourlySeries.length > 0) {
        let closestDiff = Infinity;
        for (const item of hourlySeries) {
          const itemEpoch = new Date(item.fullTime).getTime();
          const diff = Math.abs(itemEpoch - waypointEtaEpoch);
          if (diff < closestDiff) {
            closestDiff = diff;
            matched = item;
          }
        }
      }

      if (matched) {
        const pProb = matched.precipProb ?? 0;
        const pMm = matched.precipMm ?? 0;
        const temp = matched.temp ?? 25;
        const wind = matched.windSpeed ?? 0;

        if (pProb > maxRainProb) maxRainProb = pProb;
        if (pMm > maxPrecipMm) maxPrecipMm = pMm;
        if (temp > maxTemp) maxTemp = temp;
        if (temp < minTemp) minTemp = temp;
        if (wind > maxWind) maxWind = wind;
        if (pProb >= 35 || pMm > 0) wetCount++;
      }
    });

    if (maxTemp === -999) maxTemp = 28;
    if (minTemp === 999) minTemp = 22;

    const label = offsetMins === 0 
      ? `Planned (${windowTimeStr})` 
      : offsetMins < 0 
        ? `${Math.abs(offsetMins / 60)}h Earlier (${windowTimeStr})` 
        : `${offsetMins / 60}h Later (${windowTimeStr})`;

    return {
      offsetMins,
      windowTimeStr,
      label,
      isPlanned: offsetMins === 0,
      maxRainProb,
      maxPrecipMm: Math.round(maxPrecipMm * 10) / 10,
      maxTemp: Math.round(maxTemp),
      minTemp: Math.round(minTemp),
      maxWind: Math.round(maxWind),
      wetCount
    };
  });

  const planned = windowResults.find(w => w.isPlanned) || windowResults[2];
  
  // Find if an earlier or later window offers significantly better conditions
  let bestWindow = planned;
  let adviceText = '';

  const coolerWindow = windowResults.find(w => w.maxTemp <= planned.maxTemp - 4 && w.maxRainProb <= planned.maxRainProb);
  const drierWindow = windowResults.find(w => w.maxRainProb <= planned.maxRainProb - 25);

  if (drierWindow && planned.maxRainProb >= 40) {
    bestWindow = drierWindow;
    adviceText = `Departing at ${drierWindow.windowTimeStr} (${drierWindow.label}) significantly reduces precipitation probability from ${planned.maxRainProb}% to ${drierWindow.maxRainProb}%.`;
  } else if (coolerWindow && planned.maxTemp >= 37) {
    bestWindow = coolerWindow;
    adviceText = `Departing earlier at ${coolerWindow.windowTimeStr} avoids peak afternoon highway heat (${coolerWindow.maxTemp}°C vs ${planned.maxTemp}°C peak).`;
  } else {
    adviceText = `Atmospheric conditions along the corridor remain relatively consistent across adjacent departure windows (±2 hours). Your planned departure at ${planned.windowTimeStr} is well-suited.`;
  }

  return {
    windows: windowResults,
    recommendedWindow: bestWindow,
    adviceText
  };
}

/**
 * High-precision local agrometeorological and corridor reasoning engine
 */
export function synthesizeRuleBasedTravelRecommendations(routeData, departureDate = null, departureTime = '08:00') {
  if (!routeData?.checkpoints || routeData.checkpoints.length === 0) {
    return null;
  }

  const checkpoints = routeData.checkpoints;
  const risks = analyzeRouteWeatherRisks(checkpoints);
  const departureAnalysis = analyzeDepartureWindows(
    checkpoints, 
    departureTime, 
    departureDate, 
    routeData.estimatedDriveTimeHours
  );

  const highRisks = risks.filter(r => r.severity === 'HIGH');
  const modRisks = risks.filter(r => r.severity === 'MODERATE');

  let feasibility = 'FAVORABLE';
  let feasibilityLabel = 'Generally Favorable';
  let summaryText = '';

  if (highRisks.length > 0) {
    feasibility = 'HIGH_RISK';
    feasibilityLabel = 'Caution Advised — Significant Weather Impact';
    summaryText = `Substantial weather hazards detected along transit corridor. Specifically, ${highRisks.map(r => r.location).join(', ')} project ${highRisks.map(r => r.metric).join(' and ')}. Prepare for hazardous driving dynamics.`;
  } else if (modRisks.length > 0) {
    feasibility = 'CAUTION_ADVISED';
    feasibilityLabel = 'Moderately Favorable — Localized Caution';
    summaryText = `Overall driving corridor is feasible, but localized weather variations require driver attention around ${modRisks.map(r => r.location).join(', ')}.`;
  } else {
    feasibility = 'FAVORABLE';
    feasibilityLabel = 'Favorable Driving Conditions';
    summaryText = `Atmospheric telemetry indicates dry, stable conditions along the entire driving corridor from ${routeData.checkpoints[0]?.name} to ${routeData.checkpoints[routeData.checkpoints.length - 1]?.name}. Visibility and pavement friction are projected to remain optimal.`;
  }

  // Segment Caution Breakdown
  const cautionSections = risks.map(r => ({
    location: r.location,
    severity: r.severity,
    metric: r.metric,
    reason: r.reason,
    action: r.action
  }));

  // Driving Impacts Breakdown
  const maxRain = Math.max(...checkpoints.map(c => c.rainProb ?? 0));
  const maxMm = Math.max(...checkpoints.map(c => c.precipitationMm ?? 0));
  const maxTemp = Math.max(...checkpoints.map(c => c.temp ?? 25));
  const maxWind = Math.max(...checkpoints.map(c => c.windSpeed ?? 0));

  const drivingImpacts = {
    rainImpact: maxRain >= 40 || maxMm > 0
      ? `Wet pavement projected with up to ${maxRain}% rain probability (${maxMm} mm). Aquaplaning risk increases at cruising speeds exceeding 80 km/h. Braking distances will be longer.`
      : `Precipitation risk is minimal (<${Math.max(10, maxRain)}%). Road surface friction is expected to remain high and dry.`,
    heatImpact: maxTemp >= 38
      ? `High ambient heat peaking at ~${maxTemp}°C. Highway road surface temperatures can reach 55°C+, placing high thermal expansion stress on tires and demanding maximum vehicle cooling.`
      : `Ambient temperatures are moderate (peak ~${maxTemp}°C). Normal engine cooling and standard tire pressure behavior expected.`,
    windImpact: maxWind >= 30
      ? `Noticeable crosswinds up to ${maxWind} km/h detected along open segments. Maintain vigilant two-handed steering, especially on elevated river flyovers and bridges.`
      : `Wind speeds remain mild to gentle (peak ~${maxWind} km/h). Negligible lateral buffeting projected.`
  };

  // Concrete Actionable Precautions
  const precautions = [];
  if (maxRain >= 35 || maxMm > 0) {
    precautions.push('Inspect windshield wiper blades and maintain at least 4 seconds following distance on wet pavement.');
    precautions.push('Turn on low-beam headlights during rain to ensure visibility to oncoming traffic and heavy trucks.');
  }
  if (maxTemp >= 37) {
    precautions.push('Check tire cold inflation pressures before starting to prevent heat-induced tire delamination.');
    precautions.push('Inspect engine coolant levels and carry adequate hydration for passengers.');
  }
  if (maxWind >= 28) {
    precautions.push('Exercise caution when overtaking high-sided container trucks to avoid aerodynamic wind gusts.');
  }
  if (precautions.length < 3) {
    precautions.push('Verify vehicle brake pad responsiveness and tire tread depth prior to highway transit.');
    precautions.push('Plan brief 10-minute rest intervals every 2 hours of continuous expressway driving.');
  }

  return {
    success: true,
    isLlm: false,
    provider: 'Rule-Based Agrometeorological & Corridor Engine (Open-Meteo NWP Telemetry)',
    feasibility,
    feasibilityLabel,
    summaryText,
    risks,
    cautionSections,
    drivingImpacts,
    departureAdvice: departureAnalysis.adviceText,
    departureWindows: departureAnalysis.windows,
    recommendedWindow: departureAnalysis.recommendedWindow,
    precautions,
    disclaimer: 'Statistical Forecast Notice: Numerical atmospheric models are subject to microclimatic variance. Road-closure feeds are unconfigured for this sector. WeatherGPT never guarantees that a route is completely free from disruptions.'
  };
}

/**
 * Master recommendation retrieval function:
 * 1. Tries secure backend LLM endpoint (/api/route/ai-advisor).
 * 2. Falls back seamlessly to local high-precision rule-based engine.
 */
export async function fetchTravelRecommendations(routeData, departureDate = null, departureTime = '08:00') {
  if (!routeData?.checkpoints) return null;

  // 1. ATTEMPT SECURE BACKEND LLM CALL
  try {
    const response = await fetch('/api/route/ai-advisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: routeData.checkpoints[0]?.name || 'Origin',
        destination: routeData.checkpoints[routeData.checkpoints.length - 1]?.name || 'Destination',
        distanceKm: routeData.totalDistanceKm,
        durationHours: routeData.estimatedDriveTimeHours,
        departureTime,
        departureDate: departureDate || new Date().toISOString().slice(0, 10),
        checkpoints: routeData.checkpoints.map(cp => ({
          name: cp.name,
          eta: cp.eta,
          temp: cp.temp,
          condition: cp.condition,
          rainProb: cp.rainProb,
          precipitationMm: cp.precipitationMm,
          windSpeed: cp.windSpeed,
          roadCondition: cp.roadCondition,
          timezone: cp.timezone,
          timezoneAbbr: cp.timezoneAbbr
        }))
      }),
      signal: AbortSignal.timeout(6000)
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.isLlm && data.recommendations) {
        // Compute departure windows client-side so user still gets the multi-window comparison table
        const departureAnalysis = analyzeDepartureWindows(
          routeData.checkpoints,
          departureTime,
          departureDate,
          routeData.estimatedDriveTimeHours
        );
        const risks = analyzeRouteWeatherRisks(routeData.checkpoints);

        return {
          ...data.recommendations,
          isLlm: true,
          provider: data.provider || 'Google Gemini 1.5 Flash (via Express Backend)',
          risks,
          departureWindows: departureAnalysis.windows,
          recommendedWindow: departureAnalysis.recommendedWindow,
          disclaimer: 'AI-Synthesized Agrometeorological Notice: Explanations are generated by Gemini based strictly on numerical Open-Meteo observations. Official statutory alerts and road closures are separate categories. WeatherGPT never guarantees route safety.'
        };
      }
    }
  } catch (err) {
    // Graceful fallback to rule-based engine
  }

  // 2. HIGH-PRECISION RULE-BASED CORRIDOR REASONING ENGINE
  return synthesizeRuleBasedTravelRecommendations(routeData, departureDate, departureTime);
}
