import { config } from '../config/env.js';

export async function handleGetImdWarnings(req, res, next) {
  try {
    const imdApiKey = config.imdApiKey;

    if (imdApiKey && imdApiKey.length > 5) {
      try {
        const imdUrl = 'https://api.imd.gov.in/api/v1/districtwarning';
        const imdResponse = await fetch(imdUrl, {
          headers: { 'x-api-key': imdApiKey },
          signal: AbortSignal.timeout(6000)
        });

        if (imdResponse.ok) {
          const data = await imdResponse.json();
          return res.json({
            success: true,
            isConfigured: true,
            authority: 'India Meteorological Department (Ministry of Earth Sciences)',
            data
          });
        }
      } catch (err) {
        console.warn('[AlertController] IMD warning query failed:', err.message);
      }
    }

    // Authentic status informing caller of IMD data portal credentials required
    return res.json({
      success: false,
      isConfigured: Boolean(imdApiKey && imdApiKey.length > 5),
      authority: 'India Meteorological Department (Ministry of Earth Sciences)',
      status: 'AUTH_REQUIRED',
      message: 'Official IMD National Highway and District nowcasts require government authentication credentials registered with the Ministry of Earth Sciences Data Portal.',
      docUrl: 'https://api.imd.gov.in/public/api_reference.html'
    });
  } catch (err) {
    next(err);
  }
}
