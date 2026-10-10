import { config } from '../config/env.js';

export async function handleFarmerAiChat(req, res, next) {
  try {
    const { prompt, lang = 'te', weather = {}, farm = {}, advisory = {}, history = [] } = req.body;
    const geminiApiKey = config.geminiApiKey;

    // Check if secret Gemini API key is configured
    if (geminiApiKey && geminiApiKey.length > 10) {
      try {
        const cropName = advisory.crop?.name || farm.cropId || 'Crop';
        const stageName = advisory.stage?.name || 'Active Vegetative';
        const locName = weather.location?.name || 'Selected Farm';
        const soilMoist = advisory.metrics?.soilMoisturePercent ?? 24;
        const rain48h = advisory.metrics?.next48hRainMm ?? 0;
        const rain7d = advisory.metrics?.next7DaysRainMm ?? 0;
        const et0 = advisory.metrics?.et0Today ?? 4.8;
        const temp = weather.current?.temperature ?? 28;
        const wind = weather.current?.windSpeed ?? 10;
        const humidity = weather.current?.humidity ?? 55;

        const langInstructions = 
          lang === 'te' ? 'Respond in clear, respectful, natural Telugu (తెలుగు) using common agricultural terminology.' :
          lang === 'hi' ? 'Respond in simple, respectful, practical Hindi (हिन्दी) suited for Indian farmers.' :
          lang === 'kn' ? 'Respond in conversational, respectful Kannada (ಕನ್ನಡ).' :
          lang === 'ta' ? 'Respond in practical, respectful Tamil (தமிழ்).' :
          lang === 'mr' ? 'Respond in natural, respectful Marathi (मराठी).' :
          'Respond in concise, practical English with bulleted actions.';

        const systemPrompt = `You are an expert Agronomist and AI Farm Advisor assisting an Indian farmer.
Telemetry & Field Conditions:
- Farm Location: ${locName}
- Crop: ${cropName} (Growth Stage: ${stageName})
- Soil: ${advisory.soilType?.name || 'Loam'}, Irrigation: ${advisory.irrigation?.name || 'Scheduled'}
- Current Weather: Temp ${temp}°C, Humidity ${humidity}%, Wind ${wind} km/h
- Soil Telemetry: Topsoil Moisture ~${soilMoist}%, Reference Evapotranspiration (ET0) ~${et0} mm/day
- Rainfall Horizon: Next 48h ~${rain48h} mm, 7-Day Total ~${rain7d} mm

Guidelines:
1. ${langInstructions}
2. Keep the answer direct, practical, and under 120 words.
3. Base your advice firmly on the provided weather & soil telemetry. Never invent rain or false measurements.
4. Distinguish model predictions from statutory alerts. Never prescribe unregistered chemical doses without caution.`;

        const contents = [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nFarmer Question: ${prompt}` }]
          }
        ];

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 500
            }
          }),
          signal: AbortSignal.timeout(10000)
        });

        if (response.ok) {
          const data = await response.json();
          const answerText = data.candidates?.[0]?.content?.parts?.[0]?.text;

          if (answerText) {
            return res.json({
              success: true,
              answer: answerText,
              provider: 'Google Gemini 1.5 Flash (via Express Backend)',
              isLlm: true
            });
          }
        } else {
          console.warn(`[FarmerController] Gemini API returned HTTP ${response.status}`);
        }
      } catch (geminiErr) {
        console.warn('[FarmerController] Gemini request error:', geminiErr.message);
      }
    }

    // Graceful zero-key fallback response informing the client to engage the local agronomic engine
    return res.json({
      success: false,
      fallback: true,
      isKeyConfigured: Boolean(geminiApiKey && geminiApiKey.length > 10),
      message: 'Gemini API key not configured or unreachable. Utilizing local Agronomic Intelligence Engine.',
      provider: 'Local Indian Agrometeorological Reasoning Engine'
    });
  } catch (err) {
    next(err);
  }
}
