/**
 * WeatherGPT Context-Aware Conversational Intelligence Engine
 * Handles natural language inquiries, multilingual explanations (including Telugu),
 * outdoor event recommendations, and safety precautions.
 */

export async function askWeatherAssistant(userQuery, weatherData, activeAlerts = []) {
  // Simulate natural brief AI inference latency (300-600ms)
  await new Promise(resolve => setTimeout(resolve, 450));

  const query = userQuery.toLowerCase().trim();
  const location = weatherData?.location?.name || 'the current region';
  const currentTemp = weatherData?.current?.temperature ?? 26;
  const currentCondition = weatherData?.current?.condition ?? 'Partly Cloudy';
  const tomorrowForecast = weatherData?.daily?.[1] || weatherData?.daily?.[0];
  const tomorrowRain = tomorrowForecast?.rainProb ?? 20;
  const tomorrowMax = tomorrowForecast?.maxTemp ?? 30;
  const tomorrowCondition = tomorrowForecast?.condition ?? 'Fair';
  const uvIndex = weatherData?.current?.uvIndex ?? 6;
  const windSpeed = weatherData?.current?.windSpeed ?? 12;

  // 1. Telugu language inquiry
  if (query.includes('telugu') || query.includes('తెలుగు')) {
    return {
      text: `నమస్కారం! **${location}** వాతావరణ తాజా సమాచారం:

• **ప్రస్తుత ఉష్ణోగ్రత:** ${currentTemp}°C (${currentCondition})
• **తేమ (హ్యుమిడిటీ):** ${weatherData?.current?.humidity ?? 55}%
• **గాలుల వేగం:** ${windSpeed} km/h
• **రేపటి వాతావరణం:** గరిష్ట ఉష్ణోగ్రత ${tomorrowMax}°C, వర్షం పడే అవకాశం ${tomorrowRain}%.

**ముఖ్యమైన జాగ్రత్తలు:**
${tomorrowRain > 40 ? '• రేపు వర్ష సూచన ఉన్నందున గొడుగు లేదా రెయిన్‌కోట్ వెంట ఉంచుకోండి.' : '• రేపు వాతావరణం అనుకూలంగా ఉండే అవకాశం ఉంది.'}
${uvIndex >= 7 ? '• మధ్యాహ్నం 12 నుండి 3 గంటల మధ్య ఎండ తీవ్రత ఎక్కువగా ఉంటుంది, కాబట్టి తగినంత నీరు త్రాగండి.' : '• సాధారణ వాతావరణ నిబంధనలు పాటించండి.'}

*(గమనిక: ఇది తాజా మోడల్ విశ్లేషణ. అత్యవసర నిర్ణయాలకు స్థానిక అధికారిక హెచ్చరికలను గమనించండి).*`,
      isContextual: true,
      language: 'te'
    };
  }

  // 2. College event / Outdoor gathering
  if (query.includes('college event') || query.includes('outdoor event') || query.includes('event tomorrow') || query.includes('rain tomorrow')) {
    const isRisky = tomorrowRain >= 40;
    return {
      text: `### Event Feasibility Assessment for **${location}** (Tomorrow)

• **Forecast Condition:** ${tomorrowCondition}
• **Precipitation Probability:** **${tomorrowRain}%**
• **Expected High:** ${tomorrowMax}°C | **Wind:** ~${tomorrowForecast?.windSpeed ?? 14} km/h

**Operational Recommendation:**
${isRisky 
  ? `⚠️ **Elevated Rain Risk (${tomorrowRain}%)**: Outdoor stage electricals, acoustic setups, and seating should have a covered backup or waterproofing canopy. Consider staging main formal proceedings under sheltered pavilions, particularly during peak afternoon convective windows.`
  : `✅ **Favorable Outdoor Conditions**: Tomorrow shows a low rain probability (${tomorrowRain}%). However, ensure shade structures or hydration points are available if daytime temperatures peak near ${tomorrowMax}°C.`}

*Important Note: Convective showers can develop locally. We advise checking the live radar 2 hours prior to start time; zero weather risk is never guaranteed.*`,
      isContextual: true
    };
  }

  // 3. Travel timing (morning vs evening)
  if (query.includes('travelling') || query.includes('travel') || query.includes('morning or evening') || query.includes('better for travelling')) {
    const morningTemp = weatherData?.hourly?.[1]?.temp ?? Math.round(currentTemp - 3);
    const eveningTemp = weatherData?.hourly?.[6]?.temp ?? Math.round(currentTemp);
    const eveningRain = weatherData?.hourly?.[6]?.precipProb ?? 25;

    return {
      text: `### Travel Timing Analysis for **${location}**

Comparing travel windows:

1. **Morning Window (06:00 – 10:00)**:
   • Temperatures: ~${morningTemp}°C (Cooler, calm air)
   • Visibility: Good to Moderate
   • Precipitation Risk: Lower (~10–15%)
   • Road Comfort: Optimal for long-distance highway driving or transit.

2. **Evening Window (16:30 – 20:00)**:
   • Temperatures: ~${eveningTemp}°C
   • Precipitation Risk: ${eveningRain}% (Slight convective shower potential)
   • Road Comfort: Possible commuter traffic and reduced dusk visibility.

**Recommendation:** **Morning departure is preferable**. It minimizes both thermal stress and the likelihood of late-afternoon localized shower delays.`,
      isContextual: true
    };
  }

  // 4. Precautions
  if (query.includes('precaution') || query.includes('safety') || query.includes('what should i take')) {
    const precautions = [];
    if (uvIndex >= 6) {
      precautions.push(`• **UV Protection**: UV index is currently **${uvIndex}** (High). Apply SPF 30+ sunscreen and wear UV-rated sunglasses between 11:00 AM and 03:30 PM.`);
    }
    if (currentTemp >= 32) {
      precautions.push(`• **Hydration**: Ambient temperatures are high (${currentTemp}°C). Maintain electrolyte intake and avoid prolonged unshaded exertion.`);
    } else if (currentTemp <= 12) {
      precautions.push(`• **Thermal Layering**: Low temperatures (${currentTemp}°C). Wear wind-resistant insulating layers.`);
    }
    if (windSpeed >= 25) {
      precautions.push(`• **Wind Gusts**: Gusty conditions at ${windSpeed} km/h. Secure lightweight structures and exercise caution with two-wheelers on flyovers.`);
    }
    if (precautions.length === 0) {
      precautions.push(`• **General Vigilance**: Weather metrics are currently within moderate baseline parameters.`);
    }

    return {
      text: `### Recommended Precautions for **${location}**\n\n${precautions.join('\n\n')}\n\n*Review official meteorological bulletins if carrying out industrial or hazardous height work.*`,
      isContextual: true
    };
  }

  // 5. Explain weather warning in simple English
  if (query.includes('warning') || query.includes('explain') || query.includes('alert')) {
    const alert = activeAlerts[0];
    if (alert) {
      return {
        text: `### Plain-English Breakdown: ${alert.title}

**What is happening?**
${alert.description}

**In simple terms:**
The atmosphere has pockets of unstable hot air meeting cooler air currents, creating fast-moving storm clouds. This can suddenly bring sudden hard rains, lightning strikes, and sharp bursts of strong wind that can knock down branches or loose metal sheets.

**What should you do right now?**
1. Do not stand under solitary tall trees or electric poles.
2. Put vehicles inside garages or away from old trees.
3. Keep mobile phones charged in case of brief local power grid interruptions.

*Classification: ${alert.typeLabel} (Issued by ${alert.source})*`,
        isContextual: true
      };
    } else {
      return {
        text: `Currently, there are **no active official severe warnings** recorded for **${location}**. Atmospheric indicators are operating under normal seasonal tolerances. If an official advisory is issued by regional meteorological departments, it will appear in the Alerts panel immediately.`,
        isContextual: true
      };
    }
  }

  // Default context-aware general assistant response
  return {
    text: `Based on the latest data for **${location}**:

• **Current State:** ${currentCondition} at ${currentTemp}°C (Feels like ${weatherData?.current?.feelsLike ?? currentTemp}°C).
• **Humidity & Wind:** ${weatherData?.current?.humidity}% relative humidity with ${weatherData?.current?.windDirectionText || 'variable'} winds at ${windSpeed} km/h.
• **Short-Term Outlook:** Next 24 hours anticipate mild diurnal variance with rain probability peaking around ${tomorrowRain}%.

Feel free to ask specific questions about outdoor event planning, optimal travel departure hours, required personal safety gear, or request an explanation in **Telugu**!`,
    isContextual: true
  };
}
